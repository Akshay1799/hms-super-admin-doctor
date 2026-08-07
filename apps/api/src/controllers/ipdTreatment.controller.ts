import { Request, Response } from 'express';
import { TreatmentOrder, MedicationAdministration } from '../models/IpdTreatment';
import { Patient } from '../models/Patient';
import { User } from '../models/User';

export const createTreatmentOrder = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { type, medicineName, dosage, route, frequency, volume, infusionRate, instructions, startDate, endDate } = req.body;
    
    // In a real flow, you'd get admissionId from patient's active IPD admission.
    // We'll mock the admissionId for now to keep it simple, since IPD Admission model might not be fully fleshed out.
    const admissionId = patientId; 
    const doctorId = req.user?.id;
    const hospitalId = req.user?.hospitalId;
    const tenantId = req.user?.tenantId;

    if (!hospitalId || !tenantId) {
      return res.status(403).json({ success: false, message: 'Hospital or tenant context missing' });
    }

    const order = new TreatmentOrder({
      patientId,
      admissionId,
      doctorId,
      hospitalId,
      tenantId,
      type,
      medicineName,
      dosage,
      route,
      frequency,
      volume,
      infusionRate,
      instructions,
      startDate: startDate || new Date(),
      endDate
    });

    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTreatmentOrders = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const orders = await TreatmentOrder.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordMedicationAdministration = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, scheduledTime, actualTime, reason, remarks } = req.body;
    
    const order = await TreatmentOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Treatment order not found' });
    }

    const adminRecord = new MedicationAdministration({
      treatmentOrderId: orderId,
      patientId: order.patientId,
      nurseId: req.user?.id,
      hospitalId: req.user?.hospitalId,
      tenantId: req.user?.tenantId,
      scheduledTime,
      actualTime: actualTime || new Date(),
      status,
      reason,
      remarks
    });

    await adminRecord.save();
    res.status(201).json({ success: true, data: adminRecord });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicationAdministrations = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const records = await MedicationAdministration.find({ patientId }).sort({ scheduledTime: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
