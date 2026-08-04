import mongoose from 'mongoose';
import { Medicine, PharmacyLocation, InventoryBatch, InventoryTransaction } from '../models/Pharmacy';
import { Supplier } from '../models/Procurement';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import { getRandomElement, getRandomNumber, getRandomDateInPast, generateIndianPhone } from './helpers';

export const MASTER_MEDICINES = [
  // Antibiotics & Anti-infectives
  { generic: 'Amoxicillin + Clavulanic Acid', brand: 'Augmentin 625 Duo', mfg: 'GSK India', comp: 'Amoxicillin 500mg + Clavulanic Acid 125mg', form: 'Tablet', strength: '625mg', route: 'Oral', cat: 'Antibiotics', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },
  { generic: 'Azithromycin', brand: 'Azee 500', mfg: 'Cipla Ltd', comp: 'Azithromycin 500mg', form: 'Tablet', strength: '500mg', route: 'Oral', cat: 'Antibiotics', gst: 12, uom: 'Strip of 5', controlled: false, highRisk: false },
  { generic: 'Cefixime', brand: 'Zifi 200', mfg: 'FDC Pharmaceuticals', comp: 'Cefixime Trihydrate 200mg', form: 'Tablet', strength: '200mg', route: 'Oral', cat: 'Antibiotics', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },
  { generic: 'Metronidazole', brand: 'Flagyl 400', mfg: 'Abbott Healthcare', comp: 'Metronidazole 400mg', form: 'Tablet', strength: '400mg', route: 'Oral', cat: 'Antibiotics', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Ciprofloxacin', brand: 'Ciprodac 500', mfg: 'Zydus Cadila', comp: 'Ciprofloxacin 500mg', form: 'Tablet', strength: '500mg', route: 'Oral', cat: 'Antibiotics', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },
  { generic: 'Meropenem Injection', brand: 'Meronem 1g', mfg: 'Pfizer India', comp: 'Meropenem Trihydrate 1000mg', form: 'Injection', strength: '1000mg', route: 'Intravenous', cat: 'Antibiotics', gst: 12, uom: 'Vial', controlled: false, highRisk: true },

  // Cardiac & Cardiovascular
  { generic: 'Amlodipine', brand: 'Amlokind 5', mfg: 'Mankind Pharma', comp: 'Amlodipine Besylate 5mg', form: 'Tablet', strength: '5mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Atorvastatin', brand: 'Atorva 10', mfg: 'Zydus Healthcare', comp: 'Atorvastatin Calcium 10mg', form: 'Tablet', strength: '10mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Metoprolol Succinate', brand: 'Metolar XR 25', mfg: 'Cipla Ltd', comp: 'Metoprolol Succinate 25mg', form: 'Tablet', strength: '25mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Aspirin (Gastro-resistant)', brand: 'Ecosprin 75', mfg: 'USV Pvt Ltd', comp: 'Aspirin 75mg', form: 'Tablet', strength: '75mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 14', controlled: false, highRisk: false },
  { generic: 'Telmisartan', brand: 'Telma 40', mfg: 'Glenmark Pharma', comp: 'Telmisartan 40mg', form: 'Tablet', strength: '40mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Clopidogrel', brand: 'Clopivas 75', mfg: 'Sun Pharma', comp: 'Clopidogrel Bisulfate 75mg', form: 'Tablet', strength: '75mg', route: 'Oral', cat: 'Cardiovascular', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },

  // Anti-Diabetic
  { generic: 'Metformin Hydrochloride', brand: 'Glycomet 500', mfg: 'USV Pvt Ltd', comp: 'Metformin HCl 500mg', form: 'Tablet', strength: '500mg', route: 'Oral', cat: 'Anti-Diabetic', gst: 12, uom: 'Strip of 20', controlled: false, highRisk: false },
  { generic: 'Glimepiride', brand: 'Amaryl 1mg', mfg: 'Sanofi India', comp: 'Glimepiride 1mg', form: 'Tablet', strength: '1mg', route: 'Oral', cat: 'Anti-Diabetic', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Sitagliptin', brand: 'Januvia 100', mfg: 'MSD India', comp: 'Sitagliptin Phosphate 100mg', form: 'Tablet', strength: '100mg', route: 'Oral', cat: 'Anti-Diabetic', gst: 12, uom: 'Strip of 7', controlled: false, highRisk: false },
  { generic: 'Insulin Glargine', brand: 'Lantus SoloStar 100IU', mfg: 'Sanofi India', comp: 'Insulin Glargine 100IU/ml', form: 'Injection', strength: '100IU/ml', route: 'Subcutaneous', cat: 'Anti-Diabetic', gst: 12, uom: 'Pen 3ml', controlled: false, highRisk: true },

  // Painkillers & NSAIDs
  { generic: 'Paracetamol', brand: 'Dolo 650', mfg: 'Micro Labs Ltd', comp: 'Paracetamol 650mg', form: 'Tablet', strength: '650mg', route: 'Oral', cat: 'Analgesics', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Ibuprofen + Paracetamol', brand: 'Combiflam', mfg: 'Sanofi India', comp: 'Ibuprofen 400mg + Paracetamol 325mg', form: 'Tablet', strength: '400mg/325mg', route: 'Oral', cat: 'Analgesics', gst: 12, uom: 'Strip of 20', controlled: false, highRisk: false },
  { generic: 'Diclofenac Sodium', brand: 'Voveran SR 100', mfg: 'Novartis India', comp: 'Diclofenac Sodium 100mg', form: 'Tablet', strength: '100mg', route: 'Oral', cat: 'Analgesics', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Tramadol Hydrochloride', brand: 'Tramazac 50', mfg: 'Zydus Healthcare', comp: 'Tramadol HCl 50mg', form: 'Capsule', strength: '50mg', route: 'Oral', cat: 'Controlled Drugs', gst: 12, uom: 'Strip of 10', controlled: true, highRisk: true },
  { generic: 'Morphine Sulphate Injection', brand: 'Morphitroy 10', mfg: 'Troikaa Pharma', comp: 'Morphine Sulphate 10mg/ml', form: 'Injection', strength: '10mg/ml', route: 'Intravenous', cat: 'Controlled Drugs', gst: 12, uom: 'Ampoule 1ml', controlled: true, highRisk: true },
  { generic: 'Alprazolam', brand: 'Alprax 0.25', mfg: 'Torrent Pharma', comp: 'Alprazolam 0.25mg', form: 'Tablet', strength: '0.25mg', route: 'Oral', cat: 'Controlled Drugs', gst: 12, uom: 'Strip of 15', controlled: true, highRisk: false },

  // Gastrointestinal & Antacids
  { generic: 'Pantoprazole', brand: 'Pan 40', mfg: 'Alkem Laboratories', comp: 'Pantoprazole Sodium 40mg', form: 'Tablet', strength: '40mg', route: 'Oral', cat: 'Gastrointestinal', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Ondansetron', brand: 'Emset 4', mfg: 'Cipla Ltd', comp: 'Ondansetron HCl 4mg', form: 'Tablet', strength: '4mg', route: 'Oral', cat: 'Gastrointestinal', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },
  { generic: 'Domperidone + Rabeprazole', brand: 'Rabeloc RD', mfg: 'Cadila Pharma', comp: 'Rabeprazole 20mg + Domperidone 30mg', form: 'Capsule', strength: '20mg/30mg', route: 'Oral', cat: 'Gastrointestinal', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },

  // Respiratory & Asthma
  { generic: 'Salbutamol Inhaler', brand: 'Asthalin Inhaler 100mcg', mfg: 'Cipla Ltd', comp: 'Salbutamol 100mcg/dose', form: 'Inhaler', strength: '100mcg', route: 'Inhalation', cat: 'Respiratory', gst: 12, uom: 'Canister 200 doses', controlled: false, highRisk: false },
  { generic: 'Montelukast + Levocetirizine', brand: 'Montair LC', mfg: 'Cipla Ltd', comp: 'Montelukast 10mg + Levocetirizine 5mg', form: 'Tablet', strength: '10mg/5mg', route: 'Oral', cat: 'Respiratory', gst: 12, uom: 'Strip of 10', controlled: false, highRisk: false },

  // IV Fluids & Emergency Consumables
  { generic: 'Normal Saline (0.9% NaCl)', brand: 'NS 500ml', mfg: 'Claris Lifesciences', comp: 'Sodium Chloride 0.9% w/v', form: 'IV Bottle', strength: '500ml', route: 'Intravenous', cat: 'IV Fluids', gst: 12, uom: 'Bottle', controlled: false, highRisk: false },
  { generic: 'Ringer Lactate', brand: 'RL 500ml', mfg: 'Albert David Ltd', comp: 'Sodium Lactate Compound', form: 'IV Bottle', strength: '500ml', route: 'Intravenous', cat: 'IV Fluids', gst: 12, uom: 'Bottle', controlled: false, highRisk: false },
  { generic: 'Dextrose 5%', brand: 'D5 500ml', mfg: 'Claris Lifesciences', comp: 'Dextrose 5% w/v', form: 'IV Bottle', strength: '500ml', route: 'Intravenous', cat: 'IV Fluids', gst: 12, uom: 'Bottle', controlled: false, highRisk: false },

  // Vitamins & Supplements
  { generic: 'Vitamin D3 (Cholecalciferol)', brand: 'Urisee 60K', mfg: 'Abbott India', comp: 'Cholecalciferol 60000 IU', form: 'Capsule', strength: '60000 IU', route: 'Oral', cat: 'Vitamins', gst: 12, uom: 'Strip of 4', controlled: false, highRisk: false },
  { generic: 'Calcium + Vitamin D3', brand: 'Shelcal 500', mfg: 'Torrent Pharma', comp: 'Elemental Calcium 500mg + D3 250IU', form: 'Tablet', strength: '500mg', route: 'Oral', cat: 'Vitamins', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
  { generic: 'Methylcobalamin (B12)', brand: 'Nurokind LC', mfg: 'Mankind Pharma', comp: 'Methylcobalamin 1500mcg', form: 'Tablet', strength: '1500mcg', route: 'Oral', cat: 'Vitamins', gst: 12, uom: 'Strip of 15', controlled: false, highRisk: false },
];

export async function seedMedicinesAndInventory() {
  console.log('Seeding Medicines, Suppliers, Pharmacy Locations, Batches and Transactions...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const adminUserId = idMap.users.get(`${config.code}:HOSPITAL_ADMIN:admin@${config.emailDomain}`)!;

    // 1. Suppliers (6 per hospital tenant in MP pharma hubs)
    const supplierIds: mongoose.Types.ObjectId[] = [];
    const supplierNames = [
      { name: 'Indore Pharma Distributors', city: 'Indore', office: '22 Dawa Bazar, RNT Marg' },
      { name: 'Malwa Medical Agencies', city: 'Indore', office: '104 Trade Centre, South Tukoganj' },
      { name: 'Central India Lifesciences', city: 'Bhopal', office: 'Plot 14, MP Nagar Zone II' },
      { name: 'Pithampur Industrial Pharma Co', city: 'Pithampur', office: 'Sector 3 Industrial Area' },
      { name: 'Dewas Generic Depot', city: 'Dewas', office: 'AB Road Commercial Hub' },
      { name: 'Narmada Healthcare Wholesale', city: 'Indore', office: 'G-12 Apollo Tower, MG Road' },
    ];

    for (let s = 0; s < supplierNames.length; s++) {
      const supSpec = supplierNames[s];
      const supCode = `SUP-${config.code}-${s + 1}`;
      let supplier = await Supplier.findOne({ tenantId, supplierCode: supCode });
      if (!supplier) {
        supplier = await Supplier.create({
          tenantId,
          supplierCode: supCode,
          name: supSpec.name,
          gstin: `23AABC${1000 + s}D1Z${s}`,
          drugLicenseNumber: `MP-IND-DL-2020-${200 + s}`,
          contactPerson: `Vikash ${getRandomElement(['Sharma', 'Jain', 'Gupta', 'Patel'])}`,
          email: `supply${s + 1}@${supSpec.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          mobile: generateIndianPhone(),
          address: {
            office: supSpec.office,
            city: supSpec.city,
            state: 'Madhya Pradesh',
            pincode: '452001',
            country: 'India',
          },
          paymentTerms: 'Net 30 Days',
          creditLimit: 500000,
          creditPeriodDays: 30,
          status: 'active',
          performanceScore: 95,
        });
      }
      supplierIds.push(supplier._id);
    }
    idMap.suppliers.set(config.code, supplierIds);

    // 2. Pharmacy Locations (Main, ICU, Emergency)
    const pharmacyTypes = [
      { name: `${config.name} Main Pharmacy`, type: 'main' as const },
      { name: `${config.name} Emergency Pharmacy`, type: 'emergency' as const },
      { name: `${config.name} ICU Satellite Pharmacy`, type: 'icu' as const },
    ];
    const locIds: mongoose.Types.ObjectId[] = [];

    for (const pLoc of pharmacyTypes) {
      let loc = await PharmacyLocation.findOne({ hospitalId, name: pLoc.name });
      if (!loc) {
        loc = await PharmacyLocation.create({
          tenantId,
          hospitalId,
          name: pLoc.name,
          type: pLoc.type,
          status: 'active',
        });
      }
      locIds.push(loc._id);
    }
    idMap.pharmacyLocations.set(config.code, locIds);

    // 3. Medicines (Master catalog for this tenant)
    const medicineIds: mongoose.Types.ObjectId[] = [];
    for (let m = 0; m < MASTER_MEDICINES.length; m++) {
      const medSpec = MASTER_MEDICINES[m];
      const sku = `SKU-${config.code}-${String(m + 1).padStart(4, '0')}`;

      let med = await Medicine.findOne({ tenantId, internalSku: sku });
      if (!med) {
        med = await Medicine.create({
          tenantId,
          genericName: medSpec.generic,
          brandName: medSpec.brand,
          manufacturer: medSpec.mfg,
          composition: medSpec.comp,
          dosageForm: medSpec.form,
          strength: medSpec.strength,
          routeOfAdministration: medSpec.route,
          category: medSpec.cat,
          gstCategory: medSpec.gst,
          unitOfMeasure: medSpec.uom,
          internalSku: sku,
          barcode: `8901234${config.code.charCodeAt(0)}${String(m + 1).padStart(4, '0')}`,
          prescriptionRequired: true,
          controlledDrugFlag: medSpec.controlled,
          highRiskMedicineFlag: medSpec.highRisk,
          lasaFlag: m % 7 === 0,
          status: 'active',
        });
      }
      medicineIds.push(med._id);
      idMap.medicines.set(`${config.code}:${medSpec.brand}`, med._id);
    }

    // 4. Inventory Batches & Transactions for Main Pharmacy Location
    const mainPharmId = locIds[0];
    const batchIds: mongoose.Types.ObjectId[] = [];

    for (let m = 0; m < medicineIds.length; m++) {
      const medId = medicineIds[m];
      // Create 2 batches per medicine
      for (let b = 1; b <= 2; b++) {
        const batchNo = `BAT-2026-${config.code.substring(0, 3)}-M${m + 1}B${b}`;
        let batch = await InventoryBatch.findOne({ pharmacyId: mainPharmId, medicineId: medId, batchNumber: batchNo });

        if (!batch) {
          const qty = getRandomNumber(100, 500);
          const expDate = new Date(2027 + b, getRandomNumber(0, 11), getRandomNumber(1, 28));

          batch = await InventoryBatch.create({
            tenantId,
            pharmacyId: mainPharmId,
            medicineId: medId,
            batchNumber: batchNo,
            expiryDate: expDate,
            manufacturingDate: new Date(2026, 0, 15),
            rack: `Rack ${String.fromCharCode(65 + (m % 6))}`,
            shelf: `Shelf ${1 + (m % 4)}`,
            bin: `Bin ${b}`,
            quantity: qty,
            reservedQuantity: Math.floor(qty * 0.05),
          });

          // Opening Stock Transaction
          await InventoryTransaction.create({
            tenantId,
            pharmacyId: mainPharmId,
            medicineId: medId,
            batchId: batch._id,
            transactionType: 'opening_stock',
            previousQuantity: 0,
            quantityChanged: qty,
            newQuantity: qty,
            userId: adminUserId,
            remarks: 'Initial production demo inventory seed',
          });
        }
        batchIds.push(batch._id);
      }
    }
    idMap.inventoryBatches.set(config.code, batchIds);
    console.log(`Synced 35 master medicines, 3 pharmacy locations, 70 batches for ${config.name}`);
  }
}
