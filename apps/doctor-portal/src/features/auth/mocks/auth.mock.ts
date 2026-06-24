import { User } from "../types/auth.types";

export const MOCK_DOCTOR: User = {
  id: "doc-1",
  name: "Dr. Alexander Fleming",
  email: "doctor@medichain.com",
  role: "DOCTOR",
  tenantId: "tenant-1",
  specialty: "Cardiology",
  hospitalId: "hosp-1",
  avatar: "/avatars/doctor.png"
};
