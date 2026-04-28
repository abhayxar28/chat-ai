import Profile from "../profile/profile";
import Socket from "../socket/socket";
import ChatList from "./chatList";
import CreateChat from "./createChat";

export default function ChatDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#111111] text-white">
      <aside className="flex w-80 flex-col border-r border-white/10 bg-[#161616]">
        <div className="border-b border-white/10 p-5">
          <CreateChat />
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ChatList/>
        </nav>


        <div className="border-t border-white/10 p-4">
          <Profile/>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-white/10 bg-[#111111] px-6 py-4 backdrop-blur-xl">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 shadow-lg shadow-black/20">
            <span className="h-2 w-2 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.45)]" />
            ChatAI
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <Socket/>
        </div>

      </main>
    </div>
  )
}
