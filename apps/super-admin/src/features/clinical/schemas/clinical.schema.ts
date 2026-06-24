import * as z from "zod";

export const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("A valid email address is required"),
  specialization: z.string().min(2, "Specialization is required"),
  hospitalId: z.string().min(1, "Hospital is required"),
  branchId: z.string().min(1, "Branch is required"),
  departmentId: z.string().min(1, "Department is required"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  rating: z.coerce.number().min(0).max(5).default(5),
  status: z.enum(["Active", "Inactive", "Suspended", "On Leave"]).default("Active"),
});


export const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().min(1, "Gender is required"),
  age: z.coerce.number().min(0, "Age cannot be negative"),
  hospitalId: z.string().min(1, "Hospital is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  status: z.string().default("Active"),
  lastVisit: z.string().min(1, "Last visit date is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  patientId: z.string().min(1, "Patient is required"),
  hospitalId: z.string().min(1, "Hospital is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["Completed", "Pending", "Cancelled", "Rescheduled"]).default("Pending"),
});

export type DoctorInput = z.infer<typeof doctorSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
