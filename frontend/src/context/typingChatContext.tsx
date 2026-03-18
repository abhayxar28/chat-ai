
import { createContext, useContext, useState } from "react";

type TypingContextType = {
  typingChatId: string | null;
  setTypingChatId: React.Dispatch<React.SetStateAction<string | null>>;
};

const TypingContext = createContext<TypingContextType | null>(null);

export function TypingProvider({ children }: { children: React.ReactNode }) {
  const [typingChatId, setTypingChatId] = useState<string | null>(null);

  return (
    <TypingContext.Provider value={{ typingChatId, setTypingChatId }}>
      {children}
    </TypingContext.Provider>
  );
}


export const useTypingChat = () => {
  const context = useContext(TypingContext);

  if (!context) {
    throw new Error("useTypingChat must be used within TypingProvider");
  }

  return context;
};