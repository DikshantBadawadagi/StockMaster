export default [
  {
    ledger_id: "LED-001",
    date: "2025-11-21T09:15:00Z",
    documentType: "RECEIPT",
    document_id: "RCPT-2025-001",
    status: "DONE",
    product: {
      id: "674a1e9035f1a92b174bb001",
      name: "Steel Rod 10mm",
      sku: "SR10-001",
      category: "Raw Material"
    },
    warehouse: "Main Warehouse",
    location: "Rack A1",
    movement: "IN",
    quantity: 100,
    created_by: "John Doe (Inventory Manager)",
    notes: "Received from Tata Steel"
  },
  {
    ledger_id: "LED-002",
    date: "2025-11-20T14:32:00Z",
    documentType: "DELIVERY",
    document_id: "DEL-2025-1001",
    status: "DONE",
    product: {
      id: "674a1e9035f1a92b174bb002",
      name: "Copper Sheet 2mm",
      sku: "CS2-100",
      category: "Raw Material"
    },
    warehouse: "Main Warehouse",
    location: "Rack B2",
    movement: "OUT",
    quantity: -20,
    created_by: "Amit Sharma (Warehouse Staff)",
    notes: "Dispatched to Apex Engineering"
  },
  {
    ledger_id: "LED-003",
    date: "2025-11-19T11:45:00Z",
    documentType: "INTERNAL_TRANSFER",
    document_id: "TRF-2025-0501",
    status: "READY",
    product: {
      id: "674a1e9035f1a92b174bb003",
      name: "Packaging Box - Medium",
      sku: "PKG-MED",
      category: "Packaging"
    },
    source_location: "Main Warehouse - Packing Zone",
    destination_location: "Secondary Warehouse - Shelf C3",
    movement: "TRANSFER_OUT",
    quantity: -15,
    created_by: "John Doe (Inventory Manager)",
    notes: "Reallocating packing material"
  },
  {
    ledger_id: "LED-004",
    date: "2025-11-19T11:45:05Z",
    documentType: "INTERNAL_TRANSFER",
    document_id: "TRF-2025-0501",
    status: "READY",
    product: {
      id: "674a1e9035f1a92b174bb003",
      name: "Packaging Box - Medium",
      sku: "PKG-MED",
      category: "Packaging"
    },
    source_location: "Main Warehouse - Packing Zone",
    destination_location: "Secondary Warehouse - Shelf C3",
    movement: "TRANSFER_IN",
    quantity: 15,
    created_by: "John Doe (Inventory Manager)",
    notes: "Received at destination warehouse"
  },
  {
    ledger_id: "LED-005",
    date: "2025-11-18T10:12:00Z",
    documentType: "ADJUSTMENT",
    document_id: "ADJ-2025-0032",
    status: "DONE",
    product: {
      id: "674a1e9035f1a92b174bb004",
      name: "Nails - 2 inch",
      sku: "NL-200",
      category: "Hardware"
    },
    warehouse: "Main Warehouse",
    location: "Rack C1",
    movement: "ADJUSTMENT_NEG",
    quantity: -30,
    created_by: "Amit Sharma (Warehouse Staff)",
    notes: "Damaged stock during handling"
  }
];
