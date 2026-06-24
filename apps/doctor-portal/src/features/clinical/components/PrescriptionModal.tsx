"use client";

import React, { useState, useRef, useEffect } from "react";
import { Patient } from "@/features/patients/types/patients.types";
import { FormField } from "@/components/ui/form-field";
import { useAddPrescription } from "@/features/patients/hooks/usePatients";
import { useAuthStore } from "@/store/auth.store";
import { X, Printer, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PrescriptionModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionModal({ patient, isOpen, onClose }: PrescriptionModalProps) {
  const { user } = useAuthStore();
  const addPrescriptionMutation = useAddPrescription();

  // Form states
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medDur, setMedDur] = useState("5 days");
  const [medTiming, setMedTiming] = useState("Morning");
  const [medFood, setMedFood] = useState("With or without food");

  // Signature canvas states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Clear signature drawing
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        setSignatureDataUrl(null);
      }
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      setSignatureDataUrl(canvas.toDataURL());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDose) {
      toast.error("Please enter a medicine name and dosage.");
      return;
    }
    if (!hasSignature) {
      toast.error("Physician signature is required to authorize prescriptions.");
      return;
    }

    addPrescriptionMutation.mutate(
      {
        patientId: patient.id,
        medication: medName,
        dosage: medDose,
        frequency: medFreq,
        duration: medDur,
        timing: medTiming,
        foodInstructions: medFood,
        prescribedBy: user?.name || "Dr. Alexander Fleming",
      },
      {
        onSuccess: () => {
          toast.success("Prescription successfully queued for pharmacy.");
          // Trigger Print View
          setTimeout(() => {
            window.print();
            onClose();
          }, 300);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to record prescription.");
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* On-screen Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 screen-only">
        <div className="fixed inset-0" onClick={onClose} />
        
        <div className="relative w-full max-w-xl rounded-xl bg-card border border-border p-6 shadow-xl overflow-hidden flex flex-col z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Write E-Prescription
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Med details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="medName"
                label="Medication Name"
                placeholder="e.g. Amoxicillin, Lisinopril"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              />
              <FormField
                id="medDose"
                label="Dosage"
                placeholder="e.g. 500mg, 1 tablet"
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField
                id="medFreq"
                label="Frequency"
                as="select"
                value={medFreq}
                onChange={(e) => setMedFreq(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="As needed (PRN)">As needed (PRN)</option>
              </FormField>

              <FormField
                id="medDur"
                label="Duration"
                value={medDur}
                onChange={(e) => setMedDur(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              />

              <FormField
                id="medTiming"
                label="Timing"
                as="select"
                value={medTiming}
                onChange={(e) => setMedTiming(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              >
                <option value="Morning">Morning</option>
                <option value="Night">Night</option>
                <option value="Morning & Night">Morning & Night</option>
                <option value="Before meals">Before meals</option>
                <option value="Immediate (Stat)">Immediate (Stat)</option>
              </FormField>

              <FormField
                id="medFood"
                label="Food Instruction"
                as="select"
                value={medFood}
                onChange={(e) => setMedFood(e.target.value)}
                disabled={addPrescriptionMutation.isPending}
              >
                <option value="With or without food">With/without food</option>
                <option value="With meals">With meals</option>
                <option value="On empty stomach">Empty stomach</option>
              </FormField>
            </div>

            {/* Signature Draw Pad */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-foreground uppercase tracking-wide">
                <span>Physician Authorization Signature</span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-primary hover:underline font-extrabold normal-case"
                >
                  Clear Drawing
                </button>
              </div>
              <div className="border border-border bg-muted/20 rounded-lg overflow-hidden h-32 relative">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/45 text-xxs font-bold uppercase tracking-wider">
                    Draw your signature here to sign
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addPrescriptionMutation.isPending}
                className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {addPrescriptionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" /> Authorize & Print
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Standard Browser Printable PDF View (@media print) */}
      <div id="printable-prescription" className="hidden-print p-12 bg-white text-black font-sans leading-relaxed text-sm">
        {/* Style block specifically for browser printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .screen-only, .screen-only * {
              display: none !important;
            }
            #printable-prescription, #printable-prescription * {
              visibility: visible !important;
              display: block !important;
            }
            #printable-prescription {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              color: black !important;
            }
          }
          .hidden-print {
            display: none;
          }
        `}} />

        {/* Prescription Sheet */}
        <div className="max-w-2xl mx-auto border-4 border-double border-zinc-400 p-8 space-y-6">
          <div className="flex justify-between items-start border-b-2 border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Hospital Medical Center</h2>
              <p className="text-xs text-zinc-600 font-semibold mt-0.5">Clinical Outpatient and Inpatient Facility</p>
            </div>
            <div className="text-right text-xs font-bold">
              <p className="text-zinc-900">Dr. {user?.name || "Alexander Fleming"}</p>
              <p className="text-zinc-500">{user?.specialty || "Physician Specialist"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 text-xs border-b border-zinc-300 pb-4">
            <div>
              <p className="text-zinc-500 uppercase font-bold text-[10px]">Patient Name:</p>
              <p className="text-zinc-950 font-black text-sm">{patient.name}</p>
              <p className="text-zinc-600 font-semibold">{patient.age} yrs · {patient.gender}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 uppercase font-bold text-[10px]">Prescription Date:</p>
              <p className="text-zinc-950 font-black text-sm">{new Date().toLocaleDateString()}</p>
              <p className="text-zinc-600 font-semibold">Rx ID: RX-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          {/* Rx Symbol */}
          <div className="text-4xl font-serif font-bold text-zinc-900">Rx</div>

          {/* Medication details */}
          <div className="p-4 bg-zinc-50 rounded border border-zinc-200 space-y-2">
            <h3 className="text-base font-black text-zinc-950 uppercase">{medName}</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-zinc-700">
              <p>Dosage: <span className="text-zinc-950">{medDose}</span></p>
              <p>Frequency: <span className="text-zinc-950">{medFreq}</span></p>
              <p>Duration: <span className="text-zinc-950">{medDur}</span></p>
              <p>Timing: <span className="text-zinc-950">{medTiming}</span></p>
              <p className="col-span-2">Instructions: <span className="text-zinc-950">{medFood}</span></p>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-6 flex justify-between items-end">
            <div className="text-xs text-zinc-500">
              <p>Hospital Command Code: {user?.tenantId || "N/A"}</p>
              <p>Ward/Bed: {patient.ward} / {patient.bedNumber}</p>
            </div>
            <div className="text-center space-y-1">
              {signatureDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signatureDataUrl}
                  alt="Authorized signature"
                  className="h-12 w-48 object-contain border-b border-zinc-400 mx-auto"
                />
              )}
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Authorized Digital Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
