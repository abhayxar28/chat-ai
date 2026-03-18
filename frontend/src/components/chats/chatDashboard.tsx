import Profile from "../profile/profile";
import Socket from "../socket/socket";
import ChatList from "./chatList";
import CreateChat from "./createChat";

export default function ChatDashboard() {
  return (
    <div className="flex h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <aside className="w-80 bg-gray-850/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <CreateChat />
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <ChatList/>
        </nav>


        <div className="p-6 border-t border-gray-700/50">
          <Profile/>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-850/50 border-b border-gray-700/50 p-6 text-center">
          <h1 className="text-2xl font-bold">ChatAI</h1>
        </header>
        <div className="flex-1 min-h-0">
          <Socket/>
        </div>

      </main>
    </div>
  )
}
