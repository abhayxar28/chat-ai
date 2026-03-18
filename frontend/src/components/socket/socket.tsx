import { useEffect, useRef, useState, useCallback } from "react";
import { useMessages } from "../../hooks/useMessages";
import { useActiveChat } from "../../context/activateChatContext";
import { SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTextarea } from "../../hooks/useTextarea";
import { useChatUI } from "../../hooks/useChatUI";
import type { MessageType } from "../../types/message.types";
import { useSocket } from "../../hooks/useSocket";
import { useProfile } from "../../hooks/useProfile";
import { useTypingChat } from "../../context/typingChatContext";
import ObjectId from "bson-objectid";
import type { ChatType } from "../../types/chat.types";
import { useChats } from "../../hooks/useChats";

interface AiMessageResponse {
  content: string;
  chat: string;
}

export default function Socket() {
  const { loading, messages, setMessages } = useMessages();
  const { user } = useProfile();
  const { activeChat, setActiveChat } = useActiveChat();
  const { addChat, setChats } = useChats();
  const { socket, isConnected } = useSocket();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingChatId, setTypingChatId } = useTypingChat();
  const { handleKeyDown, adjustTextareaHeight } = useTextarea();
  
  useChatUI(messages, messagesEndRef);
  
  const userId = user?.id || "";
  const chatId = activeChat || "";
  const isSendDisabled = loading || typingChatId === chatId || !isConnected;

  const getTemporaryChatId = useCallback(() => ObjectId().toHexString(), []);
  const currentTempChatRef = useRef<string | null>(null);

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || loading || !socket || !isConnected) return;

    let chatIdToUse = activeChat;

    if (!chatIdToUse) {
      const tempChatId = getTemporaryChatId();
      currentTempChatRef.current = tempChatId;
      chatIdToUse = tempChatId;

      addChat({
        _id: tempChatId,
        user: userId,
        title: input.slice(0, 20),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setActiveChat(tempChatId);
    }

    const messageContent = input;
    setInput("");

    const userMessage: MessageType = {
      _id: ObjectId().toHexString(),
      content: messageContent,
      user: userId,
      role: "user",
      chat: chatIdToUse,
    };

    setMessages((prev) => [...prev, userMessage]);
    setTypingChatId(chatIdToUse);

    socket.emit("ai-message", {
      chat: chatIdToUse,
      content: messageContent,
    });
  }, [
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
  ]);

  const handleAiResponse = useCallback((response: AiMessageResponse) => {

    if (response.chat !== activeChat && response.chat !== currentTempChatRef.current) {
      return;
    }
    const aiMessage: MessageType = {
      _id: ObjectId().toHexString(),
      content: response.content,
      role: "model",
      user: userId,
      chat: response.chat,
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setTypingChatId(null);
  }, [activeChat, userId, setMessages, setTypingChatId]);

  const handleCreatedChat = (chat: ChatType) => {
    const tempId = currentTempChatRef.current;

    if (typingChatId === tempId) {
      setTypingChatId(chat._id);
    }

    setChats(prev => prev.map(c => c._id === tempId ? chat : c));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.chat === tempId ? { ...msg, chat: chat._id } : msg
      )
    );

    setActiveChat(chat._id);

    setTimeout(() => {
      currentTempChatRef.current = null;
    }, 0);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("ai-message-response", handleAiResponse);
    socket.on("chat-created", handleCreatedChat);

    return () => {
      socket.off("ai-message-response", handleAiResponse);
      socket.off("chat-created", handleCreatedChat);
    };
  }, [socket, handleAiResponse, handleCreatedChat]);

  const chatIdToUse = activeChat

  const visibleMessages = messages.filter(
    (msg) => msg.chat === chatIdToUse
  );

  useEffect(() => {
    setTypingChatId(null);
  },[activeChat])

  return (
    <div className="flex flex-col h-full">
      <section className="flex-1 overflow-y-auto p-8 space-y-8">
        {visibleMessages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Start a conversation!
          </div>
        ) : (
          visibleMessages.map((msg) => (
            <article
              key={msg._id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl p-6 rounded-3xl ${
                  msg.role === "user"
                    ? "bg-blue-500 rounded-br-md"
                    : "bg-gray-800 rounded-bl-md"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-900 px-2 py-1 rounded font-mono text-xs">
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

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-3xl p-6">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        {typingChatId && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-3xl p-6 flex space-x-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      <footer className="border-t border-gray-700/50 p-6">
        <div className="max-w-4xl mx-auto flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={(e) => handleKeyDown(e, handleSendMessage)}
            placeholder={
              !isConnected 
                ? "Socket disconnected" 
                : !activeChat 
                  ? "Select a chat or send first message" 
                  : "Send a message..."
            }
            className="flex-1 bg-gray-800 border border-gray-600 rounded-3xl p-5 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 overflow-y-auto hide-scrollbar max-h-32 transition-all duration-200"
            rows={1}
            disabled={isSendDisabled}
          />

          <button
            onClick={handleSendMessage}
            className={`p-4 rounded-2xl transition-all duration-200 shrink-0 ${
              isConnected 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-600 cursor-not-allowed"
            }`}
            disabled={isSendDisabled}
            title={isConnected ? "Send message" : "Socket disconnected"}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
