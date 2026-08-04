import mongoose from 'mongoose';

export class SeederIdMap {
  public tenants: Map<string, mongoose.Types.ObjectId> = new Map();
  public hospitals: Map<string, mongoose.Types.ObjectId> = new Map();
  public departments: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of dept ObjectIds
  public departmentByCode: Map<string, mongoose.Types.ObjectId> = new Map(); // "HOSP_CODE:DEPT_CODE" -> dept ObjectId
  public users: Map<string, mongoose.Types.ObjectId> = new Map(); // "HOSP_CODE:ROLE:EMAIL" -> User ObjectId
  public doctors: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of doctor User ObjectIds
  public doctorProfiles: Map<string, mongoose.Types.ObjectId> = new Map(); // doctor User ObjectId string -> DoctorProfile ObjectId
  public patients: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of Patient ObjectIds
  public patientByUhid: Map<string, mongoose.Types.ObjectId> = new Map();
  public medicines: Map<string, mongoose.Types.ObjectId> = new Map(); // generic/brand key -> Medicine ObjectId
  public pharmacyLocations: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of PharmacyLocation ObjectIds
  public suppliers: Map<string, mongoose.Types.ObjectId[]> = new Map(); // tenantCode -> array of Supplier ObjectIds
  public inventoryBatches: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of Batch ObjectIds
  public appointments: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of Appointment ObjectIds
  public invoices: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of Invoice ObjectIds
  public pharmacySales: Map<string, mongoose.Types.ObjectId[]> = new Map(); // hospitalCode -> array of PharmacySale ObjectIds
}

export const idMap = new SeederIdMap();
