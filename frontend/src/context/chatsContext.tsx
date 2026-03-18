
import { createContext, useContext, useState } from "react";
import type { ChatType } from "../types/chat.types";


interface ChatsContextType {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

const ChatsContext = createContext<ChatsContextType | null>(null);

export const ChatsProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<ChatType[]>([]);

  return (
    <ChatsContext.Provider value={{ chats, setChats }}>
      {children}
    </ChatsContext.Provider>
  );
};

export const useChatsContext = () => {
  const context = useContext(ChatsContext);
  if (!context) throw new Error("useChatsContext must be used inside provider");
  return context;
};