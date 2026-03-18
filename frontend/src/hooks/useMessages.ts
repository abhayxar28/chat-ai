import { useEffect, useState } from "react";
import type { MessageType } from "../types/message.types";
import { getMessages } from "../api/messages/messages.api";
import { useActiveChat } from "../context/activateChatContext";

export const useMessages = () => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const { activeChat } = useActiveChat();

    const fetchMessages = async () => {
        if (!activeChat) return;

        setLoading(true);
        try {
            const data = await getMessages(activeChat);
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!activeChat) {
            setMessages([]); 
            return;
        }

        fetchMessages();
    }, [activeChat]);

  return { loading, messages, setMessages };
};