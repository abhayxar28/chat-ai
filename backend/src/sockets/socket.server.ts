import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import { validateUserToken } from "../services/tokens.services";
import { userModel } from "../models/user.models";
import {messageModel} from '../models/message.model';
import { generateResponse, generateVector } from "../services/ai.services";
import { createMemory, queryMemory } from "../services/vector.services";
import { chatModel } from "../models/chat.models";

export function initSocketServer(server:HttpServer){
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


    io.on('connection', (socket)=>{
        
        socket.on('ai-message', async(data)=>{
            let chatId = data.chat;

            const chat = await chatModel.findById(chatId);

            if(!chat){
                const newChat = await chatModel.create({
                    title: data.content.slice(0,20),
                    user: socket.data.user.id
                });

                chatId = newChat._id.toString();
                socket.emit("chat-created", {
                    _id: chatId,
                    title: newChat.title,
                    user: socket.data.user.id
                });
                
            }

            const [message, vectors] = await Promise.all([
                messageModel.create({
                    chat: chatId,
                    user: socket.data.user?.id,
                    content: data.content,
                    role: "user"
                }),
                generateVector(data.content)
            ])

            await createMemory({
                vectors,
                messageId: String(message._id),
                metadata: {
                    chat: chatId,
                    user: socket.data.user.id,
                    text: data.content
                }
            })

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        user: socket.data.user.id
                    }
                }),

                (await messageModel.find({chat: chatId}).sort({createdAt: -1}).limit(20).lean()).reverse()
            ])

            const stm = chatHistory.map(message=>({
                role: message.role,
                parts: [{text: message.content}]
            }))

            const ltm = [
                {
                    role: "user",
                    parts: [{text: `
                        these are some previous messages from the chats, use them to generate a response
                        
                        ${memory.map((item)=>item?.metadata?.text).join("\n")}
                    `}]
                }
            ]

            const contextMessages = [...stm, ...ltm];

            const response = await generateResponse(contextMessages);     
            
            if(!response){
                throw new Error("No response")
            }
            
            socket.emit('ai-message-response',{
                chat: chatId,
                content: response
            })

            
            const [responseMessage, responseVectors] = await Promise.all([
                messageModel.create({
                    chat: chatId,
                    user: socket.data.user.id,
                    content: response,
                    role: "model"
                }),
    
                generateVector(response)
            ])

            await createMemory({
                vectors: responseVectors,
                messageId: String(responseMessage._id),
                metadata: {
                    chat: chatId,
                    user: socket.data.user.id,
                    text: response
                }
            })
        })
    })
}