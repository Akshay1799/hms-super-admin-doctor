import * as z from "zod";

export const createHospitalSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(2, "Hospital name must be at least 2 characters").max(100, "Hospital name cannot exceed 100 characters"),
  code: z.string().min(2, "Hospital code must be at least 2 characters").toUpperCase(),
  tenantId: z.string().min(1, "Tenant selection is required"),
  type: z.enum(["General Hospital", "Specialty Hospital", "Clinic", "Diagnostic Center", "Teaching Hospital"]),
  email: z.string().min(1, "Primary email is required").email("Please enter a valid email address"),
  phone: z.string().min(1, "Primary phone number is required"),
  website: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),

  // Step 2: Address Information
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),

  // Step 3: Capacity
  totalBeds: z.coerce.number().min(0, "Total beds cannot be negative").default(0),
  icuBeds: z.coerce.number().min(0, "ICU beds cannot be negative").default(0),
  otRooms: z.coerce.number().min(0, "OT rooms cannot be negative").default(0),
  emergencyUnits: z.coerce.number().min(0, "Emergency units cannot be negative").default(0),
  ambulances: z.coerce.number().min(0, "Ambulance count cannot be negative").default(0),
  pharmacyAvailable: z.boolean().default(false),
  laboratoryAvailable: z.boolean().default(false),
  bloodBankAvailable: z.boolean().default(false),

  // Step 4: Accreditation
  nabh: z.enum(["Accredited", "Pending", "Not Applied"]).default("Not Applied"),
  jci: z.enum(["Accredited", "Pending", "Not Applied"]).default("Not Applied"),
  iso: z.enum(["Certified", "Pending", "Not Certified"]).default("Not Certified"),
  licenseNumber: z.string().min(1, "License number is required"),
  expiryDate: z.string().min(1, "License expiry date is required"),
  documents: z.array(z.string()).optional(),

  // Step 5: Settings / Localization
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
  format24h: z.boolean().default(true),
  weekStart: z.enum(["Monday", "Sunday"]).default("Monday"),
});

export const updateHospitalSchema = createHospitalSchema.partial();

export const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  code: z.string().min(2, "Branch code must be at least 2 characters").toUpperCase(),
  city: z.string().min(1, "City is required"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
