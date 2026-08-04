import mongoose from 'mongoose';
import { Invoice, Payment, CreditNote, DebitNote } from '../models/Billing';
import { LedgerEntry, CashDrawerShift } from '../models/Ledger';
import { TPAClaim } from '../models/TPA';
import { IPDBill } from '../models/IPD';
import { PatientWallet, WalletTransaction } from '../models/Wallet';
import Counter from '../models/Counter';
import { Patient } from '../models/Patient';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import { getRandomElement, getRandomNumber, getRandomDateInPast } from './helpers';

export async function seedBillingLedgerAndFinance() {
  console.log('Seeding Billing Invoices, Payments, Ledger Entries, TPA Claims, Wallets, and IPD Bills...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const patientIds = idMap.patients.get(config.code)!;
    const adminUserId = idMap.users.get(`${config.code}:HOSPITAL_ADMIN:admin@${config.emailDomain}`)!;

    const patients = await Patient.find({ _id: { $in: patientIds } }).select('_id name lastName status');
    if (patients.length === 0) continue;

    const invoiceIds: mongoose.Types.ObjectId[] = [];
    const financialYear = '2627'; // FY 2026-27

    // Ensure Counter exists for Invoice sequence
    await Counter.findOneAndUpdate(
      { tenantId, entityName: 'Invoice', financialYear },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );

    // 1. Invoices (130 per hospital)
    for (let i = 1; i <= 130; i++) {
      const patient = getRandomElement(patients);
      const isPaid = i <= 100;
      const isPartiallyPaid = i > 100 && i <= 115;
      const status = isPaid ? 'paid' : isPartiallyPaid ? 'partially_paid' : 'unpaid';

      const invoiceType = getRandomElement(['OPD', 'IPD', 'Lab', 'Pharmacy', 'Package']);
      const billingMode = i % 5 === 0 ? 'Insurance' : 'Self-Pay';
      const baseAmount = getRandomNumber(800, 15000);
      const gstAmount = Math.round(baseAmount * 0.12);
      const total = baseAmount + gstAmount;

      const invNo = `INV-${config.code.substring(0, 3)}-${financialYear}-${String(i).padStart(5, '0')}`;

      let invoice = await Invoice.findOne({ tenantId, invoiceNumber: invNo });
      if (!invoice) {
        invoice = await Invoice.create({
          tenantId,
          hospitalId,
          patientId: patient._id,
          patientName: `${patient.name} ${patient.lastName || ''}`.trim(),
          invoiceNumber: invNo,
          invoiceType,
          billingMode,
          tenantName: config.name,
          amount: baseAmount,
          taxAmount: gstAmount,
          taxBreakup: {
            cgst: gstAmount / 2,
            sgst: gstAmount / 2,
            igst: 0,
          },
          totalAmount: total,
          paidAmount: isPaid ? total : isPartiallyPaid ? Math.round(total / 2) : 0,
          currency: 'INR',
          status,
          locked: isPaid,
          issuedDate: getRandomDateInPast(20),
          dueDate: getRandomDateInPast(5),
          items: [
            {
              itemId: `ITEM-${i}`,
              itemName: `${invoiceType} Consultation & Services`,
              quantity: 1,
              unitPrice: baseAmount,
              taxRate: 12,
              taxAmount: gstAmount,
              total,
            },
          ],
          createdBy: adminUserId,
        });
      }
      invoiceIds.push(invoice._id);

      // 2. Payment document for paid/partially paid invoices
      if (isPaid || isPartiallyPaid) {
        const payAmount = isPaid ? total : Math.round(total / 2);
        const payMethod = getRandomElement(['upi', 'cash', 'credit_card', 'debit_card', 'bank_transfer']);
        
        let payment = await Payment.findOne({ tenantId, invoiceId: invoice._id });
        if (!payment) {
          payment = await Payment.create({
            tenantId,
            invoiceId: invoice._id,
            patientId: patient._id,
            amount: payAmount,
            currency: 'INR',
            type: 'payment',
            method: payMethod,
            status: 'completed',
            referenceId: `UPI-${config.code}-${100000 + i}`,
            paymentDate: invoice.issuedDate,
            isReconciled: true,
          });
        }

        // 3. Double-Entry Ledger Entry
        let ledger = await LedgerEntry.findOne({ tenantId, referenceId: payment._id });
        if (!ledger) {
          await LedgerEntry.create({
            tenantId,
            transactionDate: invoice.issuedDate,
            accountId: payMethod === 'cash' ? 'CASH_IN_HAND' : 'BANK_ACCOUNT',
            accountName: payMethod === 'cash' ? 'Cash Counter Drawer' : 'HDFC Bank Operating AC',
            debit: payAmount,
            credit: 0,
            transactionType: 'PAYMENT',
            referenceId: payment._id,
            referenceModel: 'Payment',
            description: `Payment received for Invoice ${invNo}`,
            financialYear,
            isClosed: true,
            createdBy: adminUserId,
          });
        }
      }

      // 4. Insurance TPA Claim for insurance billing mode
      if (billingMode === 'Insurance' && i % 3 === 0) {
        let claim = await TPAClaim.findOne({ tenantId, invoiceId: invoice._id });
        if (!claim) {
          await TPAClaim.create({
            tenantId,
            patientId: patient._id,
            invoiceId: invoice._id,
            tpaName: getRandomElement(['Star Health Insurance', 'HDFC ERGO Health', 'Care Health Insurance', 'ICICI Lombard']),
            policyNumber: `POL-MP-${20000 + i}`,
            claimAmount: total,
            approvedAmount: isPaid ? total : undefined,
            status: isPaid ? 'APPROVED' : 'SUBMITTED',
            submissionDate: getRandomDateInPast(15),
          });
        }
      }
    }

    // 5. Patient Wallets & IPD Bills
    for (const p of patients) {
      // Wallet
      let wallet = await PatientWallet.findOne({ tenantId, patientId: p._id });
      if (!wallet) {
        const bal = p.status === 'Admitted' ? 10000 : 2000;
        wallet = await PatientWallet.create({
          tenantId,
          patientId: p._id,
          balance: bal,
          bedDepositBalance: p.status === 'Admitted' ? 5000 : 0,
        });

        await WalletTransaction.create({
          tenantId,
          walletId: wallet._id,
          amount: bal,
          type: 'DEPOSIT',
          description: 'Initial advance deposit for medical treatment',
        });
      }

      // IPD Bill for admitted patients
      if (p.status === 'Admitted' || p.status === 'ICU') {
        let ipdBill = await IPDBill.findOne({ tenantId, patientId: p._id });
        if (!ipdBill) {
          await IPDBill.create({
            tenantId,
            patientId: p._id,
            admissionId: new mongoose.Types.ObjectId(),
            roomCharges: 12000,
            nursingCharges: 3000,
            consultationCharges: 4500,
            pharmacyCharges: 6800,
            status: 'ACTIVE',
          });
        }
      }
    }

    // 6. Cash Drawer Shift for cashiers
    let shift = await CashDrawerShift.findOne({ tenantId, userId: adminUserId });
    if (!shift) {
      await CashDrawerShift.create({
        tenantId,
        userId: adminUserId,
        openedAt: getRandomDateInPast(1),
        status: 'OPEN',
        openingBalance: 5000,
        systemExpectedBalance: 48500,
      });
    }

    idMap.invoices.set(config.code, invoiceIds);
    console.log(`Synced Billing, Payments, Ledger & Finance for ${config.name}`);
  }
}
