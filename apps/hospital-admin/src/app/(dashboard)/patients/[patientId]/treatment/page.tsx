"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Pill,
  Droplet,
  Stethoscope,
  Activity,
  Plus,
  Clock,
  Loader2,
  Trash2,
  Scissors
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

// Simplified Patient Data (In real app, fetch from patient EMR API)
const PATIENT_INFO = {
  id: "p-1",
  name: "Rahul Sharma",
  mrn: "MRN-10293",
  ward: "General Med A",
  bed: "Bed 101",
};

interface TreatmentOrder {
  _id: string;
  type: string;
  medicineName?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  volume?: string;
  infusionRate?: string;
  instructions?: string;
  status: string;
  createdAt: string;
}

export default function TreatmentSheetPage({ params }: { params: { patientId: string } }) {
  const [activeTab, setActiveTab] = useState("medication");
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [orders, setOrders] = useState<TreatmentOrder[]>([]);
  const [orders, setOrders] = useState<TreatmentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Surgery Request State
  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [isSubmittingSurgery, setIsSubmittingSurgery] = useState(false);
  const [surgeryForm, setSurgeryForm] = useState({
    surgeryName: "",
    category: "General",
    priority: "Elective",
    estimatedDurationMins: "60",
    notes: ""
  });

  // Form State
  const [formData, setFormData] = useState({
    type: "Medication",
    medicineName: "",
    dosage: "",
    route: "Oral",
    frequency: "BD",
    volume: "",
    infusionRate: "",
    instructions: ""
  });

  const fetchOrders = async () => {
    try {
      // In this prototype, we use a generic string for patient ID if testing without real IDs
      // But we will pass params.patientId directly. If backend expects ObjectId and patientId is fake, it will fail.
      // Assuming params.patientId is a valid ObjectId in the real DB for testing.
      const res = await apiClient.get(`/ipd-treatment/patients/${params.patientId}/orders`);
      setOrders(res.data.data);
    } catch (error: any) {
      console.error("Failed to fetch treatment orders", error);
      // We don't toast error aggressively here in case of fake IDs
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [params.patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPrescribing(true);
    try {
      await apiClient.post(`/ipd-treatment/patients/${params.patientId}/orders`, formData);
      toast.success("Treatment order prescribed successfully");
      setFormData({
        type: "Medication",
        medicineName: "",
        dosage: "",
        route: "Oral",
        frequency: "BD",
        volume: "",
        infusionRate: "",
        instructions: ""
      });
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to prescribe treatment");
    } finally {
      setIsPrescribing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/patients`} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Treatment Sheet & Orders</h1>
          <p className="text-sm text-muted-foreground">Prescribe medications, IV fluids, and nursing instructions</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => setShowSurgeryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <Scissors className="w-4 h-4" /> Request Surgery
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-blue-900 dark:text-blue-200">Patient: {PATIENT_INFO.name} ({PATIENT_INFO.mrn})</h2>
          <p className="text-sm text-blue-700 dark:text-blue-400">Location: {PATIENT_INFO.ward} - {PATIENT_INFO.bed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prescription Form */}
        <div className="md:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground text-lg border-b border-border pb-2">New Order</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Order Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Medication">Medication</option>
                <option value="IVFluid">IV Fluid</option>
                <option value="NursingInstruction">Nursing Instruction</option>
              </select>
            </div>

            {formData.type === "Medication" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Medicine Name</label>
                  <input required value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} placeholder="e.g. Paracetamol" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Dosage</label>
                    <input required value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="500mg" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Route</label>
                    <select value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Oral">Oral (PO)</option>
                      <option value="IV">Intravenous (IV)</option>
                      <option value="IM">Intramuscular (IM)</option>
                      <option value="Topical">Topical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Frequency</label>
                  <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="OD">Once Daily (OD)</option>
                    <option value="BD">Twice Daily (BD)</option>
                    <option value="TDS">Three Times (TDS)</option>
                    <option value="SOS">As Needed (SOS)</option>
                    <option value="STAT">Immediately (STAT)</option>
                  </select>
                </div>
              </>
            )}

            {formData.type === "IVFluid" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Fluid Type</label>
                  <input required value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} placeholder="e.g. Normal Saline 0.9%" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Volume</label>
                    <input required value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} placeholder="500 ml" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Rate</label>
                    <input required value={formData.infusionRate} onChange={e => setFormData({...formData, infusionRate: e.target.value})} placeholder="100 ml/hr" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Clinical Instructions</label>
              <textarea 
                rows={3} 
                value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
                placeholder="Specific instructions for nurses..." 
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" 
              />
            </div>

            <button disabled={isPrescribing} type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4">
              {isPrescribing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Prescribe Order
            </button>
          </form>
        </div>

        {/* Active Orders List */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-bold text-foreground text-lg">Active Treatment Orders</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("medication")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === "medication" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Medications</button>
              <button onClick={() => setActiveTab("iv")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === "iv" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>IV Fluids</button>
              <button onClick={() => setActiveTab("nursing")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === "nursing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Instructions</button>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <Activity className="w-10 h-10 mb-2 opacity-20" />
                <p>No active orders found.</p>
              </div>
            ) : (
              orders
                .filter(o => 
                  (activeTab === "medication" && o.type === "Medication") || 
                  (activeTab === "iv" && o.type === "IVFluid") || 
                  (activeTab === "nursing" && o.type === "NursingInstruction")
                )
                .map((order) => (
                <div key={order._id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {order.type === "Medication" ? <Pill className="w-4 h-4 text-blue-500" /> : order.type === "IVFluid" ? <Droplet className="w-4 h-4 text-cyan-500" /> : <Stethoscope className="w-4 h-4 text-emerald-500" />}
                      <span className="font-bold text-foreground text-base">
                        {order.medicineName || "Nursing Instruction"}
                      </span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded uppercase font-bold text-muted-foreground">{order.status}</span>
                    </div>
                  </div>
                  
                  {order.type === "Medication" && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                      <p><span className="text-muted-foreground text-xs uppercase font-semibold">Dose:</span> {order.dosage}</p>
                      <p><span className="text-muted-foreground text-xs uppercase font-semibold">Route:</span> {order.route}</p>
                      <p><span className="text-muted-foreground text-xs uppercase font-semibold">Freq:</span> {order.frequency}</p>
                    </div>
                  )}

                  {order.type === "IVFluid" && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                      <p><span className="text-muted-foreground text-xs uppercase font-semibold">Vol:</span> {order.volume}</p>
                      <p><span className="text-muted-foreground text-xs uppercase font-semibold">Rate:</span> {order.infusionRate}</p>
                    </div>
                  )}

                  {order.instructions && (
                    <p className="text-sm mt-3 bg-muted/40 p-2 rounded text-muted-foreground border-l-2 border-primary/50">
                      {order.instructions}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Prescribed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Surgery Request Modal */}
      {showSurgeryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-lg text-foreground">Request Surgery for {PATIENT_INFO.name}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Surgery Name</label>
                <input 
                  required 
                  value={surgeryForm.surgeryName} 
                  onChange={e => setSurgeryForm({...surgeryForm, surgeryName: e.target.value})} 
                  placeholder="e.g. Appendectomy" 
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                  <select 
                    value={surgeryForm.category} 
                    onChange={e => setSurgeryForm({...surgeryForm, category: e.target.value})} 
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="General">General Surgery</option>
                    <option value="Cardiac">Cardiac Surgery</option>
                    <option value="Orthopedic">Orthopedic Surgery</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                  <select 
                    value={surgeryForm.priority} 
                    onChange={e => setSurgeryForm({...surgeryForm, priority: e.target.value})} 
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Elective">Elective</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                    <option value="STAT">STAT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Est. Duration (Mins)</label>
                  <input 
                    type="number"
                    value={surgeryForm.estimatedDurationMins} 
                    onChange={e => setSurgeryForm({...surgeryForm, estimatedDurationMins: e.target.value})} 
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Clinical Notes</label>
                <textarea 
                  value={surgeryForm.notes} 
                  onChange={e => setSurgeryForm({...surgeryForm, notes: e.target.value})} 
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  placeholder="Pre-op conditions, special equipment needed..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <button 
                onClick={() => setShowSurgeryModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-sm border border-input hover:bg-muted"
                disabled={isSubmittingSurgery}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if(!surgeryForm.surgeryName) return toast.error("Surgery name is required");
                  setIsSubmittingSurgery(true);
                  try {
                    // For prototype, passing a fake admissionId or null if backend allows.
                    // The API requires admissionId, we'll pass a dummy objectId or the patientId.
                    await apiClient.post("/ot/surgeries", {
                      patientId: params.patientId,
                      admissionId: params.patientId, // In real app, fetch real admissionId
                      ...surgeryForm
                    });
                    toast.success("Surgery requested successfully!");
                    setShowSurgeryModal(false);
                    setSurgeryForm({
                      surgeryName: "", category: "General", priority: "Elective", estimatedDurationMins: "60", notes: ""
                    });
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || "Failed to request surgery");
                  } finally {
                    setIsSubmittingSurgery(false);
                  }
                }}
                className="px-4 py-2 rounded-md font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                disabled={isSubmittingSurgery}
              >
                {isSubmittingSurgery ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
