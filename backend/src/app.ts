import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from 'path';
import connectDB from './db/db';
import authRouter from './routes/auth.routes'
import chatRouter from './routes/chat.routes'

const app = express();
connectDB();

app.use(express.json());
app.use(cors({
    credentials: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public/dist')));

app.use("/api/v1/users", authRouter)
app.use("/api/v1/chats", chatRouter)

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dist/index.html"));
});

export default app;


