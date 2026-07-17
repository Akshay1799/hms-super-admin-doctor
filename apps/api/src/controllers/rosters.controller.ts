import { Request, Response, NextFunction } from 'express';
import { Roster } from '../models/Roster';
import { sendSuccess, sendCreated } from '../utils/response';

export async function listRosters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId, startDate, endDate } = req.query;
    const filter: Record<string, any> = {};

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.tenantId = req.user?.tenantId;
    }

    if (departmentId) {
      filter.departmentId = departmentId;
    } else if (req.user?.role === 'DEPT_ADMIN') {
      filter.departmentId = req.user.departmentId;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const rosters = await Roster.find(filter)
      .populate('userId', 'name email role specialty')
      .sort({ date: 1 });

    sendSuccess(res, rosters, 'Rosters retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function upsertRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, date, shiftType, departmentId, notes } = req.body;

    const tenantId = req.user?.tenantId;
    const hospitalId = req.user?.hospitalId;
    const activeDeptId = departmentId || (req.user?.role === 'DEPT_ADMIN' ? req.user.departmentId : null);

    // Parse date to start of day UTC
    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    const roster = await Roster.findOneAndUpdate(
      { userId, date: parsedDate },
      {
        userId,
        date: parsedDate,
        shiftType,
        departmentId: activeDeptId,
        hospitalId,
        tenantId,
        notes,
      },
      { new: true, upsert: true }
    );

    sendSuccess(res, roster, 'Roster shift configured successfully');
  } catch (err) {
    next(err);
  }
}
