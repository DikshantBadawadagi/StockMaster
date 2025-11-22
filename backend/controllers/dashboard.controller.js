import KPI_DATA from "../dummy/dashboardKpis.js"
import InventoryBalanceModel from "../models/InventoryBalance.model.js";
import ProductReorderRuleModel from "../models/ProductReorderRule.model.js";
import ProductModel from "../models/Product.model.js";
import ReceiptModel from "../models/Receipt.model.js";
import DeliveryOrderModel from "../models/DeliveryOrder.model.js";
import InternalTransferModel from "../models/InternalTransfer.model.js";

export const getKpis = async (req, res) => {
    try{
  const { warehouse, fromDate, toDate } = req.query;

  //let data = { ...KPI_DATA };

  // APPLY FILTERS (MOCK BEHAVIOR)

//   if (warehouse) {
//     data.warehouse = warehouse;
//     data.lowStockItems = data.lowStockItems.filter(
//       i => i.warehouse === warehouse
//     );
//     data.lowStockItemsCount = data.lowStockItems.length;

//     data.outOfStockItems = data.outOfStockItems.filter(
//       i => i.warehouse === warehouse
//     );
//     data.outOfStockItemsCount = data.outOfStockItems.length;
//   }

//   if (fromDate) {
//     data.fromDate = fromDate;
//   }

//   if (toDate) {
//     data.toDate = toDate;
//   }

//   return res.json(data);

    // 1. TOTAL STOCK
    // -------------------------
    const totalStockAgg = await InventoryBalanceModel.aggregate([
      warehouse ? { $match: { warehouse_id: warehouse } } : { $match: {} },
      { $group: { _id: null, total: { $sum: "$quantity_on_hand" } } }
    ]);

    const totalStock = totalStockAgg?.[0]?.total || 0;

    // -------------------------
    // 2. LOW STOCK ITEMS
    // -------------------------
    let lowStock = await InventoryBalanceModel.aggregate([
      warehouse ? { $match: { warehouse_id: warehouse } } : { $match: {} },

      // join reorder rules
      {
        $lookup: {
          from: "productreorderrules",
          localField: "product_id",
          foreignField: "product_id",
          as: "reorder"
        }
      },
      { $unwind: "$reorder" },

      // match min quantity
      {
        $match: {
          $expr: { $lt: ["$quantity_on_hand", "$reorder.min_quantity"] }
        }
      },

      // join products
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    // -------------------------
    // 3. OUT OF STOCK ITEMS
    // -------------------------
    const outOfStock = await InventoryBalanceModel.find({
      quantity_on_hand: 0,
      ...(warehouse ? { warehouse_id: warehouse } : {})
    })
      .populate("product_id")
      .populate("warehouse_id")
      .populate("location_id");

    // -------------------------
    // 4. PENDING RECEIPTS
    // -------------------------
    const pendingReceipts = await ReceiptModel.find({
      status: { $in: ["DRAFT", "WAITING", "READY"] },
      ...(warehouse ? { warehouse_id: warehouse } : {})
    }).populate("supplier_id");

    // -------------------------
    // 5. PENDING DELIVERIES
    // -------------------------
    const pendingDeliveries = await DeliveryOrderModel.find({
      status: { $in: ["DRAFT", "WAITING", "READY"] },
      ...(warehouse ? { warehouse_id: warehouse } : {})
    }).populate("customer_id");

    // -------------------------
    // 6. UPCOMING TRANSFERS
    // -------------------------
    const upcomingTransfers = await InternalTransferModel.find({
      status: { $in: ["DRAFT", "WAITING", "READY"] }
    })
      .populate("source_warehouse_id")
      .populate("destination_warehouse_id");

    // -------------------------
    // FINAL RETURN (Same format as dummy)
    // -------------------------
    return res.json({
      warehouse: warehouse || "ALL",

      totalStock,

      lowStockItemsCount: lowStock.length,
      lowStockItems: lowStock,

      outOfStockItemsCount: outOfStock.length,
      outOfStockItems: outOfStock,

      pendingReceiptsCount: pendingReceipts.length,
      pendingReceipts,

      pendingDeliveriesCount: pendingDeliveries.length,
      pendingDeliveries,

      upcomingTransfersCount: upcomingTransfers.length,
      upcomingTransfers
    });

  } catch (error) {
    console.error("KPI ERROR:", error);
    return res.status(500).json({
      message: "Error fetching KPIs",
      error: error.message
    });
}
};