import { useCallback, useEffect, useRef, useState } from "react";
import ObjectId from "bson-objectid";
import { ArrowUp, ChevronDown, Image as ImageIcon, Link2, MessageSquareText, Mic, Plus, Share2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useActiveChat } from "../../context/activateChatContext";
import { useTypingChat } from "../../context/typingChatContext";
import { useChats } from "../../hooks/useChats";
import { useMessages } from "../../hooks/useMessages";
import { useProfile } from "../../hooks/useProfile";
import { useSocket } from "../../hooks/useSocket";
import { useTextarea } from "../../hooks/useTextarea";
import { useChatUI } from "../../hooks/useChatUI";
import type { ChatType } from "../../types/chat.types";
import type { MessageType } from "../../types/message.types";

interface AiMessageResponse {
  answer?: string;
  content: string;
  chat: string;
  followUps?: string[];
  sources?: { title: string; url?: string }[];
}

export default function Socket() {
  const { loading, messages, setMessages } = useMessages();
  const { user } = useProfile();
  const { activeChat, setActiveChat } = useActiveChat();
  const { addChat, setChats } = useChats();
  const { socket, isConnected } = useSocket();
  const [input, setInput] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [sources, setSources] = useState<{ title: string; url?: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"answer" | "links" | "images">("answer");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentTempChatRef = useRef<string | null>(null);
  const lastSentRef = useRef<string | null>(null);
  const { typingChatId, setTypingChatId } = useTypingChat();
  const [aiServiceError, setAiServiceError] = useState<{ message: string; chat: string } | null>(null);
  const { handleKeyDown, adjustTextareaHeight } = useTextarea();

  useChatUI(messages, messagesEndRef);

  const userId = user?.id || "";
  const activeChatId = activeChat || "";
  const isSendDisabled = loading || typingChatId === activeChatId || !isConnected;

  const getTemporaryChatId = useCallback(() => ObjectId().toHexString(), []);

  const handleSendMessage = useCallback(
    (messageText?: string) => {
      const content = (messageText ?? input).trim();

      if (!content || loading || !socket || !isConnected) {
        return;
      }

      let chatIdToUse = activeChat;

      if (!chatIdToUse) {
        const tempChatId = getTemporaryChatId();
        currentTempChatRef.current = tempChatId;
        chatIdToUse = tempChatId;

        addChat({
          _id: tempChatId,
          user: userId,
          title: content.slice(0, 20),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        setActiveChat(tempChatId);
      }

      if (!messageText) {
        setInput("");
      }

      // remember last sent content for retry
      lastSentRef.current = content;

      // clear any previous AI service error when sending
      setAiServiceError(null);

      setFollowUps([]);
      setSources([]);
      setActiveTab("answer");

      const userMessage: MessageType = {
        _id: ObjectId().toHexString(),
        content,
        user: userId,
        role: "user",
        chat: chatIdToUse,
      };

      setMessages((prev) => [...prev, userMessage]);
      setTypingChatId(chatIdToUse);

      console.log("[Socket] Sending message:", { chat: chatIdToUse, content });
      socket.emit("ai-message", {
        chat: chatIdToUse,
        content,
      });
    },
    [
      input,
      loading,
      socket,
      isConnected,
      userId,
      activeChat,
      setMessages,
      setTypingChatId,
      getTemporaryChatId,
      addChat,
      setActiveChat,
    ]
  );

  const handleAiResponse = useCallback(
    (response: AiMessageResponse) => {
      console.log("[Socket] Received AI response:", response);
      
      // Accept response for active chat, temp chat, or any chat (we'll filter by active chat when displaying)
      const isRelevantChat =
        response.chat === activeChat ||
        response.chat === currentTempChatRef.current;

      if (!isRelevantChat) {
        console.log("[Socket] Response ignored (not relevant chat):", { responseChat: response.chat, activeChat, tempChat: currentTempChatRef.current });
        return;
      }

      // detect AI-service-level failure messages and show a retry UI
      if (response.content && response.content.toLowerCase().includes("having trouble reaching the ai service")) {
        console.log("[Socket] AI service error detected:", response.content);
        setAiServiceError({ message: response.content, chat: response.chat });
        setTypingChatId(null);
        return;
      }

      const answerContent = response.answer ?? response.content;

      const aiMessage: MessageType = {
        _id: ObjectId().toHexString(),
        content: answerContent,
        role: "model",
        user: userId,
        chat: response.chat,
      };

      console.log("[Socket] Adding AI message to state:", aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
      setFollowUps(response.followUps ?? []);
      setSources(response.sources ?? []);
      setTypingChatId(null);
    },
    [activeChat, userId, setMessages, setTypingChatId]
  );

  const retryAi = useCallback(() => {
    if (!socket || !lastSentRef.current || !aiServiceError) return;
    console.log("[Socket] Retrying AI message:", { chat: aiServiceError.chat, content: lastSentRef.current });
    setAiServiceError(null);
    setTypingChatId(aiServiceError.chat);
    socket.emit("ai-message", { chat: aiServiceError.chat, content: lastSentRef.current });
  }, [socket, aiServiceError, setTypingChatId]);

  const handleCreatedChat = (chat: ChatType) => {
    const tempId = currentTempChatRef.current;

    if (typingChatId === tempId) {
      setTypingChatId(chat._id);
    }

    if (tempId) {
      setChats((prev) => prev.map((item) => (item._id === tempId ? chat : item)));

      setMessages((prev) =>
        prev.map((msg) => (msg.chat === tempId ? { ...msg, chat: chat._id } : msg))
      );
    }

    setActiveChat(chat._id);
    currentTempChatRef.current = null;
  };

  // Set up socket listeners only once when socket connects
  useEffect(() => {
    if (!socket) return;

    socket.on("ai-message-response", handleAiResponse);
    socket.on("chat-created", handleCreatedChat);

    return () => {
      socket.off("ai-message-response", handleAiResponse);
      socket.off("chat-created", handleCreatedChat);
    };
  }, [socket, handleAiResponse, handleCreatedChat]);

  useEffect(() => {
    setTypingChatId(null);
  }, [activeChat, setTypingChatId]);

  const visibleMessages = messages.filter((msg) => msg.chat === activeChatId);

  return (
    <div className="flex h-full flex-col bg-[#111111] text-stone-100">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111111] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-100 shadow-lg shadow-black/20">
            <MessageSquareText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Answer</div>
            <div className="text-sm font-medium text-stone-100">ChatAI</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {[
            { label: "Answer", icon: MessageSquareText, tab: "answer" as const },
            { label: "Links", icon: Link2, tab: "links" as const },
            { label: "Images", icon: ImageIcon, tab: "images" as const },
          ].map(({ label, icon: Icon, tab }) => {
            const active = activeTab === tab;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20"
                    : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10">
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {activeTab === "links" ? (
            <div className="rounded-4xl border border-white/10 bg-white/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-200">
                <Link2 className="h-4 w-4 text-stone-400" />
                Sources
              </div>
              {sources.length === 0 ? (
                <div className="text-sm text-stone-400">
                  No source links available for this response.
                </div>
              ) : (
                <div className="grid gap-3">
                  {sources.map((source, index) => (
                    <a
                      key={`${source.title}-${index}`}
                      href={source.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-stone-200 transition hover:border-white/20 hover:bg-white/5"
                    >
                      <div className="font-medium text-stone-100 group-hover:text-white">
                        {source.title || source.url || `Source ${index + 1}`}
                      </div>
                      {source.url && (
                        <div className="mt-1 break-all text-xs text-stone-500 group-hover:text-stone-400">
                          {source.url}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {visibleMessages.length === 0 ? (
                <div className="rounded-4xl border border-white/10 bg-white/4 p-10 text-center text-sm text-stone-400 shadow-2xl shadow-black/20 backdrop-blur-sm">
                  Ask a question and the answer will appear here with follow-up ideas.
                </div>
              ) : (
                visibleMessages.map((msg) => (
                  <article
                    key={msg._id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-3xl rounded-4xl border px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-6 sm:py-5 ${
                        msg.role === "user"
                          ? "border-white/10 bg-[#1c1c1c] text-stone-50 rounded-br-md"
                          : "border-white/10 bg-[#141414] text-stone-100 rounded-bl-md"
                      }`}
                    >
                      <div
                        className={
                          msg.role === "model"
                            ? "font-serif text-[1.05rem] leading-relaxed text-stone-100"
                            : "whitespace-pre-wrap text-sm leading-relaxed text-stone-100"
                        }
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            code: ({ children }) => (
                              <code className="rounded bg-black/50 px-2 py-1 font-mono text-xs text-amber-100">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </article>
                ))
              )}

                {aiServiceError && (
                  <div className="rounded-4xl border border-red-500 bg-red-900/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
                    <div className="mb-2 font-medium text-red-100">AI service unreachable</div>
                    <div className="mb-4 text-sm text-red-200">{aiServiceError.message}</div>
                    <div className="flex gap-2">
                      <button onClick={retryAi} className="rounded-full px-4 py-2 bg-red-500 text-white">Retry</button>
                      <button onClick={() => setAiServiceError(null)} className="rounded-full px-4 py-2 bg-white/5 text-white">Dismiss</button>
                    </div>
                  </div>
                )}

              {followUps.length > 0 && (
                <div className="rounded-4xl border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-200">
                    <Sparkles className="h-4 w-4 text-stone-400" />
                    Follow-ups
                  </div>
                  <div className="grid gap-3">
                    {followUps.map((question, index) => (
                      <button
                        key={`${question}-${index}`}
                        type="button"
                        onClick={() => handleSendMessage(question)}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-left text-sm text-stone-200 transition hover:border-white/20 hover:bg-white/5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-stone-300 transition group-hover:bg-white/10">
                          ↳
                        </span>
                        <span className="leading-relaxed">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-4xl border border-white/10 bg-white/4 px-5 py-4 backdrop-blur-sm">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.1s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              {typingChatId && (
                <div className="flex justify-start">
                  <div className="flex rounded-4xl border border-white/10 bg-white/4 px-5 py-4 space-x-1 backdrop-blur-sm">
                    <span className="animate-bounce text-stone-300">.</span>
                    <span className="animate-bounce text-stone-300 [animation-delay:150ms]">.</span>
                    <span className="animate-bounce text-stone-300 [animation-delay:300ms]">.</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}

          {activeTab === "images" && (
            <div className="rounded-4xl border border-white/10 bg-white/4 p-10 text-center text-sm text-stone-400 shadow-2xl shadow-black/20 backdrop-blur-sm">
              Image search is not available yet.
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#111111]/95 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-[1.75rem] border border-white/10 bg-[#171717] p-3 shadow-2xl shadow-black/30">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10"
            title="Add attachment"
          >
            <Plus className="h-5 w-5" />
          </button>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={(e) => handleKeyDown(e, handleSendMessage)}
            placeholder={!isConnected ? "Socket disconnected" : !activeChat ? "Ask anything to start" : "Ask anything..."}
            className="flex-1 max-h-40 resize-none rounded-2xl border border-white/10 bg-[#111111] p-4 text-sm text-stone-100 outline-none transition-all duration-200 placeholder:text-stone-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 overflow-y-auto hide-scrollbar"
            rows={1}
            disabled={isSendDisabled}
          />

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/3 px-3 py-2 text-sm text-stone-400">
            <span>Model</span>
            <ChevronDown className="h-4 w-4" />
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10"
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleSendMessage()}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
              isConnected ? "bg-white text-black hover:bg-stone-200" : "cursor-not-allowed bg-stone-700 text-stone-400"
            }`}
            disabled={isSendDisabled}
            title={isConnected ? "Send message" : "Socket disconnected"}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
