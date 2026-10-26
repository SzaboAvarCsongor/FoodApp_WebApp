import express from 'express';
import { register, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.get('/me', requireAuth, me);

export default router;