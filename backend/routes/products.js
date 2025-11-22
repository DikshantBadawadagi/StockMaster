import express from 'express';
const router = express.Router();
import productController from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
const { createCategory, getCategories, getCategoryHierarchy, getCategory, updateCategory, deleteCategory, createProduct, getProducts, getProduct, searchProductBySKU, updateProduct, deleteProduct, setInitialStock, getProductStock } = productController;

// Category routes
router.post('/categories', protect, createCategory);
router.get('/categories', protect, getCategories);
router.get('/categories/hierarchy', protect, getCategoryHierarchy);
router.get('/categories/:id', protect, getCategory);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);

// Product routes
router.post('/', protect, createProduct);
router.get('/', protect, getProducts);
router.get('/search/sku/:sku', protect, searchProductBySKU);
router.get('/:id', protect, getProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Initial stock setup routes
router.post('/:productId/initial-stock', protect, setInitialStock);
router.get('/:productId/stock', protect, getProductStock);

export default router;
