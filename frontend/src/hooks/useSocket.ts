import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    if (socketRef.current) return;

    const url = import.meta.env.VITE_SOCKET_URL;

    if (!url) {
      return;
    }

    const newSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("connect_error", () => {
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  return { socket, isConnected };
};
