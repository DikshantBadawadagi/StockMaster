import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import warehouseRoutes from './routes/warehouses.js';
import productRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import dashboardroutes from './routes/dashboard.routes.js';
import movesRoutes from './routes/moves.routes.js';
import cookieParser from 'cookie-parser';
import receiptRoutes from './routes/receipt.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import internalTransferRoutes from './routes/internalTransfer.routes.js';
import stockAdjustmentRoutes from './routes/stockAdjustment.routes.js';
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'StockMaster API is running',
        version: '1.0.0',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardroutes);
app.use('/api/moves', movesRoutes);
app.use('/api/receipts',receiptRoutes);
app.use('/api/delivery-orders', deliveryRoutes);
app.use('/api/internal-transfers', internalTransferRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);


// Error handler middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});
