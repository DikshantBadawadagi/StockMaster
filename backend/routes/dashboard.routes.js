import express from 'express';
import { getKpis } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected route to get KPIs
router.get('/kpis', protect, getKpis);
export default router;