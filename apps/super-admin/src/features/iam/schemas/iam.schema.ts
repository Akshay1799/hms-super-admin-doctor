import * as z from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Please select a role"),
  tenantId: z.string().min(1, "Tenant selection is required"),
  hospitalId: z.string().optional().default(""),
  branchId: z.string().optional().default(""),
  status: z.enum(["Active", "Inactive", "Suspended", "Pending"]).default("Active"),
});

export const updateUserSchema = createUserSchema.partial();

export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  permissions: z.array(z.string()).default([]),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const mfaSchema = z.object({
  mfaEnabled: z.boolean(),
  method: z.enum(["Email OTP", "Authenticator App", "SMS OTP"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type MfaInput = z.infer<typeof mfaSchema>;
