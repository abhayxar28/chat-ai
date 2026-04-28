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
            <div className="flex flex-1 items-center justify-center p-4">
                <p className="text-sm text-slate-400">Loading chats...</p>
            </div>
        )
    }

    if(chats.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-4">
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
                    No chats yet. Start a new conversation!
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-1.5">
            {chats.map((chat) => {
                const isEditing = editingId === chat._id;

                return (
                    <div
                        key={chat._id}
                        className={`group flex items-center justify-between rounded-2xl border px-3 py-3 transition ${activeChat === chat._id ? "border-white/15 bg-white/8" : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/5"}`}
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
                                    className="w-full rounded-xl border border-white/10 bg-[#111111] px-2 py-1 outline-none"
                                />
                            ) : (
                                <p className="truncate text-sm text-stone-100">{chat.title}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 transition group-hover:opacity-100">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => handleSave(chat._id)}
                                        className="p-1 text-stone-400 hover:text-stone-100"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 text-stone-400 hover:text-stone-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleEdit(chat)}
                                        className="p-1 text-stone-500 hover:text-stone-100"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(chat._id)}
                                        className="p-1 text-stone-500 hover:text-stone-100"
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
