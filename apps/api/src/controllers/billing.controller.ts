import { Request, Response, NextFunction } from 'express';
import { Invoice, Payment, CreditNote, DebitNote } from '../models/Billing';
import { LedgerEntry, CashDrawerShift } from '../models/Ledger';
import mongoose from 'mongoose';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { eventBus } from '../utils/DomainEventBus';

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

    const paymentHistory = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 });

    sendSuccess(res, { ...invoice.toObject(), paymentHistory });
  } catch (err) {
    next(err);
  }
}

function getFinancialYear(date: Date = new Date()): string {
  const currentYear = date.getFullYear();
  const isNewFY = date.getMonth() >= 3;
  const startYear = isNewFY ? currentYear : currentYear - 1;
  const endYear = startYear + 1;
  return `${String(startYear).slice(2)}${String(endYear).slice(2)}`;
}

async function recordLedgerTransaction(params: {
  tenantId: mongoose.Types.ObjectId;
  transactionDate?: Date;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  transactionType: 'INVOICE' | 'PAYMENT' | 'REFUND' | 'DISCOUNT' | 'WRITE_OFF';
  referenceId: mongoose.Types.ObjectId;
  referenceModel: 'Invoice' | 'Payment';
  description: string;
  createdBy?: mongoose.Types.ObjectId;
}) {
  const fy = getFinancialYear(params.transactionDate || new Date());
  
  // Create Debit Entry
  await LedgerEntry.create({
    tenantId: params.tenantId,
    transactionDate: params.transactionDate || new Date(),
    accountId: params.debitAccount,
    accountName: params.debitAccount.replace(/_/g, ' '),
    debit: params.amount,
    credit: 0,
    transactionType: params.transactionType,
    referenceId: params.referenceId,
    referenceModel: params.referenceModel,
    description: params.description,
    financialYear: fy,
    createdBy: params.createdBy
  });

  // Create Credit Entry
  await LedgerEntry.create({
    tenantId: params.tenantId,
    transactionDate: params.transactionDate || new Date(),
    accountId: params.creditAccount,
    accountName: params.creditAccount.replace(/_/g, ' '),
    debit: 0,
    credit: params.amount,
    transactionType: params.transactionType,
    referenceId: params.referenceId,
    referenceModel: params.referenceModel,
    description: params.description,
    financialYear: fy,
    createdBy: params.createdBy
  });
}

export async function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, discountAmount = 0, patientResponsibilityAmount, insuranceLiabilityAmount } = req.body;
    let amount = 0;
    let taxAmount = 0;
    
    // Calculate exclusive GST on top of unit price
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemTax = (itemSubtotal * (item.taxRate || 0)) / 100;
        
        item.taxAmount = itemTax;
        item.total = itemSubtotal + itemTax;
        
        amount += itemSubtotal;
        taxAmount += itemTax;
      });
    }
    
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const taxBreakup = { cgst, sgst, igst: 0 };
    
    const totalAmount = amount + taxAmount - discountAmount;

    const invoice = await Invoice.create({
      ...req.body,
      items,
      amount,
      taxAmount,
      taxBreakup,
      discountAmount,
      totalAmount,
      patientResponsibilityAmount,
      insuranceLiabilityAmount,
      status: 'draft', // All new invoices start as draft
      dueDate: req.body.dueDate,
      tenantId: req.body.tenantId || req.user?.tenantId,
      createdBy: req.user?._id,
    });

    // Double-Entry Ledger: Debit Accounts Receivable, Credit Revenue
    await recordLedgerTransaction({
      tenantId: invoice.tenantId,
      debitAccount: 'ACCOUNTS_RECEIVABLE',
      creditAccount: 'REVENUE_CONSULTATION', // In a full ERP, map this per itemCategory
      amount: invoice.totalAmount,
      transactionType: 'INVOICE',
      referenceId: invoice._id,
      referenceModel: 'Invoice',
      description: `Invoice ${invoice.invoiceNumber || 'Created'}`,
      createdBy: req.user?._id
    });

    sendCreated(res, invoice, 'Invoice created');
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) throw new NotFoundError('Invoice not found');
    
    // Strict Edit Rules
    if (existingInvoice.locked) {
      throw new Error('This invoice is locked and cannot be edited. Please issue a Credit Note or Debit Note for corrections.');
    }
    if (existingInvoice.status !== 'draft' && existingInvoice.status !== 'unpaid') {
      throw new Error('Only Draft or Unpaid invoices can be edited.');
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    sendSuccess(res, updatedInvoice, 'Invoice updated');
  } catch (err) {
    next(err);
  }
}

export async function cancelInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    if ((invoice.paidAmount || 0) > 0) {
      throw new Error('Cannot cancel an invoice with existing payments. Please process refunds first and reconcile the ledger.');
    }

    invoice.status = 'cancelled';
    await invoice.save();
    
    sendSuccess(res, invoice, 'Invoice cancelled successfully');
  } catch (err) {
    next(err);
  }
}

export async function payInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotencyKey });
      if (existingPayment) {
        // Idempotency hit: return the already processed payment without double charging
        const invoice = await Invoice.findById(existingPayment.invoiceId);
        sendSuccess(res, invoice, 'Payment already processed (Idempotency Hit)');
        return;
      }
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (invoice.status === 'cancelled') throw new Error('Cannot pay a cancelled invoice');
    if (invoice.status === 'paid') throw new Error('Invoice is already fully paid');

    const paymentAmount = req.body.amount;
    if (!paymentAmount || paymentAmount <= 0) throw new Error('Invalid payment amount');

    const remainingBalance = invoice.totalAmount - (invoice.paidAmount || 0);
    if (paymentAmount > remainingBalance) {
      throw new Error(`Overpayment prevented: Cannot pay more than the remaining balance of ₹${remainingBalance}`);
    }

    const paymentMethod = req.body.method || 'credit_card';

    // Use atomic update to prevent double-spend race conditions
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: invoice._id, status: { $ne: 'paid' } },
      { 
        $inc: { paidAmount: paymentAmount },
        $set: { 
          paidDate: new Date(),
          status: (invoice.paidAmount || 0) + paymentAmount >= invoice.totalAmount ? 'paid' : 'partially_paid'
        }
      },
      { new: true }
    );

    if (!updatedInvoice) {
      throw new Error('Payment failed due to a concurrency conflict. Please try again.');
    }

    const payment = await Payment.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      amount: paymentAmount,
      method: paymentMethod,
      type: 'payment',
      status: 'completed',
      idempotencyKey,
      referenceId: req.body.referenceId || 'txn_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    });

    // Ledger: Debit Cash/Bank, Credit Accounts Receivable
    const assetAccount = ['cash', 'wallet'].includes(paymentMethod) ? 'CASH_IN_HAND' : 'BANK_ACCOUNT';
    await recordLedgerTransaction({
      tenantId: invoice.tenantId,
      debitAccount: assetAccount,
      creditAccount: 'ACCOUNTS_RECEIVABLE',
      amount: paymentAmount,
      transactionType: 'PAYMENT',
      referenceId: payment._id,
      referenceModel: 'Payment',
      description: `Payment received for Invoice ${invoice.invoiceNumber || invoice._id}`,
      createdBy: req.user?._id
    });

    sendSuccess(res, updatedInvoice, 'Payment processed successfully');
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const originalPayment = await Payment.findById(req.params.id);
    if (!originalPayment) throw new NotFoundError('Payment not found');
    if (originalPayment.type !== 'payment') throw new Error('Can only refund valid payments');
    if (originalPayment.status !== 'completed') throw new Error('Can only refund completed payments');

    const refundAmount = req.body.amount;
    if (!refundAmount || refundAmount <= 0) throw new Error('Invalid refund amount');

    // Refund policy checks based on user rules
    const method = req.body.method || originalPayment.method;
    if (method === 'cash') throw new Error('Security Policy: Cash refunds are strictly prohibited. Please select bank_transfer or original method.');

    // Aggregate existing refunds to prevent overdrafting the original payment
    const existingRefunds = await Payment.aggregate([
      { $match: { referenceId: originalPayment._id.toString(), type: 'refund' } },
      { $group: { _id: null, totalRefunded: { $sum: { $abs: "$amount" } } } }
    ]);
    const totalRefundedSoFar = existingRefunds[0]?.totalRefunded || 0;
    
    // Non-refundable items check
    const invoice = await Invoice.findById(originalPayment.invoiceId);
    if (!invoice) throw new NotFoundError('Associated invoice not found');

    let nonRefundableAmount = 0;
    invoice.items.forEach((item: any) => {
      const desc = item.description.toLowerCase();
      if (
        desc.includes('registration') || 
        desc.includes('admin') || 
        item.itemCategory === 'Medicine'
      ) {
        nonRefundableAmount += item.total;
      }
    });

    const absoluteMaxRefundable = originalPayment.amount - totalRefundedSoFar;
    const policyMaxRefundable = invoice.totalAmount - nonRefundableAmount - totalRefundedSoFar;
    
    const maxAllowed = Math.min(absoluteMaxRefundable, policyMaxRefundable);

    if (refundAmount > maxAllowed) {
      throw new Error(`Refund blocked. Contains non-refundable items or overdraft. Max refundable for this transaction is ₹${maxAllowed.toFixed(2)}`);
    }

    // Determine refund status based on amount (Mocking an approval threshold of ₹10,000)
    // In reality, this would map to a roles system
    const refundStatus = refundAmount >= 10000 ? 'pending' : 'refunded';

    // Create refund log
    const refund = await Payment.create({
      tenantId: originalPayment.tenantId,
      invoiceId: originalPayment.invoiceId,
      amount: -Math.abs(refundAmount),
      method: method,
      type: 'refund',
      status: refundStatus,
      referenceId: originalPayment._id.toString(), // Link to original payment
    });

    // If auto-approved, update the invoice immediately
    if (refundStatus === 'refunded') {
      // Atomic update to decrease paidAmount safely
      await Invoice.updateOne(
        { _id: invoice._id },
        {
          $inc: { paidAmount: -refundAmount },
          $set: { status: ((invoice.paidAmount || 0) - refundAmount) <= 0 ? 'unpaid' : 'partially_paid' }
        }
      );
      
      // Ledger: Debit Revenue (or Refund Clearing), Credit Cash/Bank
      const assetAccount = ['cash', 'wallet'].includes(method) ? 'CASH_IN_HAND' : 'BANK_ACCOUNT';
      await recordLedgerTransaction({
        tenantId: originalPayment.tenantId,
        debitAccount: 'REFUND_CLEARING', // In strict accounting, debit revenue or a contra-revenue account
        creditAccount: assetAccount,
        amount: refundAmount,
        transactionType: 'REFUND',
        referenceId: refund._id,
        referenceModel: 'Payment',
        description: `Refund processed for Payment ${originalPayment._id}`,
        createdBy: req.user?._id
      });

      sendSuccess(res, refund, 'Refund processed successfully');
    } else {
      sendSuccess(res, refund, 'Refund request submitted for Manager Approval (Threshold Exceeded)');
    }
  } catch (err) {
    next(err);
  }
}

export async function createCreditNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found');

    const Counter = mongoose.model('Counter');
    const today = new Date();
    const financialYear = `${String(today.getFullYear()).slice(2)}${String(today.getFullYear() + 1).slice(2)}`;
    
    const counter = await Counter.findOneAndUpdate(
      { tenantId: invoice.tenantId, entityName: 'CreditNote', financialYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const noteNumber = `CN-${financialYear}-${String(counter.seq).padStart(5, '0')}`;

    const creditNote = await CreditNote.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      noteNumber,
      amount: req.body.amount,
      reason: req.body.reason,
      status: 'issued',
      createdBy: req.user?._id
    });

    // Optionally update invoice.locked = true to prevent further edits if they issue a CN
    if (!invoice.locked) {
      invoice.locked = true;
      await invoice.save();
    }

    sendCreated(res, creditNote, 'Credit Note issued successfully');
  } catch (err) {
    next(err);
  }
}

export async function createDebitNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found');

    const Counter = mongoose.model('Counter');
    const today = new Date();
    const financialYear = `${String(today.getFullYear()).slice(2)}${String(today.getFullYear() + 1).slice(2)}`;
    
    const counter = await Counter.findOneAndUpdate(
      { tenantId: invoice.tenantId, entityName: 'DebitNote', financialYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const noteNumber = `DN-${financialYear}-${String(counter.seq).padStart(5, '0')}`;

    const debitNote = await DebitNote.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      noteNumber,
      amount: req.body.amount,
      reason: req.body.reason,
      status: 'issued',
      createdBy: req.user?._id
    });

    if (!invoice.locked) {
      invoice.locked = true;
      await invoice.save();
    }

    sendCreated(res, debitNote, 'Debit Note issued successfully');
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
    }, 'Revenue summary fetched successfully');
  } catch (err) {
    next(err);
  }
}

// ── Shift Management ──────────────────────────────────────────

export async function openShift(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { openingBalance } = req.body;
    
    const existingShift = await CashDrawerShift.findOne({ userId: req.user?._id, status: 'OPEN' });
    if (existingShift) {
      throw new Error('You already have an open shift. Please close it before opening a new one.');
    }

    const shift = await CashDrawerShift.create({
      tenantId: req.body.tenantId || req.user?.tenantId,
      userId: req.user?._id,
      openingBalance,
      status: 'OPEN'
    });

    sendCreated(res, shift, 'Shift opened successfully');
  } catch (err) {
    next(err);
  }
}

export async function closeShift(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { closingBalance, notes } = req.body;
    const shiftId = req.params.id;

    const shift = await CashDrawerShift.findById(shiftId);
    if (!shift) throw new NotFoundError('Shift not found');
    if (shift.status === 'CLOSED') throw new Error('Shift is already closed');
    
    const systemExpectedBalance = shift.openingBalance; 
    const cashDifference = closingBalance - systemExpectedBalance;

    shift.closingBalance = closingBalance;
    shift.systemExpectedBalance = systemExpectedBalance;
    shift.cashDifference = cashDifference;
    shift.notes = notes;
    shift.closedAt = new Date();
    shift.status = 'CLOSED';

    await shift.save();

    sendSuccess(res, shift, 'Shift closed successfully');
  } catch (err) {
    next(err);
  }
}

// ── Ledger Closing & Reconciliation ──────────────────────────

export async function closeDailyLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(23, 59, 59, 999); // End of the day

    // Lock all ledger entries up to targetDate that are not already closed
    const result = await LedgerEntry.updateMany(
      { 
        tenantId: req.user?.tenantId,
        transactionDate: { $lte: targetDate },
        isClosed: false 
      },
      { $set: { isClosed: true } }
    );

    sendSuccess(res, { closedEntriesCount: result.modifiedCount }, `Daily ledger closed successfully up to ${targetDate.toISOString()}`);
  } catch (err) {
    next(err);
  }
}

export async function closeFinancialYear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { financialYear } = req.body; // e.g. '2526'
    if (!financialYear) throw new Error('Financial year is required');

    const result = await LedgerEntry.updateMany(
      { 
        tenantId: req.user?.tenantId,
        financialYear,
        isClosed: false 
      },
      { $set: { isClosed: true } }
    );

    sendSuccess(res, { closedEntriesCount: result.modifiedCount }, `Financial year ${financialYear} closed successfully`);
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

    // Update Invoice Status
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (invoice) {
      invoice.paidAmount = (invoice.paidAmount || 0) + req.body.amount;
      if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.status = 'paid';
        invoice.paidDate = new Date();
        // Emit Domain Event for Decoupled Inventory/Pharmacy Sync
        eventBus.emitEvent('InvoicePaid', { invoiceId: invoice._id, items: invoice.items });
      } else {
        invoice.status = 'partially_paid';
      }
      await invoice.save();
    }

    sendCreated(res, payment, 'Payment recorded');
  } catch (err) {
    next(err);
  }
}

export async function reconcilePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { settlementId, settlementDate, gatewayStatus } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.isReconciled) throw new Error('Payment is already reconciled');

    payment.settlementId = settlementId;
    payment.settlementDate = settlementDate ? new Date(settlementDate) : new Date();
    payment.gateway = payment.gateway || 'reconciled_manual';
    
    if (gatewayStatus) {
      payment.status = gatewayStatus;
    }
    
    payment.isReconciled = true;
    await payment.save();

    sendSuccess(res, payment, 'Payment reconciled successfully');
  } catch (err) {
    next(err);
  }
}
