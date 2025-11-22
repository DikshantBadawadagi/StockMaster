const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipt.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const internalTransferRoutes = require('./routes/internalTransfer.routes');
const stockAdjustmentRoutes = require('./routes/stockAdjustment.routes');


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'StockMaster API is running',
        version: '1.0.0',
    });
});

app.use('/api/auth', authRoutes);
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
