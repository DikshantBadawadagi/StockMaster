import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMoveHistory } from '../controllers/moves.controller.js';

const router = express.Router();
// Protected route to get move history
router.get('/history', protect, getMoveHistory);    
export default router;