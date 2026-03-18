export interface ChatType {
    _id: string;
    user: string;
    title: string;
    lastActivity?:string;
    createdAt?: string,
    updatedAt?: string, 
}

export interface ChatCreateResponse {
    _id: string;
    title: string;
    lastActivity:string
}
