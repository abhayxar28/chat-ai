import { createContext, useContext, useState } from "react";

type ActivateChatContextType = {
  activeChat: string | null;
  setActiveChat: React.Dispatch<React.SetStateAction<string | null>>;
};

const ActivateChatContext = createContext<ActivateChatContextType | null>(null);

export function ActivateChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <ActivateChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActivateChatContext.Provider>
  );
}


export const useActiveChat = () => {
  const context = useContext(ActivateChatContext);

  if (!context) {
    throw new Error("useActiveChat must be used within ActivateChatProvider");
  }

  return context;
};