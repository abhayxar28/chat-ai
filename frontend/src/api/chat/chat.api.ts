import type {ChatType } from "../../types/chat.types";
import { api } from "../api";

export const getChats = async(): Promise<ChatType[]>=>{
    const res = await api.get("/chats/",{
        withCredentials: true
    });
    return res.data.chats
}

export const updateChatApi = async(chatId: string, title: string): Promise<ChatType>=>{
    const res = await api.patch(`/chats/${chatId}`, {
            title
        }, {
            withCredentials: true 
        }
    );
    return res.data.chat;
}

export const deleteChatApi = async(chatId: string): Promise<void>=>{
    await api.delete(`/chats/${chatId}`, {
        withCredentials: true
    });
}   