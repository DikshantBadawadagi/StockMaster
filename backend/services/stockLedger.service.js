import StockLedgerEntry from '../models/StockLedgerEntry.model.js';
import InventoryBalance from '../models/InventoryBalance.model.js';

/**
 * Stock Ledger Engine - Single source of truth for all stock movements
 */

export const createLedgerEntry = async (ledgerData) => {
  try {
    const {
      product_id,
      warehouse_id,
      location_id,
      document_type, // RECEIPT, DELIVERY, INTERNAL_TRANSFER, ADJUSTMENT
      document_id,
      document_line_id,
      movement_type, // IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT_POS, ADJUSTMENT_NEG
      quantity,
      created_by,
      note,
    } = ledgerData;

    // Create ledger entry
    const ledgerEntry = await StockLedgerEntry.create({
      product_id,
      warehouse_id,
      location_id,
      document_type,
      document_id,
      document_line_id,
      movement_type,
      quantity,
      created_by,
      note,
    });

    // Update inventory balance
    await updateInventoryBalance(
      product_id,
      warehouse_id,
      location_id,
      quantity,
      movement_type
    );

    return ledgerEntry;
  } catch (error) {
    throw new Error(`Ledger entry creation failed: ${error.message}`);
  }
};

/**
 * Update inventory balance based on movement type
 */
const updateInventoryBalance = async (
  product_id,
  warehouse_id,
  location_id,
  quantity,
  movement_type
) => {
  try {
    let quantityChange = 0;

    // Calculate quantity change based on movement type
    if (
      movement_type === 'IN' ||
      movement_type === 'TRANSFER_IN' ||
      movement_type === 'ADJUSTMENT_POS'
    ) {
      quantityChange = quantity;
    } else if (
      movement_type === 'OUT' ||
      movement_type === 'TRANSFER_OUT' ||
      movement_type === 'ADJUSTMENT_NEG'
    ) {
      quantityChange = -quantity;
    }

    // Find or create inventory balance record
    let balance = await InventoryBalance.findOne({
      product_id,
      warehouse_id,
      location_id,
    });

    if (!balance) {
      balance = await InventoryBalance.create({
        product_id,
        warehouse_id,
        location_id,
        quantity_on_hand: quantityChange,
      });
    } else {
      balance.quantity_on_hand += quantityChange;
      await balance.save();
    }

    return balance;
  } catch (error) {
    throw new Error(`Inventory balance update failed: ${error.message}`);
  }
};

/**
 * Get current stock balance for a product at a location
 */
export const getStockBalance = async (product_id, warehouse_id, location_id) => {
  try {
    const balance = await InventoryBalance.findOne({
      product_id,
      warehouse_id,
      location_id,
    });

    return balance ? balance.quantity_on_hand : 0;
  } catch (error) {
    throw new Error(`Get stock balance failed: ${error.message}`);
  }
};

/**
 * Get ledger history for tracking
 */
export const getLedgerHistory = async (product_id, location_id, limit = 50) => {
  try {
    return await StockLedgerEntry.find({
      product_id,
      location_id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('product_id', 'name sku')
      .populate('location_id', 'name code');
  } catch (error) {
    throw new Error(`Get ledger history failed: ${error.message}`);
  }
};

// Default export for compatibility with existing imports
export default { createLedgerEntry, getStockBalance, getLedgerHistory };