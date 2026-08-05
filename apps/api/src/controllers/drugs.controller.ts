import { Request, Response, NextFunction } from 'express';
import { Medicine } from '../models/Pharmacy';
import { sendSuccess } from '../utils/response';

export async function searchDrugs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, category, limit = '20' } = req.query;
    const filter: Record<string, unknown> = {
      tenantId: req.user!.tenantId,
      status: 'active', // Only active medicines should be prescribed
    };

    if (search) {
      filter.$or = [
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const limitNum = Math.min(100, parseInt(limit as string));

    const drugs = await Medicine.find(filter)
      .select('genericName brandName dosageForm strength category routeOfAdministration manufacturer prescriptionRequired controlledDrugFlag lasaFlag highRiskMedicineFlag')
      .sort({ brandName: 1 })
      .limit(limitNum);

    sendSuccess(res, drugs, 'Drug catalog searched successfully');
  } catch (err) {
    next(err);
  }
}
