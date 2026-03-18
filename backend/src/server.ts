import { createServer } from "http";
import app from "./app";
import { initSocketServer } from "./sockets/socket.server";

const server = createServer(app);

initSocketServer(server);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});