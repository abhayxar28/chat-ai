
export interface MessageType {
    _id: string;
    chat: string;
    user: string;
    content: string;
    role: "user" | "model" | "system",
    createdAt?: string;
    updatedAt?: string;
}
