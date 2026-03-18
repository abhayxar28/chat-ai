import { useEffect, useState } from "react";
import { deleteChatApi, getChats, updateChatApi } from "../api/chat/chat.api";
import { type ChatType } from "../types/chat.types";
import { useChatsContext } from "../context/chatsContext";

export function useChats(){
    const { chats, setChats } = useChatsContext();
    const [loading, setLoading] = useState(false);

    const fetchChats = async()=>{
        setLoading(true);
        try {
            const data = await getChats();
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    }

    const addChat = (chat: ChatType) => {
        setChats(prev => [...prev, chat]);
    }

    const updateChat = async(updatedChat: ChatType) => {
        try {
            await updateChatApi(updatedChat._id, updatedChat.title);
            setChats(prev => prev.map(chat => chat._id === updatedChat._id ? updatedChat : chat));
        } catch (error) {
            console.error("Error updating chat:", error);
        }
    }

    const deleteChat = async(chatId: string) => {
        try {
            await deleteChatApi(chatId);
            setChats(prev => prev.filter(chat => chat._id !== chatId));
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }

    useEffect(()=>{
        fetchChats();
    }, []);

    return { chats, loading, fetchChats, addChat, deleteChat, updateChat, setChats };
}