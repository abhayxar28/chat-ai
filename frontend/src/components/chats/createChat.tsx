import { useActiveChat } from '../../context/activateChatContext';
import { useTypingChat } from '../../context/typingChatContext';
import { useMessages } from '../../hooks/useMessages';


export default function CreateChat() {
    const { setActiveChat } = useActiveChat();
    const { setMessages } = useMessages();
    const { setTypingChatId } = useTypingChat();

    const handleCreateChat = () => {
        setActiveChat(null);
        setMessages([]);
        setTypingChatId(null);
    };

    return (
        <button
            onClick={handleCreateChat}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm text-white transition cursor-pointer"
        >
            Create Chat
        </button>
    );
}
