export default {
  warehouse: "Main Warehouse",
  totalStock: 1250,

  lowStockItemsCount: 3,
  lowStockItems: [
    {
      product_id: "674a1e9035f1a92b174bb001",
      productName: "Steel Rod 10mm",
      sku: "SR10-001",
      currentQuantity: 12,
      minQuantity: 50,
      warehouse: "Main Warehouse",
      location: "Rack A1",
      category: "Raw Material"
    },
    {
      product_id: "674a1e9035f1a92b174bb002",
      productName: "Copper Sheet 2mm",
      sku: "CS2-100",
      currentQuantity: 8,
      minQuantity: 30,
      warehouse: "Main Warehouse",
      location: "Rack B2",
      category: "Raw Material"
    },
    {
      product_id: "674a1e9035f1a92b174bb003",
      productName: "Packaging Box - Medium",
      sku: "PKG-MED",
      currentQuantity: 5,
      minQuantity: 20,
      warehouse: "Main Warehouse",
      location: "Packing Zone",
      category: "Packaging"
    }
  ],

  outOfStockItemsCount: 2,
  outOfStockItems: [
    {
      product_id: "674a1e9035f1a92b174bb004",
      productName: "Nails - 2 inch",
      sku: "NL-200",
      currentQuantity: 0,
      minQuantity: 100,
      warehouse: "Main Warehouse",
      category: "Hardware"
    },
    {
      product_id: "674a1e9035f1a92b174bb005",
      productName: "Aluminium Sheet 4mm",
      sku: "AL4-550",
      currentQuantity: 0,
      minQuantity: 40,
      warehouse: "Secondary Warehouse",
      category: "Raw Material"
    }
  ],

  pendingReceiptsCount: 4,
  pendingReceipts: [
    {
      receipt_id: "RCPT-2025-001",
      supplier: "Tata Steel",
      expectedDate: "2025-11-23",
      items: 3,
      status: "READY"
    },
    {
      receipt_id: "RCPT-2025-002",
      supplier: "CopperWorks Ltd.",
      expectedDate: "2025-11-24",
      items: 2,
      status: "WAITING"
    },
    {
      receipt_id: "RCPT-2025-003",
      supplier: "Global Packaging",
      expectedDate: "2025-11-25",
      items: 4,
      status: "WAITING"
    },
    {
      receipt_id: "RCPT-2025-004",
      supplier: "Hitachi Metals",
      expectedDate: "2025-11-28",
      items: 1,
      status: "DRAFT"
    }
  ],

  pendingDeliveriesCount: 3,
  pendingDeliveries: [
    {
      delivery_id: "DEL-2025-1001",
      customer: "Apex Engineering",
      items: 6,
      status: "WAITING"
    },
    {
      delivery_id: "DEL-2025-1002",
      customer: "Nova Electricals",
      items: 2,
      status: "READY"
    },
    {
      delivery_id: "DEL-2025-1003",
      customer: "MetalCraft Industries",
      items: 3,
      status: "DRAFT"
    }
  ],

  upcomingTransfersCount: 2,
  upcomingTransfers: [
    {
      transfer_id: "TRF-2025-0501",
      source_warehouse: "Main Warehouse",
      destination_warehouse: "Secondary Warehouse",
      items: 4,
      status: "READY"
    },
    {
      transfer_id: "TRF-2025-0502",
      source_warehouse: "Secondary Warehouse",
      destination_warehouse: "Main Warehouse",
      items: 2,
      status: "WAITING"
    }
  ]
};
