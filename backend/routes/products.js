const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryHierarchy,
    getCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    getProducts,
    getProduct,
    searchProductBySKU,
    updateProduct,
    deleteProduct,
    setInitialStock,
    getProductStock
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

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

module.exports = router;
