import { useActiveChat } from '../../context/activateChatContext';
import { useTypingChat } from '../../context/typingChatContext';


export default function CreateChat() {
    const { setActiveChat } = useActiveChat();
    const { setTypingChatId } = useTypingChat();

    const handleCreateChat = () => {
        setActiveChat(null);
        setTypingChatId(null);
    };

    return (
        <button
            onClick={handleCreateChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-stone-100 transition hover:bg-white/10 cursor-pointer"
        >
            <span className="text-lg leading-none">+</span>
            Create Chat
        </button>
    );
}
