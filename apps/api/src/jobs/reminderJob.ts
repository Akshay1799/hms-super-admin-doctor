import cron from 'node-cron';
import { Appointment } from '../models/Appointment';
import { AppointmentReminder } from '../models/AppointmentReminder';

export function startReminderJobs() {
  console.log('[Jobs] Starting Appointment Reminder cron job (runs every 15 minutes)');

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      
      // 24 Hours from now window (between 23:45 and 24:15 hours ahead)
      const tomorrowStart = new Date(now.getTime() + 23.75 * 60 * 60 * 1000);
      const tomorrowEnd = new Date(now.getTime() + 24.25 * 60 * 60 * 1000);

      // 2 Hours from now window (between 1.75 and 2.25 hours ahead)
      const soonStart = new Date(now.getTime() + 1.75 * 60 * 60 * 1000);
      const soonEnd = new Date(now.getTime() + 2.25 * 60 * 60 * 1000);

      // Find appointments in 24-hour window that haven't received a 24h reminder
      const dayAheadAppointments = await Appointment.find({
        status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] },
        date: { $gte: tomorrowStart, $lte: tomorrowEnd },
        'remindersStatus.twentyFourHour': { $ne: true } // Assuming we add this field to tracking
      }).populate('patientId', 'name email').populate('doctorId', 'name');

      for (const appt of dayAheadAppointments) {
        await AppointmentReminder.create({
          tenantId: appt.tenantId,
          hospitalId: appt.hospitalId,
          patientId: appt.patientId,
          appointmentId: appt._id,
          type: '24-Hour Reminder',
          scheduledTime: appt.date,
          channel: 'Email',
          status: 'Delivered',
          deliveryStatus: 'Auto-generated 24h reminder via node-cron'
        });
        
        appt.remindersStatus = { ...appt.remindersStatus, twentyFourHour: true };
        await appt.save();
        console.log(`[Jobs] Sent 24h reminder for Appointment ${appt._id}`);
      }

      // Find appointments in 2-hour window that haven't received a 2h reminder
      const twoHoursAheadAppointments = await Appointment.find({
        status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] },
        date: { $gte: soonStart, $lte: soonEnd },
        'remindersStatus.twoHour': { $ne: true }
      }).populate('patientId', 'name email').populate('doctorId', 'name');

      for (const appt of twoHoursAheadAppointments) {
        await AppointmentReminder.create({
          tenantId: appt.tenantId,
          hospitalId: appt.hospitalId,
          patientId: appt.patientId,
          appointmentId: appt._id,
          type: 'Same-Day Reminder',
          scheduledTime: appt.date,
          channel: 'Email',
          status: 'Delivered',
          deliveryStatus: 'Auto-generated 2h reminder via node-cron'
        });
        
        appt.remindersStatus = { ...appt.remindersStatus, twoHour: true };
        await appt.save();
        console.log(`[Jobs] Sent 2h reminder for Appointment ${appt._id}`);
      }

    } catch (error) {
      console.error('[Jobs] Error in Reminder Cron Job:', error);
    }
  });
}
