import Product from '../models/Product.model.js';
import ProductCategory from '../models/ProductCategory.model.js';
import InventoryBalance from '../models/InventoryBalance.model.js';
import Location from '../models/Location.model.js';
import Warehouse from '../models/Warehouse.model.js';

// ========== PRODUCT CATEGORY OPERATIONS ==========

// @desc    Create product category
// @route   POST /api/products/categories
// @access  Private
export const createCategory = async (req, res, next) => {
    try {
        const { name, code, parent_category_id } = req.body;

        // Check if category code already exists
        if (code) {
            const existingCategory = await ProductCategory.findOne({ code });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this code already exists'
                });
            }
        }

        // If parent_category_id is provided, verify it exists
        if (parent_category_id) {
            const parentCategory = await ProductCategory.findById(parent_category_id);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent category not found'
                });
            }
        }

        const category = await ProductCategory.create({
            name,
            code,
            parent_category_id: parent_category_id || null
        });

        const populatedCategory = await ProductCategory.findById(category._id)
            .populate('parent_category_id', 'name code');

        res.status(201).json({
            success: true,
            data: populatedCategory
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Private
export const getCategories = async (req, res, next) => {
    try {
        const categories = await ProductCategory.find()
            .populate('parent_category_id', 'name code')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category hierarchy (tree structure)
// @route   GET /api/products/categories/hierarchy
// @access  Private
export const getCategoryHierarchy = async (req, res, next) => {
    try {
        const categories = await ProductCategory.find();

        // Build hierarchy tree
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => {
                    if (parentId === null) {
                        return cat.parent_category_id === null || cat.parent_category_id === undefined;
                    }
                    return cat.parent_category_id && cat.parent_category_id.toString() === parentId.toString();
                })
                .map(cat => ({
                    _id: cat._id,
                    name: cat.name,
                    code: cat.code,
                    parent_category_id: cat.parent_category_id,
                    children: buildTree(cat._id)
                }));
        };

        const hierarchy = buildTree();

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/products/categories/:id
// @access  Private
export const getCategory = async (req, res, next) => {
    try {
        const category = await ProductCategory.findById(req.params.id)
            .populate('parent_category_id', 'name code');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PUT /api/products/categories/:id
// @access  Private
export const updateCategory = async (req, res, next) => {
    try {
        const { name, code, parent_category_id } = req.body;

        let category = await ProductCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== category.code) {
            const existingCategory = await ProductCategory.findOne({ code });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this code already exists'
                });
            }
        }

        // If parent_category_id is being changed, verify it exists
        if (parent_category_id && parent_category_id !== category.parent_category_id?.toString()) {
            const parentCategory = await ProductCategory.findById(parent_category_id);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent category not found'
                });
            }
            // Prevent circular reference
            if (parent_category_id === req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Category cannot be its own parent'
                });
            }
        }

        category = await ProductCategory.findByIdAndUpdate(
            req.params.id,
            { name, code, parent_category_id },
            { new: true, runValidators: true }
        ).populate('parent_category_id', 'name code');

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/products/categories/:id
// @access  Private
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await ProductCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has child categories
        const childCategoriesCount = await ProductCategory.countDocuments({
            parent_category_id: req.params.id
        });
        if (childCategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with child categories'
            });
        }

        // Check if category has products
        const productsCount = await Product.countDocuments({ category_id: req.params.id });
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing products'
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ========== PRODUCT OPERATIONS ==========

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
    try {
        const { name, sku, code, category_id, uom, is_active } = req.body;

        // Check if product with SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        // Check if code is provided and already exists
        if (code) {
            const existingProductByCode = await Product.findOne({ code });
            if (existingProductByCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this code already exists'
                });
            }
        }

        // Verify category exists
        const category = await ProductCategory.findById(category_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const product = await Product.create({
            name,
            sku,
            code,
            category_id,
            uom,
            is_active: is_active !== undefined ? is_active : true
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category_id', 'name code');

        res.status(201).json({
            success: true,
            data: populatedProduct
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all products with optional filters
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
    try {
        const { search, category_id, is_active } = req.query;

        // Build query
        let query = {};

        // Search by name or SKU
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category_id) {
            query.category_id = category_id;
        }

        // Filter by active status
        if (is_active !== undefined) {
            query.is_active = is_active === 'true';
        }

        const products = await Product.find(query)
            .populate('category_id', 'name code')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category_id', 'name code');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search product by SKU
// @route   GET /api/products/search/sku/:sku
// @access  Private
export const searchProductBySKU = async (req, res, next) => {
    try {
        const { sku } = req.params;

        const product = await Product.findOne({ sku })
            .populate('category_id', 'name code');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
    try {
        const { name, sku, code, category_id, uom, is_active } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if SKU is being changed and if new SKU already exists
        if (sku && sku !== product.sku) {
            const existingProduct = await Product.findOne({ sku });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== product.code) {
            const existingProduct = await Product.findOne({ code });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this code already exists'
                });
            }
        }

        // If category_id is being changed, verify it exists
        if (category_id && category_id !== product.category_id?.toString()) {
            const category = await ProductCategory.findById(category_id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, sku, code, category_id, uom, is_active },
            { new: true, runValidators: true }
        ).populate('category_id', 'name code');

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product has inventory
        const inventoryCount = await InventoryBalance.countDocuments({
            product_id: req.params.id,
            quantity_on_hand: { $gt: 0 }
        });

        if (inventoryCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product with existing inventory. Please adjust stock to zero first.'
            });
        }

        // Soft delete by setting is_active to false
        product.is_active = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ========== INITIAL STOCK SETUP ==========

// @desc    Set initial stock for a product at a location
// @route   POST /api/products/:productId/initial-stock
// @access  Private
export const setInitialStock = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { warehouse_id, location_id, quantity } = req.body;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Verify warehouse exists
        const warehouse = await Warehouse.findById(warehouse_id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Verify location exists and belongs to the warehouse
        const location = await Location.findOne({
            _id: location_id,
            warehouse_id: warehouse_id
        });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found in the specified warehouse'
            });
        }

        // Check if inventory balance already exists for this product-location
        let inventoryBalance = await InventoryBalance.findOne({
            product_id: productId,
            location_id: location_id
        });

        if (inventoryBalance) {
            // Update existing balance
            inventoryBalance.quantity_on_hand = quantity;
            inventoryBalance.warehouse_id = warehouse_id;
            await inventoryBalance.save();
        } else {
            // Create new balance
            inventoryBalance = await InventoryBalance.create({
                product_id: productId,
                warehouse_id: warehouse_id,
                location_id: location_id,
                quantity_on_hand: quantity
            });
        }

        const populatedBalance = await InventoryBalance.findById(inventoryBalance._id)
            .populate('product_id', 'name sku code')
            .populate('warehouse_id', 'name code')
            .populate('location_id', 'name code');

        res.status(200).json({
            success: true,
            message: 'Initial stock set successfully',
            data: populatedBalance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product stock across all locations
// @route   GET /api/products/:productId/stock
// @access  Private
export const getProductStock = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const stockBalances = await InventoryBalance.find({ product_id: productId })
            .populate('warehouse_id', 'name code')
            .populate('location_id', 'name code')
            .sort({ warehouse_id: 1, location_id: 1 });

        const totalQuantity = stockBalances.reduce((sum, balance) => sum + balance.quantity_on_hand, 0);

        res.status(200).json({
            success: true,
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    sku: product.sku,
                    code: product.code,
                    uom: product.uom
                },
                total_quantity: totalQuantity,
                stock_by_location: stockBalances
            }
        });
    } catch (error) {
        next(error);
    }
};
