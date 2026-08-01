import { Request, Response, NextFunction } from 'express';
import { PatientWallet, WalletTransaction } from '../models/Wallet';
import { LedgerEntry } from '../models/Ledger';
import { Invoice } from '../models/Billing';
import mongoose from 'mongoose';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

export async function depositToWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, amount, type, description } = req.body;
    
    let wallet = await PatientWallet.findOne({ patientId });
    if (!wallet) {
      wallet = new PatientWallet({
        tenantId: req.user?.tenantId,
        patientId,
        balance: 0,
        bedDepositBalance: 0
      });
    }

    if (type === 'BED_DEPOSIT') {
      wallet.bedDepositBalance += amount;
    } else {
      wallet.balance += amount;
    }
    await wallet.save();

    const transaction = await WalletTransaction.create({
      tenantId: wallet.tenantId,
      walletId: wallet._id,
      amount,
      type: type === 'BED_DEPOSIT' ? 'BED_DEPOSIT' : 'DEPOSIT',
      description
    });

    // Ledger: Debit Cash, Credit Advance Liability (Wallet)
    const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
    await LedgerEntry.create([
      {
        tenantId: wallet.tenantId,
        accountId: 'CASH_IN_HAND',
        accountName: 'CASH IN HAND',
        debit: amount,
        credit: 0,
        transactionType: 'PAYMENT', // Or ADVANCE
        referenceId: transaction._id,
        referenceModel: 'Payment', // Just a string enum we can use
        description: `Wallet Deposit for Patient ${patientId}`,
        financialYear: fy
      },
      {
        tenantId: wallet.tenantId,
        accountId: 'ADVANCE_LIABILITY',
        accountName: 'ADVANCE LIABILITY',
        debit: 0,
        credit: amount,
        transactionType: 'PAYMENT',
        referenceId: transaction._id,
        referenceModel: 'Payment',
        description: `Wallet Deposit for Patient ${patientId}`,
        financialYear: fy
      }
    ]);

    sendCreated(res, { wallet, transaction }, 'Deposit successful');
  } catch (err) {
    next(err);
  }
}

export async function allocateFromWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, invoiceId, amount, description } = req.body;
    
    const wallet = await PatientWallet.findOne({ patientId });
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient wallet balance');

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (invoice.totalAmount - (invoice.paidAmount || 0) < amount) {
      throw new Error('Allocation exceeds invoice due amount');
    }

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    // Create wallet transaction
    const transaction = await WalletTransaction.create({
      tenantId: wallet.tenantId,
      walletId: wallet._id,
      amount,
      type: 'ALLOCATION',
      referenceId: invoice._id,
      description: description || `Allocated to Invoice ${invoice.invoiceNumber}`
    });

    // Update invoice
    await Invoice.findByIdAndUpdate(invoiceId, {
      $inc: { paidAmount: amount },
      $set: { status: ((invoice.paidAmount || 0) + amount) >= invoice.totalAmount ? 'paid' : 'partially_paid' }
    });

    // Ledger: Debit Advance Liability, Credit Accounts Receivable
    const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
    await LedgerEntry.create([
      {
        tenantId: wallet.tenantId,
        accountId: 'ADVANCE_LIABILITY',
        accountName: 'ADVANCE LIABILITY',
        debit: amount,
        credit: 0,
        transactionType: 'PAYMENT',
        referenceId: transaction._id,
        referenceModel: 'Payment',
        description: `Wallet Allocation to Invoice ${invoice.invoiceNumber}`,
        financialYear: fy
      },
      {
        tenantId: wallet.tenantId,
        accountId: 'ACCOUNTS_RECEIVABLE',
        accountName: 'ACCOUNTS RECEIVABLE',
        debit: 0,
        credit: amount,
        transactionType: 'PAYMENT',
        referenceId: transaction._id,
        referenceModel: 'Payment',
        description: `Wallet Allocation to Invoice ${invoice.invoiceNumber}`,
        financialYear: fy
      }
    ]);

    sendSuccess(res, { wallet, transaction }, 'Wallet allocation successful');
  } catch (err) {
    next(err);
  }
}

export async function refundBedDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, amount, description } = req.body;
    
    const wallet = await PatientWallet.findOne({ patientId });
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.bedDepositBalance < amount) throw new Error('Insufficient bed deposit balance to refund');

    wallet.bedDepositBalance -= amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      tenantId: wallet.tenantId,
      walletId: wallet._id,
      amount,
      type: 'BED_REFUND',
      description: description || 'Bed Deposit Refund'
    });

    const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;
    await LedgerEntry.create([
      {
        tenantId: wallet.tenantId,
        accountId: 'ADVANCE_LIABILITY',
        accountName: 'ADVANCE LIABILITY',
        debit: amount,
        credit: 0,
        transactionType: 'REFUND',
        referenceId: transaction._id,
        referenceModel: 'Payment',
        description: `Bed Deposit Refund for Patient ${patientId}`,
        financialYear: fy
      },
      {
        tenantId: wallet.tenantId,
        accountId: 'CASH_IN_HAND',
        accountName: 'CASH IN HAND',
        debit: 0,
        credit: amount,
        transactionType: 'REFUND',
        referenceId: transaction._id,
        referenceModel: 'Payment',
        description: `Bed Deposit Refund for Patient ${patientId}`,
        financialYear: fy
      }
    ]);

    sendSuccess(res, { wallet, transaction }, 'Bed deposit refunded successfully');
  } catch (err) {
    next(err);
  }
}
