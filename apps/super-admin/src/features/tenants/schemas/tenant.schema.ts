import * as z from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2, "Tenant name must be at least 2 characters").max(100, "Tenant name cannot exceed 100 characters"),
  code: z.string().min(2, "Tenant code is required").toUpperCase(),
  orgType: z.enum(["Hospital Chain", "Clinic", "Diagnostic Center", "Medical Group"]),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().optional(),
  
  plan: z.enum(["Basic", "Professional", "Enterprise"]),
  billingCycle: z.enum(["Monthly", "Yearly"]),
  trialPeriod: z.coerce.number().min(0, "Trial days cannot be negative").default(0),
  status: z.enum(["Trial", "Active", "Expired"]),

  primaryDomain: z.string().min(1, "Primary domain is required"),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean().default(true),

  emr: z.boolean().default(true),
  appointments: z.boolean().default(true),
  billing: z.boolean().default(true),
  pharmacy: z.boolean().default(false),
  inventory: z.boolean().default(false),
  laboratory: z.boolean().default(false),
  radiology: z.boolean().default(false),
  insurance: z.boolean().default(false),
  telemedicine: z.boolean().default(false),
  notifications: z.boolean().default(true),
  reports: z.boolean().default(true),

  maxHospitals: z.coerce.number().min(1, "Minimum 1 hospital is required"),
  maxBranches: z.coerce.number().min(1, "Minimum 1 branch is required"),
  maxDoctors: z.coerce.number().min(1, "Minimum 1 doctor is required"),
  maxStaff: z.coerce.number().min(1, "Minimum 1 staff member is required"),
  maxPatients: z.coerce.number().min(1, "Minimum 1 patient is required"),
  maxStorage: z.coerce.number().min(1, "Minimum 1 GB is required"),
  maxApiCalls: z.coerce.number().min(1, "Minimum 1 API call is required"),
});

export const updateTenantSchema = createTenantSchema.partial();

export const featureFlagsSchema = z.object({
  emr: z.boolean(),
  appointments: z.boolean(),
  billing: z.boolean(),
  pharmacy: z.boolean(),
  inventory: z.boolean(),
  laboratory: z.boolean(),
  radiology: z.boolean(),
  insurance: z.boolean(),
  telemedicine: z.boolean(),
  notifications: z.boolean(),
  reports: z.boolean(),
});

export const quotaSchema = z.object({
  hospitals: z.number().min(1),
  branches: z.number().min(1),
  doctors: z.number().min(1),
  staff: z.number().min(1),
  patients: z.number().min(1),
  storage: z.number().min(1),
  apiCalls: z.number().min(1),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
