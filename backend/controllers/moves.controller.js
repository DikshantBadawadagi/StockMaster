import moveHistory from "../dummy/moveHistory.js";

export const getMoveHistory = async (req, res) => {
  const {
    documentType,
    status,
    product,
    warehouse,
    fromDate,
    toDate
  } = req.query;

  let result = [...moveHistory];

  // APPLY FILTERS

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
      m.warehouse.toLowerCase().includes(warehouse.toLowerCase())
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
};