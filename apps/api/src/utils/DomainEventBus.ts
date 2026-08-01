import { EventEmitter } from 'events';

// ── Enterprise Domain Event Types ─────────────────────────────
export type DomainEvents = {
  // Inventory
  MedicineCreated: { medicineId: string; tenantId: string };
  MedicineUpdated: { medicineId: string; tenantId: string };
  MedicineDeactivated: { medicineId: string; tenantId: string };
  InventoryAdjusted: { adjustmentId: string; tenantId: string; medicineId: string; variance: number };
  StockReserved: { medicineId: string; tenantId: string; quantity: number };
  StockReleased: { medicineId: string; tenantId: string; quantity: number };
  LowStockDetected: { medicineId: string; tenantId: string; currentStock: number; reorderLevel: number };
  OutOfStockDetected: { medicineId: string; tenantId: string };
  
  // Procurement
  PurchaseRequisitionCreated: { prId: string; tenantId: string };
  PurchaseOrderCreated: { poId: string; tenantId: string; supplierId: string };
  PurchaseOrderApproved: { poId: string; tenantId: string };
  PurchaseOrderCancelled: { poId: string; tenantId: string };
  GoodsReceived: { grnId: string; tenantId: string; poId: string };
  SupplierCreated: { supplierId: string; tenantId: string };
  
  // Batch Management
  BatchCreated: { batchId: string; tenantId: string; medicineId: string };
  BatchExpired: { batchId: string; tenantId: string; medicineId: string };
  BatchDisposed: { batchId: string; tenantId: string; medicineId: string };
  
  // Dispensing & Billing
  PharmacyInvoiceGenerated: { saleId: string; tenantId: string; totalAmount: number };
  PharmacyMedicineDispensed: { saleId: string; tenantId: string };
  PharmacySaleCancelled: { saleId: string; tenantId: string };
  
  // Returns
  PatientReturnRequested: { returnId: string; tenantId: string; patientId: string };
  PatientReturnApproved: { returnId: string; tenantId: string; patientId: string };
  HighRiskReturnDetected: { returnId: string; patientId: string; count: number };
  DamageReported: { damageId: string; tenantId: string; medicineId: string };
  
  // Controlled Drugs
  ControlledDrugTransactionLogged: { registerId: string; medicineId: string; transactionType: string };
  ControlledDrugVarianceDetected: { auditId: string; tenantId: string; medicineId: string; variance: number; auditedBy: string };

  // Analytics
  InventorySnapshotGenerated: { tenantId: string; date: string };
  PharmacySalesCompleted: { tenantId: string; date: string; totalRevenue: number };

  // Fallback for untyped events (legacy or cross-module integration)
  [key: string]: any;
};

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
  }

  // Helper for strictly typed event emissions
  emitEvent<K extends keyof DomainEvents>(eventName: K, payload: DomainEvents[K]) {
    console.log(`[DomainEventBus] Emitting event: ${String(eventName)}`, payload);
    this.emit(String(eventName), payload);
  }
}

export const eventBus = new DomainEventBus();

// Example listeners (in production, these would be in their respective domain listeners)
eventBus.on('InvoicePaid', (payload) => {
  console.log(`[DomainEventBus Listener] Handling InvoicePaid for invoice ${payload.invoiceId}`);
  // Emit to Pharmacy for Inventory Sync (Epic 5, Task 22)
  if (payload.items) {
    payload.items.forEach((item: any) => {
      // Simulate deducting inventory
      console.log(`[DomainEventBus] Emitting Pharmacy Deduct for item ${item.itemId}`);
    });
  }
});
