
export interface MessageType {
    _id: string;
    chat: string;
    user: string;
    content: string;
    role: "user" | "model",
    createdAt?: string;
    updatedAt?: string;
}
