import { Request, Response, NextFunction } from 'express';
import { Invoice, Payment } from '../models/Billing';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

function buildFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) filter.tenantId = req.user.tenantId;
  if (req.user?.role === 'HOSPITAL_ADMIN') filter.hospitalId = req.user.hospitalId;
  return filter;
}

// ── Invoices ─────────────────────────────────────────────────

export async function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, from, to, page = '1', limit = '20' } = req.query;
    const filter = buildFilter(req);

    if (req.user?.role === 'PATIENT' && req.user?.email) {
      const { Patient } = await import('../models/Patient');
      const mongoose = await import('mongoose');
      const patientRecord = await Patient.findOne({ email: req.user.email.toLowerCase() });
      if (patientRecord) {
        filter.patientId = patientRecord._id;
      } else {
        filter.patientId = new mongoose.default.Types.ObjectId();
      }
    }

    if (status) filter.status = status;
    if (search) filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } },
    ];
    if (from || to) {
      filter.issuedDate = {};
      if (from) (filter.issuedDate as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.issuedDate as Record<string, unknown>).$lte = new Date(to as string);
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ issuedDate: -1 }).skip(skip).limit(limitNum),
      Invoice.countDocuments(filter),
    ]);

    sendSuccess(res, invoices, 'Invoices retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.create({
      ...req.body,
      tenantId: req.body.tenantId || req.user?.tenantId,
      createdBy: req.user?._id,
    });
    sendCreated(res, invoice, 'Invoice created');
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) throw new NotFoundError('Invoice not found');
    sendSuccess(res, invoice, 'Invoice updated');
  } catch (err) {
    next(err);
  }
}

export async function cancelInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!invoice) throw new NotFoundError('Invoice not found');
    sendSuccess(res, invoice, 'Invoice cancelled');
  } catch (err) {
    next(err);
  }
}

export async function payInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new NotFoundError('Invoice not found');

    invoice.status = 'paid';
    await invoice.save();

    const paymentMethod = req.body.method === 'card' ? 'credit_card' : (req.body.method || 'credit_card');

    // Create corresponding payment log
    await Payment.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      amount: invoice.totalAmount,
      method: paymentMethod,
      status: 'completed',
      referenceId: 'txn_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    });

    sendSuccess(res, invoice, 'Payment completed successfully');
  } catch (err) {
    next(err);
  }
}

// Revenue summary for dashboard
export async function getRevenueSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter = buildFilter(req);
    const [totalRevenue, paidCount, unpaidCount, overdueCount] = await Promise.all([
      Invoice.aggregate([
        { $match: { ...filter, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Invoice.countDocuments({ ...filter, status: 'paid' }),
      Invoice.countDocuments({ ...filter, status: 'unpaid' }),
      Invoice.countDocuments({ ...filter, status: 'overdue' }),
    ]);

    sendSuccess(res, {
      totalRevenue: totalRevenue[0]?.total ?? 0,
      paidCount,
      unpaidCount,
      overdueCount,
    });
  } catch (err) {
    next(err);
  }
}

// ── Payments ─────────────────────────────────────────────────

export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter = buildFilter(req);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;

    const payments = await Payment.find(filter)
      .sort({ paymentDate: -1 })
      .limit(100);
    sendSuccess(res, payments);
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await Payment.create({
      ...req.body,
      tenantId: req.body.tenantId || req.user?.tenantId,
    });

    // Update invoice status
    if (req.body.invoiceId) {
      await Invoice.findByIdAndUpdate(req.body.invoiceId, {
        status: 'paid',
        paidDate: new Date(),
        paidAmount: req.body.amount,
      });
    }

    sendCreated(res, payment, 'Payment recorded');
  } catch (err) {
    next(err);
  }
}
