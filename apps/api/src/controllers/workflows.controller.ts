import { Request, Response, NextFunction } from 'express';
import { FinancialRequest, ApprovalMatrix } from '../models/Workflows';
import { Invoice } from '../models/Billing';
import { LedgerEntry } from '../models/Ledger';
import mongoose from 'mongoose';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

export async function requestFinancialAdjustment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { invoiceId, requestType, amount, reason } = req.body; // requestType: DISCOUNT, WAIVER, WRITE_OFF
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found');

    const request = await FinancialRequest.create({
      tenantId: invoice.tenantId,
      invoiceId,
      requestType,
      amount,
      reason,
      status: 'PENDING',
      requestedBy: req.user?._id
    });

    // Check approval matrix to see if auto-approve is possible
    const matrix = await ApprovalMatrix.findOne({
      tenantId: invoice.tenantId,
      actionType: requestType,
      role: req.user?.role
    });

    if (matrix && amount <= matrix.maxAmount) {
      // Auto-Approve
      request.status = 'APPROVED';
      request.approvedBy = req.user?._id;
      request.resolvedAt = new Date();
      await request.save();

      // Apply to invoice
      if (requestType === 'DISCOUNT') {
        invoice.discountAmount = (invoice.discountAmount || 0) + amount;
        invoice.discountReason = reason;
      }
      // Note: Waivers and Write-offs would typically deduct from the due balance or create credit notes
      // For this implementation, we will treat them similarly to discounts adjusting total balance
      if (['WAIVER', 'WRITE_OFF'].includes(requestType)) {
        invoice.totalAmount -= amount; // Simplify for now
      }
      await invoice.save();

      // Ledger: Debit Discount/WriteOff Expense, Credit Accounts Receivable
      const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
      await LedgerEntry.create([
        {
          tenantId: invoice.tenantId,
          accountId: `${requestType}_EXPENSE`,
          accountName: `${requestType.replace(/_/g, ' ')} EXPENSE`,
          debit: amount,
          credit: 0,
          transactionType: requestType,
          referenceId: request._id,
          referenceModel: 'Invoice',
          description: `Auto-Approved ${requestType} for Invoice ${invoice.invoiceNumber}`,
          financialYear: fy
        },
        {
          tenantId: invoice.tenantId,
          accountId: 'ACCOUNTS_RECEIVABLE',
          accountName: 'ACCOUNTS RECEIVABLE',
          debit: 0,
          credit: amount,
          transactionType: requestType,
          referenceId: request._id,
          referenceModel: 'Invoice',
          description: `Auto-Approved ${requestType} for Invoice ${invoice.invoiceNumber}`,
          financialYear: fy
        }
      ]);

      sendCreated(res, request, `${requestType} Auto-Approved successfully`);
      return;
    }

    sendCreated(res, request, `${requestType} Request submitted for higher approval`);
  } catch (err) {
    next(err);
  }
}

export async function approveFinancialRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const request = await FinancialRequest.findById(req.params.id);
    if (!request) throw new NotFoundError('Request not found');
    if (request.status !== 'PENDING') throw new Error('Request already resolved');

    request.status = status;
    request.approvedBy = req.user?._id;
    request.resolvedAt = new Date();
    await request.save();

    if (status === 'APPROVED') {
      const invoice = await Invoice.findById(request.invoiceId);
      if (invoice) {
        if (request.requestType === 'DISCOUNT') {
          invoice.discountAmount = (invoice.discountAmount || 0) + request.amount;
          invoice.discountReason = request.reason;
        }
        if (['WAIVER', 'WRITE_OFF'].includes(request.requestType)) {
          invoice.totalAmount -= request.amount;
        }
        await invoice.save();

        const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
        await LedgerEntry.create([
          {
            tenantId: invoice.tenantId,
            accountId: `${request.requestType}_EXPENSE`,
            accountName: `${request.requestType.replace(/_/g, ' ')} EXPENSE`,
            debit: request.amount,
            credit: 0,
            transactionType: request.requestType,
            referenceId: request._id,
            referenceModel: 'Invoice',
            description: `Approved ${request.requestType} for Invoice ${invoice.invoiceNumber}`,
            financialYear: fy
          },
          {
            tenantId: invoice.tenantId,
            accountId: 'ACCOUNTS_RECEIVABLE',
            accountName: 'ACCOUNTS RECEIVABLE',
            debit: 0,
            credit: request.amount,
            transactionType: request.requestType,
            referenceId: request._id,
            referenceModel: 'Invoice',
            description: `Approved ${request.requestType} for Invoice ${invoice.invoiceNumber}`,
            financialYear: fy
          }
        ]);
      }
    }

    sendSuccess(res, request, `Request ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
}
