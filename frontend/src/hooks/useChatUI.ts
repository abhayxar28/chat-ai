import { useCallback, useEffect, type RefObject } from "react";

export function useChatUI(
  messages: any[],
  messagesEndRef: RefObject<HTMLDivElement | null>
) {
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {};
}