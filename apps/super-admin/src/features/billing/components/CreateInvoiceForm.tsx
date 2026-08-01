"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { Invoice } from "../types/billing.types";
import { useAuthStore } from "@/store/auth.store";

interface CreateInvoiceFormProps {
  onClose: () => void;
  onSubmit: (invoice: Partial<Invoice>) => void;
}

export function CreateInvoiceForm({ onClose, onSubmit }: CreateInvoiceFormProps) {
  const { user } = useAuthStore();
  
  const [invoiceType, setInvoiceType] = useState<Invoice['invoiceType']>("OPD");
  const [billingMode, setBillingMode] = useState<Invoice['billingMode']>("Self-Pay");
  const [patientName, setPatientName] = useState("");
  
  // Insurance Details
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [claimId, setClaimId] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [patientResponsibility, setPatientResponsibility] = useState<number>(0);

  // Line Items
  const [items, setItems] = useState<Array<{
    itemCategory: any;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>>([
    { itemCategory: "Consultation", description: "General Consultation", quantity: 1, unitPrice: 500, taxRate: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { itemCategory: "Other", description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTax = (itemSubtotal * item.taxRate) / 100;
      subtotal += itemSubtotal;
      tax += itemTax;
    });
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: Partial<Invoice> = {
      tenantName: user?.tenantId || "Apollo Hospitals",
      patientName,
      invoiceType,
      billingMode,
      items: items.map(i => ({
        ...i,
        taxAmount: (i.quantity * i.unitPrice * i.taxRate) / 100,
        total: (i.quantity * i.unitPrice) + ((i.quantity * i.unitPrice * i.taxRate) / 100)
      })),
      amount: totals.subtotal,
      taxAmount: totals.tax,
      totalAmount: totals.total,
      currency: "INR",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (billingMode === "Insurance") {
      payload.insuranceDetails = {
        provider: insuranceProvider,
        claimId,
        approvedAmount,
        patientResponsibility
      };
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Create Patient Invoice</h3>
            <p className="text-sm text-muted-foreground">Module 4: Advanced Billing</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground bg-secondary/50 p-2 rounded-full hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Patient Name</label>
              <input required value={patientName} onChange={e => setPatientName(e.target.value)} type="text" placeholder="John Doe" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Type</label>
              <select value={invoiceType} onChange={e => setInvoiceType(e.target.value as any)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50">
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Lab">Lab</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Package">Package</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Mode</label>
              <select value={billingMode} onChange={e => setBillingMode(e.target.value as any)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50">
                <option value="Self-Pay">Self-Pay (Cash/Card)</option>
                <option value="Insurance">Insurance / TPA</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          {billingMode === "Insurance" && (
            <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Provider</label>
                <input required value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} type="text" placeholder="Star Health" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Claim ID / TPA No.</label>
                <input required value={claimId} onChange={e => setClaimId(e.target.value)} type="text" placeholder="CLM-98239" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Approved Amount</label>
                <input required value={approvedAmount} onChange={e => setApprovedAmount(Number(e.target.value))} type="number" min="0" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Patient Co-pay</label>
                <input required value={patientResponsibility} onChange={e => setPatientResponsibility(Number(e.target.value))} type="number" min="0" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-foreground">Line Items</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-[15%]">Category</th>
                    <th className="px-4 py-3 w-[35%]">Description</th>
                    <th className="px-4 py-3 w-[10%]">Qty</th>
                    <th className="px-4 py-3 w-[15%]">Unit Price</th>
                    <th className="px-4 py-3 w-[10%]">GST %</th>
                    <th className="px-4 py-3 w-[10%]">Total</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, index) => (
                    <tr key={index} className="bg-background">
                      <td className="p-2">
                        <select value={item.itemCategory} onChange={e => handleItemChange(index, "itemCategory", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-xs">
                          <option value="Consultation">Consultation</option>
                          <option value="Bed">Bed Charges</option>
                          <option value="Operation">Operation</option>
                          <option value="Procedure">Procedure</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Test">Lab Test</option>
                          <option value="Package">Package</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input required type="text" value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} placeholder="e.g. CBC Test" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-xs" />
                      </td>
                      <td className="p-2">
                        <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, "quantity", Number(e.target.value))} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-xs" />
                      </td>
                      <td className="p-2">
                        <input required type="number" min="0" value={item.unitPrice} onChange={e => handleItemChange(index, "unitPrice", Number(e.target.value))} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-xs" />
                      </td>
                      <td className="p-2">
                        <select value={item.taxRate} onChange={e => handleItemChange(index, "taxRate", Number(e.target.value))} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-xs">
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                        </select>
                      </td>
                      <td className="p-2 font-medium">
                        ₹ {((item.quantity * item.unitPrice) * (1 + item.taxRate / 100)).toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md" disabled={items.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col justify-end items-end pt-4 border-t border-border gap-6">
            
            <div className="w-full md:w-1/3 bg-secondary/30 p-4 rounded-lg space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹ {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exclusive GST</span>
                <span className="font-medium text-amber-500">+ ₹ {totals.tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2 text-primary">
                <span>Total Amount</span>
                <span>₹ {totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="lg" className="px-8">Generate Invoice</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
