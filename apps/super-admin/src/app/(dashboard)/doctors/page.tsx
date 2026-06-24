"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DoctorTable } from "@/features/clinical/components/DoctorTable";
import { useDoctors, useCreateDoctor } from "@/features/clinical/hooks/useClinical";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { Plus, X, Stethoscope, Copy, CheckCheck, Link2, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, DoctorInput } from "@/features/clinical/schemas/clinical.schema";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [status, setStatus] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inviteModal, setInviteModal] = useState<{ doctorName: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: doctors = [], isLoading } = useDoctors({
    search,
    hospitalId: hospitalId || undefined,
    specialization: specialization || undefined,
    status: status || undefined,
  });

  const createDoctorMutation = useCreateDoctor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorInput>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      specialization: "",
      hospitalId: "",
      branchId: "b-1",
      departmentId: "dep-1",
      experience: 1,
      rating: 5,
      status: "Active",
    },
  });

  const onSubmit = (data: DoctorInput) => {
    createDoctorMutation.mutate(data, {
      onSuccess: (result) => {
        setIsDrawerOpen(false);
        reset();
        setInviteModal({ doctorName: result.doctor.name, link: result.invitationLink });
      },
      onError: (err) => {
        toast.error("Failed to register doctor: " + err.message);
      },
    });
  };

  const handleCopy = () => {
    if (!inviteModal) return;
    navigator.clipboard.writeText(inviteModal.link).then(() => {
      setCopied(true);
      toast.success("Activation link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const specializations = ["Diagnostics / Nephrology", "General Medicine", "Neurosurgery", "Psychiatry", "General Surgery"];

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Doctors" }]} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Doctor Registry"
            description="View clinical practitioners, active status, specializations, and patient loads."
          />
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Register Doctor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Search Doctors</label>
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hospital Location</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Locations</option>
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Specialties</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <DoctorTable data={doctors} isLoading={isLoading} />
      </div>

      {/* Register Doctor Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="h-full w-full max-w-md border-l border-border bg-card p-6 shadow-2xl overflow-y-auto flex flex-col gap-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Register Doctor</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-start gap-2.5">
              <Link2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                After registering, an <span className="font-semibold text-primary">activation link</span> will be
                generated. Share it with the doctor so they can set their password and access the Doctor Portal.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
              <FormField
                label="Full Name"
                placeholder="Dr. Jane Smith"
                error={errors.name?.message}
                {...register("name")}
              />
              <FormField
                label="Email Address"
                type="email"
                placeholder="doctor@hospital.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField
                label="Specialization"
                placeholder="Pediatrics / Cardiology"
                error={errors.specialization?.message}
                {...register("specialization")}
              />
              <FormField
                label="Experience (Years)"
                type="number"
                placeholder="8"
                error={errors.experience?.message}
                {...register("experience")}
              />
              <FormField
                label="Hospital Location"
                as="select"
                error={errors.hospitalId?.message}
                {...register("hospitalId")}
              >
                <option value="">Select Hospital Location</option>
                {MOCK_HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </FormField>
              <FormField
                label="Status"
                as="select"
                error={errors.status?.message}
                {...register("status")}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </FormField>

              <div className="flex items-center gap-3 pt-6 border-t border-border mt-auto">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDoctorMutation.isPending}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] bg-primary text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createDoctorMutation.isPending ? "Registering..." : "Register & Generate Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitation Link Success Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Doctor Registered!</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-semibold text-foreground">{inviteModal.doctorName}</span> has been added to the registry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setInviteModal(null); setCopied(false); }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-muted/60 border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">Doctor Portal Activation Link</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Share this link with <span className="font-semibold text-foreground">{inviteModal.doctorName}</span>.
                They will use it to set their password and access the Doctor Portal.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground font-mono break-all select-all">
                  {inviteModal.link}
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy activation link"
                >
                  {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href={inviteModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Open activation link in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
              💡 <span className="font-semibold">Note:</span> This link is stored locally for now. When connected to a real backend, it will be sent automatically via email to the doctor.
            </p>

            <button
              onClick={() => { setInviteModal(null); setCopied(false); }}
              className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
