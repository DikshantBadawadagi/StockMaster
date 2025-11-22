import moveHistory from "../dummy/moveHistory.js";
import StockLedgerEntryModel from "../models/StockLedgerEntry.model.js";
import ReceiptModel from "../models/Receipt.model.js";
import DeliveryOrderModel from "../models/DeliveryOrder.model.js";
import InternalTransferModel from "../models/InternalTransfer.model.js";
import StockAdjustmentModel from "../models/StockAdjustment.model.js";

const USE_REAL_DATA = false;

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

    // --------------------------------------------------------------------
    //  1. DUMMY MODE - FOR DEV3 IMMEDIATE WORK
    // --------------------------------------------------------------------
    if (!USE_REAL_DATA) {
      let result = [...moveHistory];

      if (documentType) result = result.filter(m => m.documentType === documentType);
      if (status) result = result.filter(m => m.status === status);

      if (product) {
        result = result.filter(m =>
          m.product.name.toLowerCase().includes(product.toLowerCase())
        );
      }

      if (warehouse) {
        result = result.filter(m =>
          m.warehouse.toLowerCase().includes(warehouse.toLowerCase())
        );
      }

      if (fromDate) {
        result = result.filter(m => new Date(m.date) >= new Date(fromDate));
      }
      if (toDate) {
        result = result.filter(m => new Date(m.date) <= new Date(toDate));
      }

      return res.json(result);
    }

    // --------------------------------------------------------------------
    // 2. REAL MODE — LEDGER + STATUS FROM DOCUMENTS
    // --------------------------------------------------------------------

    const query = {};

    if (documentType) query.document_type = documentType;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Fetch ledger entries
    let entries = await StockLedgerEntryModel.find(query)
      .populate("product_id")
      .populate("warehouse_id")
      .populate("location_id")
      .populate("created_by");

    // Manual string search filters
    if (product) {
      entries = entries.filter(e =>
        e.product_id.name.toLowerCase().includes(product.toLowerCase())
      );
    }

    if (warehouse) {
      entries = entries.filter(e =>
        e.warehouse_id.name.toLowerCase().includes(warehouse.toLowerCase())
      );
    }

    // --------------------------------------------------------------------
    // 3. ATTACH DOCUMENT STATUS BASED ON TYPE
    // --------------------------------------------------------------------
    const result = await Promise.all(
      entries.map(async (e) => {
        let docStatus = "DONE"; // default for safety

        if (e.document_type === "RECEIPT") {
          const doc = await ReceiptModel.findById(e.document_id);
          if (doc) docStatus = doc.status;
        }

        if (e.document_type === "DELIVERY") {
          const doc = await DeliveryOrderModel.findById(e.document_id);
          if (doc) docStatus = doc.status;
        }

        if (e.document_type === "INTERNAL_TRANSFER") {
          const doc = await InternalTransferModel.findById(e.document_id);
          if (doc) docStatus = doc.status;
        }

        if (e.document_type === "ADJUSTMENT") {
          const doc = await StockAdjustmentModel.findById(e.document_id);
          if (doc) docStatus = doc.status;
        }

        // Apply status filter
        if (status && status !== docStatus) return null;

        return {
          ledger_id: e._id,
          date: e.createdAt,
          documentType: e.document_type,
          status: docStatus,
          product: {
            id: e.product_id._id,
            name: e.product_id.name,
            sku: e.product_id.sku
          },
          warehouse: e.warehouse_id?.name,
          location: e.location_id?.name,
          movement: e.movement_type,
          quantity: e.quantity,
          created_by: e.created_by?.name,
          notes: e.note
        };
      })
    );

    return res.json(result.filter(Boolean)); // remove nulls from status filter

  } catch (err) {
    console.error("MOVE HISTORY ERROR:", err);
    return res.status(500).json({
      message: "Error fetching move history",
      error: err.message
    });
  }
};
