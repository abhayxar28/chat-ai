import express from 'express';
import { loginUser, logoutUser, registerUser, userProfile } from '../controllers/auth.controllers';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateJWT, userProfile);
router.post('/logout', authenticateJWT, logoutUser);

export default router