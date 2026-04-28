import { createServer } from "http";
import app from "./app";
import { initSocketServer } from "./sockets/socket.server";
import { connectDB, disconnectDB } from "./db/db";

const server = createServer(app);

let io: any;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Initialize Socket.IO
    io = initSocketServer(server);
    
    // Start listening
    server.listen(3001, () => {
      console.log("Server running on port 3001");
    });
    
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      server.close(async () => {
        console.log("Server closed");
        await disconnectDB();
        process.exit(0);
      });
    };
    
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();