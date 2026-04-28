import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    if (socketRef.current) return;

    const url = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_BACKEND_URL;

    if (!url) {
      console.error("[Socket] No socket URL configured. Set VITE_SOCKET_URL or VITE_BACKEND_URL");
      setIsConnected(false);
      return;
    }

    console.log("[Socket] Connecting to", url);

    const newSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected successfully");
      setIsConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      console.log("[Socket] Disconnecting socket");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []); 

  return { socket, isConnected };
};
