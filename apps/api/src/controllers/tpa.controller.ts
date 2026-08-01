import { Request, Response, NextFunction } from 'express';
import { TPAClaim } from '../models/TPA';
import { Invoice } from '../models/Billing';
import { LedgerEntry } from '../models/Ledger';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import mongoose from 'mongoose';

export async function submitClaim(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, invoiceId, tpaName, policyNumber, claimAmount } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found');

    const claim = await TPAClaim.create({
      tenantId: invoice.tenantId,
      patientId,
      invoiceId,
      tpaName,
      policyNumber,
      claimAmount,
      status: 'SUBMITTED'
    });

    sendCreated(res, claim, 'TPA Claim submitted successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateClaimStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, approvedAmount, notes } = req.body;
    
    const claim = await TPAClaim.findById(req.params.id);
    if (!claim) throw new NotFoundError('Claim not found');
    if (claim.status === 'APPROVED' || claim.status === 'REJECTED') {
      throw new Error('Claim is already resolved');
    }

    claim.status = status;
    claim.notes = notes;
    if (approvedAmount !== undefined) {
      claim.approvedAmount = approvedAmount;
    }

    if (status === 'APPROVED' || status === 'PARTIAL_APPROVED') {
      claim.resolutionDate = new Date();
      
      const invoice = await Invoice.findById(claim.invoiceId);
      if (invoice) {
        // TPA payment acts like a payment toward the invoice
        const amountToCredit = claim.approvedAmount || claim.claimAmount;
        invoice.paidAmount = (invoice.paidAmount || 0) + amountToCredit;
        invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partially_paid';
        await invoice.save();

        const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
        
        // Ledger: Debit INSURANCE_RECEIVABLE, Credit ACCOUNTS_RECEIVABLE
        await LedgerEntry.create([
          {
            tenantId: claim.tenantId,
            accountId: 'INSURANCE_RECEIVABLE',
            accountName: 'INSURANCE RECEIVABLE',
            debit: amountToCredit,
            credit: 0,
            transactionType: 'PAYMENT',
            referenceId: claim._id,
            referenceModel: 'Invoice', // Generic ref
            description: `TPA Approval from ${claim.tpaName} for Invoice ${invoice.invoiceNumber}`,
            financialYear: fy
          },
          {
            tenantId: claim.tenantId,
            accountId: 'ACCOUNTS_RECEIVABLE',
            accountName: 'ACCOUNTS RECEIVABLE',
            debit: 0,
            credit: amountToCredit,
            transactionType: 'PAYMENT',
            referenceId: claim._id,
            referenceModel: 'Invoice',
            description: `TPA Approval from ${claim.tpaName} for Invoice ${invoice.invoiceNumber}`,
            financialYear: fy
          }
        ]);
      }
    } else if (status === 'REJECTED') {
      claim.resolutionDate = new Date();
    }

    await claim.save();

    sendSuccess(res, claim, `Claim status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}
