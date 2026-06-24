import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHospitalSchema, CreateHospitalInput } from "../schemas/hospital.schema";
import { FormField } from "@/components/ui/form-field";
import { Check, ArrowLeft, ArrowRight, ShieldCheck, Globe, Building2, Layers, Calendar, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";

interface HospitalStepperFormProps {
  onSubmit: (data: CreateHospitalInput) => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, name: "Basic Info", icon: Building2 },
  { id: 2, name: "Address", icon: Globe },
  { id: 3, name: "Capacity", icon: Layers },
  { id: 4, name: "Accreditation", icon: ShieldCheck },
  { id: 5, name: "Settings", icon: Settings },
  { id: 6, name: "Review", icon: Check },
];

export function HospitalStepperForm({ onSubmit, isLoading = false }: HospitalStepperFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateHospitalInput>({
    resolver: zodResolver(createHospitalSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      tenantId: "",
      type: "General Hospital",
      email: "",
      phone: "",
      website: "",
      description: "",
      country: "United States",
      state: "",
      city: "",
      address: "",
      postalCode: "",
      latitude: 0,
      longitude: 0,
      totalBeds: 0,
      icuBeds: 0,
      otRooms: 0,
      emergencyUnits: 0,
      ambulances: 0,
      pharmacyAvailable: false,
      laboratoryAvailable: false,
      bloodBankAvailable: false,
      nabh: "Not Applied",
      jci: "Not Applied",
      iso: "Not Certified",
      licenseNumber: "",
      expiryDate: "",
      timezone: "EST",
      currency: "USD",
      language: "en",
      format24h: true,
      weekStart: "Monday",
    },
  });

  const formValues = watch();
  const hospitalName = watch("name");

  // Auto-generate code from name
  useEffect(() => {
    if (hospitalName && currentStep === 1) {
      const generatedCode = hospitalName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10);
      setValue("code", generatedCode, { shouldValidate: true });
    }
  }, [hospitalName, setValue, currentStep]);

  const stepFields: Record<number, (keyof CreateHospitalInput)[]> = {
    1: ["name", "code", "tenantId", "type", "email", "phone", "website", "description"],
    2: ["country", "state", "city", "address", "postalCode", "latitude", "longitude"],
    3: ["totalBeds", "icuBeds", "otRooms", "emergencyUnits", "ambulances", "pharmacyAvailable", "laboratoryAvailable", "bloodBankAvailable"],
    4: ["nabh", "jci", "iso", "licenseNumber", "expiryDate"],
    5: ["timezone", "currency", "language", "format24h", "weekStart"],
    6: [],
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep];
    const isStepValid = currentStep === 6 ? true : await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit = (data: CreateHospitalInput) => {
    onSubmit(data);
  };

  const getTenantName = (id: string) => {
    return MOCK_TENANTS.find((t) => t.id === id)?.name || `Tenant #${id}`;
  };

  return (
    <div className="space-y-8 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm">
      {/* Progress Header */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0 hidden md:block" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300 hidden md:block"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        <ul className="relative z-10 flex flex-col md:flex-row md:justify-between gap-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <li key={step.id} className="flex items-center gap-3 bg-card md:px-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "border-primary text-primary ring-4 ring-primary/10"
                      : "border-border text-muted-foreground bg-muted/30"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Step {step.id}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Form Content */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 min-h-[300px]">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Basic Information</h3>
            <p className="text-sm text-muted-foreground">Specify the name, identity code, and tenant owner of the hospital.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Hospital Name"
                placeholder="e.g. Apollo General Hospital"
                id="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <FormField
                label="Hospital Code"
                placeholder="e.g. AP-NY"
                id="code"
                error={errors.code?.message}
                {...register("code")}
              />
              <FormField
                label="Tenant Owner"
                id="tenantId"
                as="select"
                error={errors.tenantId?.message}
                {...register("tenantId")}
              >
                <option value="">Select Tenant</option>
                {MOCK_TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </FormField>
              <FormField
                label="Hospital Type"
                id="type"
                as="select"
                error={errors.type?.message}
                {...register("type")}
              >
                <option value="General Hospital">General Hospital</option>
                <option value="Specialty Hospital">Specialty Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
                <option value="Teaching Hospital">Teaching Hospital</option>
              </FormField>
              <FormField
                label="Primary Contact Email"
                type="email"
                placeholder="info@hospital.com"
                id="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField
                label="Primary Contact Phone"
                placeholder="+1 (555) 123-4567"
                id="phone"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <FormField
                label="Website URL"
                placeholder="https://www.hospital.com"
                id="website"
                error={errors.website?.message}
                {...register("website")}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Description / Bio"
                  as="textarea"
                  placeholder="Tell us about the hospital..."
                  id="description"
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Address & Location</h3>
            <p className="text-sm text-muted-foreground">Provide physical coordinates and addressing details.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Country"
                placeholder="United States"
                id="country"
                error={errors.country?.message}
                {...register("country")}
              />
              <FormField
                label="State / Region"
                placeholder="New York"
                id="state"
                error={errors.state?.message}
                {...register("state")}
              />
              <FormField
                label="City"
                placeholder="New York City"
                id="city"
                error={errors.city?.message}
                {...register("city")}
              />
              <FormField
                label="Postal / ZIP Code"
                placeholder="10001"
                id="postalCode"
                error={errors.postalCode?.message}
                {...register("postalCode")}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Street Address"
                  placeholder="123 Health Ave, Suite 400"
                  id="address"
                  error={errors.address?.message}
                  {...register("address")}
                />
              </div>
              <FormField
                label="GPS Latitude"
                type="number"
                step="any"
                id="latitude"
                error={errors.latitude?.message}
                {...register("latitude")}
              />
              <FormField
                label="GPS Longitude"
                type="number"
                step="any"
                id="longitude"
                error={errors.longitude?.message}
                {...register("longitude")}
              />
            </div>
          </div>
        )}

        {/* STEP 3: CAPACITY */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Infrastructure Capacity</h3>
            <p className="text-sm text-muted-foreground">Define limits and resources allocated to the primary unit.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                label="Total Beds Allocation"
                type="number"
                id="totalBeds"
                error={errors.totalBeds?.message}
                {...register("totalBeds")}
              />
              <FormField
                label="ICU Beds Allocation"
                type="number"
                id="icuBeds"
                error={errors.icuBeds?.message}
                {...register("icuBeds")}
              />
              <FormField
                label="Operation Theatres"
                type="number"
                id="otRooms"
                error={errors.otRooms?.message}
                {...register("otRooms")}
              />
              <FormField
                label="Emergency Units"
                type="number"
                id="emergencyUnits"
                error={errors.emergencyUnits?.message}
                {...register("emergencyUnits")}
              />
              <FormField
                label="Ambulance Units"
                type="number"
                id="ambulances"
                error={errors.ambulances?.message}
                {...register("ambulances")}
              />
              <div className="col-span-full border-t border-border pt-4 mt-2" />
              <label className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-card cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("pharmacyAvailable")}
                />
                <span className="text-sm font-semibold text-foreground">In-house Pharmacy Available</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-card cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("laboratoryAvailable")}
                />
                <span className="text-sm font-semibold text-foreground">Clinical Lab Operations Available</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-card cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("bloodBankAvailable")}
                />
                <span className="text-sm font-semibold text-foreground">Blood Bank Operations Available</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: ACCREDITATION */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Accreditation & Licenses</h3>
            <p className="text-sm text-muted-foreground">Register local clinical regulatory details.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="NABH Status"
                id="nabh"
                as="select"
                error={errors.nabh?.message}
                {...register("nabh")}
              >
                <option value="Not Applied">Not Applied</option>
                <option value="Pending">Pending</option>
                <option value="Accredited">Accredited</option>
              </FormField>
              <FormField
                label="JCI Status"
                id="jci"
                as="select"
                error={errors.jci?.message}
                {...register("jci")}
              >
                <option value="Not Applied">Not Applied</option>
                <option value="Pending">Pending</option>
                <option value="Accredited">Accredited</option>
              </FormField>
              <FormField
                label="ISO Quality Standard"
                id="iso"
                as="select"
                error={errors.iso?.message}
                {...register("iso")}
              >
                <option value="Not Certified">Not Certified</option>
                <option value="Pending">Pending</option>
                <option value="Certified">Certified</option>
              </FormField>
              <FormField
                label="State License Number"
                placeholder="LIC-XX-XXXX"
                id="licenseNumber"
                error={errors.licenseNumber?.message}
                {...register("licenseNumber")}
              />
              <div className="md:col-span-2">
                <FormField
                  label="License Expiration Date"
                  type="date"
                  id="expiryDate"
                  error={errors.expiryDate?.message}
                  {...register("expiryDate")}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SETTINGS */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Regional Settings</h3>
            <p className="text-sm text-muted-foreground">Configure localized details for working hours and currency structures.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Primary Timezone"
                id="timezone"
                as="select"
                error={errors.timezone?.message}
                {...register("timezone")}
              >
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="GMT">Greenwich Mean Time (GMT)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </FormField>
              <FormField
                label="Transaction Currency"
                id="currency"
                as="select"
                error={errors.currency?.message}
                {...register("currency")}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </FormField>
              <FormField
                label="Language Localization"
                id="language"
                as="select"
                error={errors.language?.message}
                {...register("language")}
              >
                <option value="en">English (en)</option>
                <option value="es">Español (es)</option>
                <option value="fr">Français (fr)</option>
              </FormField>
              <FormField
                label="Week Starts On"
                id="weekStart"
                as="select"
                error={errors.weekStart?.message}
                {...register("weekStart")}
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </FormField>
              <div className="md:col-span-2 flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="format24h"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("format24h")}
                />
                <label htmlFor="format24h" className="text-sm font-semibold text-foreground">
                  Use 24 Hour Time Format
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SUMMARY REVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-foreground">Review Information</h3>
              <p className="text-sm text-muted-foreground">Verify all hospital registration details before provisioning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 border border-border rounded-xl p-5 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground uppercase text-xs tracking-wider">Hospital Info</h4>
                <p><span className="text-muted-foreground">Name:</span> {formValues.name}</p>
                <p><span className="text-muted-foreground">Code:</span> {formValues.code}</p>
                <p><span className="text-muted-foreground">Type:</span> {formValues.type}</p>
                <p><span className="text-muted-foreground">Tenant:</span> {getTenantName(formValues.tenantId)}</p>
                <p><span className="text-muted-foreground">Email:</span> {formValues.email}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground uppercase text-xs tracking-wider">Location</h4>
                <p><span className="text-muted-foreground">Address:</span> {formValues.address}</p>
                <p><span className="text-muted-foreground">City:</span> {formValues.city}, {formValues.state}, {formValues.country}</p>
                <p><span className="text-muted-foreground">ZIP:</span> {formValues.postalCode}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground uppercase text-xs tracking-wider">Capacity</h4>
                <p><span className="text-muted-foreground">Beds:</span> {formValues.totalBeds} (ICU: {formValues.icuBeds})</p>
                <p><span className="text-muted-foreground">OT Rooms:</span> {formValues.otRooms}</p>
                <p><span className="text-muted-foreground">Ambulances:</span> {formValues.ambulances}</p>
                <p>
                  <span className="text-muted-foreground">Facilities:</span>{" "}
                  {[
                    formValues.pharmacyAvailable && "Pharmacy",
                    formValues.laboratoryAvailable && "Lab",
                    formValues.bloodBankAvailable && "Blood Bank",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground uppercase text-xs tracking-wider">Licenses</h4>
                <p><span className="text-muted-foreground">License No:</span> {formValues.licenseNumber}</p>
                <p><span className="text-muted-foreground">Expires:</span> {formValues.expiryDate}</p>
                <p><span className="text-muted-foreground">Accreditation:</span> NABH ({formValues.nabh}), JCI ({formValues.jci})</p>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.push("/hospitals") : handlePrev}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          {currentStep === STEPS.length ? (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Provisioning..." : "Create Hospital"}
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
