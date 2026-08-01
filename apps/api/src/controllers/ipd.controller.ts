import { Request, Response, NextFunction } from 'express';
import { IPDBill } from '../models/IPD';
import { LedgerEntry } from '../models/Ledger';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import mongoose from 'mongoose';

export async function createIPDBill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, admissionId, roomCharges = 0, nursingCharges = 0 } = req.body;
    
    const bill = await IPDBill.create({
      tenantId: req.user?.tenantId,
      patientId,
      admissionId,
      roomCharges,
      nursingCharges,
      status: 'ACTIVE'
    });

    sendCreated(res, bill, 'IPD Bill initialized');
  } catch (err) {
    next(err);
  }
}

export async function runDailyAccrual(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // In production, this would be a Cron job. 
    // This API allows manual triggering for a specific tenant.
    const activeBills = await IPDBill.find({ tenantId: req.user?.tenantId, status: 'ACTIVE' });
    
    let accruedCount = 0;
    const fy = `${String(new Date().getFullYear()).slice(2)}${String(new Date().getFullYear() + 1).slice(2)}`;

    for (const bill of activeBills) {
      // Check if it hasn't been accrued today
      const today = new Date();
      today.setHours(0,0,0,0);
      if (bill.lastAccrualDate >= today) continue; // Already accrued for today

      // In a real system, you'd fetch the patient's daily room rate from their admission record
      const dailyRoomRate = 2000; 
      const dailyNursingRate = 500;

      bill.roomCharges += dailyRoomRate;
      bill.nursingCharges += dailyNursingRate;
      bill.lastAccrualDate = new Date();
      await bill.save(); // totalAccrued is updated via pre-save hook

      // Accrual Ledger Entries (Debit UNBILLED_RECEIVABLES, Credit REVENUE_IPD)
      await LedgerEntry.create([
        {
          tenantId: bill.tenantId,
          accountId: 'UNBILLED_RECEIVABLES',
          accountName: 'UNBILLED RECEIVABLES',
          debit: dailyRoomRate + dailyNursingRate,
          credit: 0,
          transactionType: 'INVOICE',
          referenceId: bill._id,
          referenceModel: 'Invoice', // Generic ref
          description: `Daily Accrual for Admission ${bill.admissionId}`,
          financialYear: fy
        },
        {
          tenantId: bill.tenantId,
          accountId: 'REVENUE_IPD',
          accountName: 'REVENUE IPD',
          debit: 0,
          credit: dailyRoomRate + dailyNursingRate,
          transactionType: 'INVOICE',
          referenceId: bill._id,
          referenceModel: 'Invoice',
          description: `Daily Accrual for Admission ${bill.admissionId}`,
          financialYear: fy
        }
      ]);

      accruedCount++;
    }

    sendSuccess(res, { accruedCount }, `Daily IPD accrual completed for ${accruedCount} patients`);
  } catch (err) {
    next(err);
  }
}
