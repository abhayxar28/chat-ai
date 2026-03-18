import { useCallback } from "react";

export function useTextarea() {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, onSend: () => void) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    []
  );

  const adjustTextareaHeight = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
    },
    []
  );

  return { handleKeyDown, adjustTextareaHeight };
}