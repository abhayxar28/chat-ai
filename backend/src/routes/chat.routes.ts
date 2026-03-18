import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { createChat, deleteChat, getAllChats, getMessages, updateChat } from '../controllers/chat.controllers';


const router = express.Router();

router.post('/', authenticateJWT, createChat);
router.get('/', authenticateJWT, getAllChats);
router.get('/messages/:chatId', authenticateJWT, getMessages);
router.patch('/:chatId', authenticateJWT, updateChat);
router.delete('/:chatId', authenticateJWT, deleteChat);

export default router