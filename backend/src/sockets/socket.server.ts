import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import { validateUserToken } from "../services/tokens.services";
import { userModel } from "../models/user.models";
import {messageModel} from '../models/message.model';
import { generateResponse, generateVector } from "../services/ai.services";
import { createMemory, queryMemory } from "../services/vector.services";
import { chatModel } from "../models/chat.models";
import {tavily} from "@tavily/core";
import { PROMPT_TEMPLATE } from "../prompts";

interface StructuredAiResponse {
    answer: string;
    followUps: string[];
}

function extractStructuredResponse(rawResponse: string): StructuredAiResponse {
    const fallback: StructuredAiResponse = {
        answer: rawResponse.trim(),
        followUps: [],
    };

    const trimmed = rawResponse.trim();

    const tryParseJson = (value: string): StructuredAiResponse | null => {
        try {
            const parsed = JSON.parse(value);

            if (!parsed || typeof parsed !== "object") {
                return null;
            }

            const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
            const followUps = Array.isArray(parsed.followUps)
                ? parsed.followUps.map((item: unknown) => String(item).trim()).filter(Boolean).slice(0, 4)
                : [];

            if (!answer) {
                return null;
            }

            return { answer, followUps };
        } catch {
            return null;
        }
    };

    const direct = tryParseJson(trimmed);
    if (direct) {
        return direct;
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        const fenced = tryParseJson(fencedMatch[1].trim());
        if (fenced) {
            return fenced;
        }
    }

    const answerMatch = trimmed.match(/<ANSWER>([\s\S]*?)<\/ANSWER>/i);
    const followUpsMatch = trimmed.match(/<FOLLOW_UP_QUESTIONS>([\s\S]*?)<\/FOLLOW_UP_QUESTIONS>/i);

    if (answerMatch) {
        const answer = answerMatch[1].trim();
        const followUps: string[] = [];

        if (followUpsMatch?.[1]) {
            const questionMatches = [...followUpsMatch[1].matchAll(/<question>([\s\S]*?)<\/question>/gi)];

            for (const match of questionMatches) {
                const question = match[1].trim();
                if (question) {
                    followUps.push(question);
                }
            }
        }

        return {
            answer,
            followUps: followUps.slice(0, 4),
        };
    }

    return fallback;
}

export function initSocketServer(server: HttpServer) {

    const client = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL!,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.use(async(socket: Socket, next)=>{
        const cookies = parse(socket.handshake.headers?.cookie || "");

        if(!cookies.token){
            return next(new Error('Authentication error: No token provided'))
        }

        try {
            const decoded = validateUserToken(cookies.token as string);
            const user = await userModel.findById(decoded?.id).select('-password');

            if(!user){
                return next(new Error('Authentication error: User not found'))
            }
            socket.data.user = user
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'))  
        }
    })


    io.on('connection', (socket) => {
        socket.on('ai-message', async (data) => {
            try {
                let chatId = data.chat;

                const chat = await chatModel.findById(chatId);

                if (!chat) {
                    const newChat = await chatModel.create({
                        title: data.content.slice(0, 20),
                        user: socket.data.user.id,
                    });

                    chatId = newChat._id.toString();
                    socket.emit("chat-created", {
                        _id: chatId,
                        title: newChat.title,
                        user: socket.data.user.id,
                    });
                }

                const message = await messageModel.create({
                    chat: chatId,
                    user: socket.data.user?.id,
                    content: data.content,
                    role: "user",
                });

                let vectors: number[] = [];
                try {
                    vectors = await generateVector(data.content);
                } catch (error) {
                    console.error("[Socket] Vector generation failed, continuing without memory:", error);
                }

                if (vectors.length > 0) {
                    await createMemory({
                        vectors,
                        messageId: String(message._id),
                        metadata: {
                            chat: chatId,
                            user: socket.data.user.id,
                            text: data.content,
                        },
                    }).catch((err) => console.error("[Socket] Error storing memory:", err));
                }

                let memory: any[] = [];
                if (vectors.length > 0) {
                    try {
                        memory = await queryMemory({
                            queryVector: vectors,
                            limit: 3,
                            metadata: {
                                user: socket.data.user.id,
                            },
                        });
                    } catch (err) {
                        console.error("[Socket] Error querying memory:", err);
                    }
                }

                const chatHistory = (await messageModel.find({ chat: chatId }).sort({ createdAt: -1 }).limit(20).lean()).reverse();

                const stm = chatHistory.map((message) => ({
                    role: message.role,
                    parts: [{ text: message.content }],
                }));

                const ltm = [
                    {
                        role: "user",
                        parts: [{
                            text: `
                        these are some previous messages from the chats, use them to generate a response
                        
                        ${memory.map((item) => item?.metadata?.text).join("\n")}
                    ` }],
                    },
                ];

                let searchResults = { results: [] } as any;
                let sources: { title: string; url?: string }[] = [];

                if (client) {
                    try {
                        searchResults = await client.search(data.content, {
                            searchDepth: "advanced",
                            includeImages: true,
                        });

                        sources = (searchResults.results || []).map((result: any) => ({
                            title: result.title,
                            url: result.url,
                        }));
                    } catch (err) {
                        searchResults = { results: [] };
                        sources = [];
                    }
                }

                let prompt: string;
                try {
                    prompt = PROMPT_TEMPLATE.replace(
                        "{{WEB_SEARCH_RESPONSE}}",
                        JSON.stringify(searchResults)
                    ).replace("{{USER_QUERY}}", data.content);
                } catch (err) {
                    prompt = PROMPT_TEMPLATE.replace(
                        "{{WEB_SEARCH_RESPONSE}}",
                        JSON.stringify({ results: [] })
                    ).replace("{{USER_QUERY}}", data.content);
                }

                const contextMessages = [
                    ...stm,
                    ...ltm,
                    { role: "system", parts: [{ text: prompt }] },
                ];

                const response = await generateResponse(contextMessages);

                if (!response) {
                    throw new Error("No response");
                }

                const structuredResponse = extractStructuredResponse(response);

                socket.emit("ai-message-response", {
                    chat: chatId,
                    content: structuredResponse.answer,
                    answer: structuredResponse.answer,
                    followUps: structuredResponse.followUps,
                    sources,
                });

                const responseMessage = await messageModel.create({
                    chat: chatId,
                    user: socket.data.user.id,
                    content: structuredResponse.answer,
                    role: "model",
                });

                let responseVectors: number[] = [];
                try {
                    responseVectors = await generateVector(structuredResponse.answer);
                } catch (error) {
                    console.error("[Socket] Response vector generation failed:", error);
                }

                if (responseVectors.length > 0) {
                    await createMemory({
                        vectors: responseVectors,
                        messageId: String(responseMessage._id),
                        metadata: {
                            chat: chatId,
                            user: socket.data.user.id,
                            text: structuredResponse.answer,
                        },
                    }).catch((err) => console.error("[Socket] Error storing response memory:", err));
                }

                if (structuredResponse.followUps.length > 0) {
                    try {
                        for (const followUp of structuredResponse.followUps) {
                            const followUpMessageDoc = await messageModel.create({
                                chat: chatId,
                                user: socket.data.user.id,
                                content: followUp,
                                role: "system",
                            });

                            let followUpVectors: number[] = [];
                            try {
                                followUpVectors = await generateVector(followUp);
                            } catch (error) {
                                console.error("[Socket] Follow-up vector generation failed:", error);
                            }

                            if (followUpVectors.length > 0) {
                                await createMemory({
                                    vectors: followUpVectors,
                                    messageId: String(followUpMessageDoc._id),
                                    metadata: {
                                        chat: chatId,
                                        user: socket.data.user.id,
                                        text: followUp,
                                    },
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Error storing follow-up questions:", err);
                    }
                }
            } catch (error) {
                console.error("[Socket] ai-message handler failed:", error);
                socket.emit("ai-message-error", {
                    chat: data.chat,
                    message: "Sorry, I could not generate a response right now.",
                });
            }
        });
    });

    return io;
}