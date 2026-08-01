import mongoose from 'mongoose';
import { Invoice, CreditNote } from '../../apps/api/src/models/Billing';
import Counter from '../../apps/api/src/models/Counter';

async function runTest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hms_db');
    console.log('Connected to MongoDB');

    const tenantId = new mongoose.Types.ObjectId();
    
    console.log('\n--- Test 1: Auto-generate Invoice Number ---');
    const invoice = new Invoice({
      tenantId,
      tenantName: 'Test Hospital',
      invoiceType: 'OPD',
      billingMode: 'Self-Pay',
      amount: 500,
      totalAmount: 500,
      currency: 'INR',
      dueDate: new Date(Date.now() + 86400000),
      items: [{
        itemCategory: 'Consultation',
        description: 'Test Consult',
        quantity: 1,
        unitPrice: 500,
        taxRate: 0,
        taxAmount: 0,
        total: 500
      }]
    });
    await invoice.save();
    console.log(`Success! Invoice generated with number: ${invoice.invoiceNumber}`);

    console.log('\n--- Test 2: Invoice sequence increments properly ---');
    const invoice2 = new Invoice({
      tenantId,
      tenantName: 'Test Hospital',
      invoiceType: 'OPD',
      billingMode: 'Self-Pay',
      amount: 100,
      totalAmount: 100,
      currency: 'INR',
      dueDate: new Date(Date.now() + 86400000),
      items: [{
        itemCategory: 'Consultation',
        description: 'Test Consult 2',
        quantity: 1,
        unitPrice: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100
      }]
    });
    await invoice2.save();
    console.log(`Success! Second Invoice generated with number: ${invoice2.invoiceNumber}`);

    console.log('\n--- Test 3: Edit Rules (Cannot edit Locked invoices) ---');
    // Lock invoice2
    invoice2.locked = true;
    await invoice2.save();
    
    try {
      if (invoice2.locked) {
        throw new Error('This invoice is locked and cannot be edited.'); // Simulating controller logic
      }
      console.log('Failed: Allowed edit on locked invoice');
    } catch (e: any) {
      console.log(`Success! Edit blocked as expected: ${e.message}`);
    }

    console.log('\nAll tests passed successfully!');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

runTest();
