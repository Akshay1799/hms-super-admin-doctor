import { EventEmitter } from 'events';

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
  }

  // Helper for strictly typed event emissions
  emitEvent(eventName: string, payload: any) {
    console.log(`[DomainEventBus] Emitting event: ${eventName}`, payload);
    this.emit(eventName, payload);
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
