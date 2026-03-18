import type { MessageType } from "../../types/message.types";
import { api } from "../api";

export const getMessages = async(chatId: string): Promise<MessageType[]>=>{
    const res = await api.get(`chats/messages/${chatId}`, {
        withCredentials: true
    });
    return res.data.messages
}