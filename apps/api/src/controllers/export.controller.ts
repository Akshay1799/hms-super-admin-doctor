import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Billing';

export async function exportBillingData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { format = 'csv', status, startDate, endDate } = req.query;

    const query: any = { tenantId: req.user?.tenantId };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const invoices = await Invoice.find(query).populate('patientId', 'firstName lastName').lean();

    if (format === 'csv') {
      const header = 'Invoice Number,Date,Patient,Total Amount,Status\n';
      const rows = invoices.map((inv: any) => {
        const patientName = inv.patientId ? `${inv.patientId.firstName} ${inv.patientId.lastName}` : 'N/A';
        return `${inv.invoiceNumber},${inv.createdAt},${patientName},${inv.totalAmount},${inv.status}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="billing_export.csv"');
      res.status(200).send(header + rows);
    } else {
      // Future: Generate PDF or Excel
      res.status(400).json({ success: false, message: 'Format not supported yet. Use format=csv' });
    }
  } catch (err) {
    next(err);
  }
}
