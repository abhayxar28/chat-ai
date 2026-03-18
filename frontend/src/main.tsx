import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';
import { ActivateChatProvider } from './context/activateChatContext.tsx';
import { TypingProvider } from './context/typingChatContext.tsx';
import { ChatsProvider } from './context/chatsContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <ChatsProvider>
      <ActivateChatProvider>
        <TypingProvider>
          <App />
          <Toaster/>
        </TypingProvider>
      </ActivateChatProvider>
    </ChatsProvider>
  </StrictMode>,
)
