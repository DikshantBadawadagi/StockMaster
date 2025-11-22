import KPI_DATA from "../dummy/dashboardKpis.js"

export const getKpis = async (req, res) => {
  const { warehouse, fromDate, toDate } = req.query;

  let data = { ...KPI_DATA };

  // APPLY FILTERS (MOCK BEHAVIOR)

  if (warehouse) {
    data.warehouse = warehouse;
    data.lowStockItems = data.lowStockItems.filter(
      i => i.warehouse === warehouse
    );
    data.lowStockItemsCount = data.lowStockItems.length;

    data.outOfStockItems = data.outOfStockItems.filter(
      i => i.warehouse === warehouse
    );
    data.outOfStockItemsCount = data.outOfStockItems.length;
  }

  if (fromDate) {
    data.fromDate = fromDate;
  }

  if (toDate) {
    data.toDate = toDate;
  }

  return res.json(data);
};
