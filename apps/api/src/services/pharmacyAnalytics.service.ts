import mongoose from 'mongoose';
import { InventoryBatch } from '../models/Pharmacy';
import { PharmacySale } from '../models/PharmacyPOS';
import { eventBus } from '../utils/DomainEventBus';

export class PharmacyAnalyticsService {
  /**
   * Generates a snapshot of the current inventory value for analytics.
   * This is typically run as a nightly CRON job.
   */
  static async generateInventorySnapshot(tenantId: mongoose.Types.ObjectId) {
    try {
      const batches = await InventoryBatch.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            // Note: In a real system, you would multiply quantity by purchasePrice here
            // Assuming we just want the aggregate count for the snapshot right now
            totalBatches: { $sum: 1 }
          }
        }
      ]);

      const snapshot = batches[0] || { totalQuantity: 0, totalBatches: 0 };
      const date = new Date().toISOString().split('T')[0];

      eventBus.emitEvent('InventorySnapshotGenerated', {
        tenantId: tenantId.toString(),
        date
      });

      return snapshot;
    } catch (error) {
      console.error('Failed to generate inventory snapshot:', error);
      throw error;
    }
  }

  /**
   * Calculates the total sales completed for the day and emits an analytics event.
   * This allows the Finance module to sync at EOD.
   */
  static async processEndOfDaySales(tenantId: mongoose.Types.ObjectId, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sales = await PharmacySale.aggregate([
        { 
          $match: { 
            tenantId, 
            paymentStatus: 'paid', 
            createdAt: { $gte: startOfDay, $lte: endOfDay } 
          } 
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      const totalRevenue = sales[0]?.totalRevenue || 0;

      eventBus.emitEvent('PharmacySalesCompleted', {
        tenantId: tenantId.toString(),
        date: startOfDay.toISOString().split('T')[0],
        totalRevenue
      });

      return totalRevenue;
    } catch (error) {
      console.error('Failed to process end of day sales:', error);
      throw error;
    }
  }
}
