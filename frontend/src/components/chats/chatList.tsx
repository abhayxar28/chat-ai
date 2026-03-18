import { useChats } from "../../hooks/useChats";
import { useActiveChat } from "../../context/activateChatContext";
import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { ChatType } from "../../types/chat.types";
import toast from "react-hot-toast";

export default function ChatList() {
    const { chats, loading, deleteChat, fetchChats, updateChat } = useChats();
    const { activeChat, setActiveChat } = useActiveChat();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleEdit = (chat: ChatType) => {
        setEditingId(chat._id);
        setEditValue(chat.title);
    };

    const handleSave = async (chatId: string) => {
        if (!editValue.trim()) return;

        const updatedChat: ChatType = {
            _id: chatId,
            title: editValue,
        } as ChatType;

        await updateChat(updatedChat);
        setEditingId(null);
    };

    const handleDelete = async (chatId: string) => {
        try {
            await deleteChat(chatId);
            toast.success("Chat deleted successfully");
            fetchChats();
        } catch (error) {
            toast.error("Failed to delete chat");
        }
    };

    if(loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-gray-500">Loading chats...</p>
            </div>
        )
    }

    if(chats.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-gray-500">No chats yet. Start a new conversation!</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {chats.map((chat) => {
                const isEditing = editingId === chat._id;

                return (
                    <div
                        key={chat._id}
                        className={`group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-700/60 transition ${activeChat === chat._id ? "bg-gray-700/60" : ""}`}
                    >
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => !isEditing && setActiveChat(chat._id)}
                        >
                            {isEditing ? (
                                <input
                                    value={editValue}
                                    autoFocus
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSave(chat._id);
                                        if (e.key === "Escape") setEditingId(null);
                                    }}
                                    className="w-full bg-gray-800 px-2 py-1 rounded outline-none"
                                />
                            ) : (
                                <p className="text-sm truncate">{chat.title}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => handleSave(chat._id)}
                                        className="p-1 hover:text-green-400"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 hover:text-red-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleEdit(chat)}
                                        className="p-1 hover:text-blue-400"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(chat._id)}
                                        className="p-1 hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
