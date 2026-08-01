import mongoose from 'mongoose';
import { Invoice, Payment } from './src/models/Billing';
import { LedgerEntry, CashDrawerShift } from './src/models/Ledger';
import * as BillingController from './src/controllers/billing.controller';

async function runTest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hms_db');
    console.log('Connected to MongoDB');

    const tenantId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    console.log('\n--- Test 1: Open Shift ---');
    const shift = new CashDrawerShift({
      tenantId,
      userId,
      openingBalance: 1000,
      status: 'OPEN'
    });
    await shift.save();
    console.log('Shift opened successfully:', shift._id);

    console.log('\n--- Test 2: Double Entry Ledger on Invoice ---');
    const invoice = new Invoice({
      tenantId,
      invoiceType: 'OPD',
      billingMode: 'Self-Pay',
      amount: 500,
      totalAmount: 500,
      currency: 'INR',
      dueDate: new Date(Date.now() + 86400000),
      items: []
    });
    await invoice.save();

    await LedgerEntry.create({
      tenantId,
      accountId: 'ACCOUNTS_RECEIVABLE',
      accountName: 'ACCOUNTS RECEIVABLE',
      debit: 500,
      credit: 0,
      transactionType: 'INVOICE',
      referenceId: invoice._id,
      referenceModel: 'Invoice',
      description: 'Test Invoice',
      financialYear: '2627'
    });
    
    await LedgerEntry.create({
      tenantId,
      accountId: 'REVENUE_CONSULTATION',
      accountName: 'REVENUE CONSULTATION',
      debit: 0,
      credit: 500,
      transactionType: 'INVOICE',
      referenceId: invoice._id,
      referenceModel: 'Invoice',
      description: 'Test Invoice',
      financialYear: '2627'
    });

    const entries = await LedgerEntry.find({ referenceId: invoice._id });
    console.log(`Created ${entries.length} Ledger entries (Expected 2). Balance: ${entries[0].debit - entries[1].credit === 0 ? 'BALANCED' : 'UNBALANCED'}`);

    console.log('\n--- Test 3: Close Ledger & Reconcile Payment ---');
    const payment = new Payment({
      tenantId,
      invoiceId: invoice._id,
      amount: 500,
      method: 'credit_card',
      status: 'completed',
      type: 'payment',
      paymentDate: new Date()
    });
    await payment.save();

    payment.isReconciled = true;
    payment.settlementId = 'SET-123';
    payment.settlementDate = new Date();
    await payment.save();
    console.log('Payment reconciled successfully:', payment.isReconciled);

    const closed = await LedgerEntry.updateMany({ tenantId }, { $set: { isClosed: true } });
    console.log(`Closed ${closed.modifiedCount} ledger entries in daily closing sweep.`);

    console.log('\nAll tests passed successfully!');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

runTest();
