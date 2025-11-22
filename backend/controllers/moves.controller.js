import moveHistory from "../dummy/moveHistory.js"; 
import StockLedgerEntryModel from "../models/StockLedgerEntry.model.js";
import ProductModel from "../models/Product.model.js";
import WarehouseModel from "../models/Warehouse.model.js";
import LocationModel from "../models/Location.model.js";
import User from "../models/User.js";

// Toggle this to true when Dev1/Dev2 finish STOCK LEDGER
const USE_REAL_DATA = true;

export const getMoveHistory = async (req, res) => {
  try {
    const {
      documentType,
      status,
      product,
      warehouse,
      fromDate,
      toDate
    } = req.query;

    let result = [];

    // ---------------------------------------------------
    // DUMMY MODE — USE THE FAKE ARRAY (Works for Dev3 now)
    // ---------------------------------------------------
    if (!USE_REAL_DATA) {
      result = [...moveHistory];

      // FILTERS

      if (documentType) {
        result = result.filter(m => m.documentType === documentType);
      }

      if (status) {
        result = result.filter(m => m.status === status);
      }

      if (product) {
        result = result.filter(m =>
          m.product.name.toLowerCase().includes(product.toLowerCase())
        );
      }

      if (warehouse) {
        result = result.filter(m =>
          (m.warehouse || "")
            .toLowerCase()
            .includes(warehouse.toLowerCase())
        );
      }

      if (fromDate) {
        result = result.filter(
          m => new Date(m.date) >= new Date(fromDate)
        );
      }

      if (toDate) {
        result = result.filter(
          m => new Date(m.date) <= new Date(toDate)
        );
      }

      return res.json(result);
    }

    // ---------------------------------------------------
    // REAL MODE — When ready, toggle USE_REAL_DATA = true
    // ---------------------------------------------------

    const query = {};

    if (documentType) query.document_type = documentType;
    if (status) query.status = status;

    // Date filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Fetch ledger entries
    let moves = await StockLedgerEntryModel.find(query)
      .populate("product_id")
      .populate("warehouse_id")
      .populate("location_id")
      .populate("created_by");

    // Manual filter for text search fields
    if (product) {
      moves = moves.filter(m =>
        m.product_id.name.toLowerCase().includes(product.toLowerCase())
      );
    }

    if (warehouse) {
      moves = moves.filter(m =>
        m.warehouse_id.name.toLowerCase().includes(warehouse.toLowerCase())
      );
    }

    // Map to dummy-like format
    result = moves.map(m => ({
      ledger_id: m._id,
      date: m.createdAt,
      documentType: m.document_type,
      status: m.status,
      product: {
        id: m.product_id._id,
        name: m.product_id.name,
        sku: m.product_id.sku,
        category: m.product_id.category_id
      },
      warehouse: m.warehouse_id?.name,
      location: m.location_id?.name,
      movement: m.movement_type,
      quantity: m.quantity,
      created_by: m.created_by?.name,
      notes: m.note
    }));

    return res.json(result);

  } catch (err) {
    console.error("MOVE HISTORY ERROR:", err);
    return res.status(500).json({
      message: "Error fetching move history",
      error: err.message
    });
  }
};
