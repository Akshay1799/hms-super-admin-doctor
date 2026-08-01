import React from "react";
import { Invoice } from "../types/billing.types";

interface InvoiceReceiptProps {
  invoice: Invoice;
}

export function InvoiceReceipt({ invoice }: InvoiceReceiptProps) {
  return (
    <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">TAX INVOICE</h1>
          <p className="text-sm text-gray-500 mt-1">Original for Recipient</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">{invoice.tenantName}</h2>
          {invoice.hospitalName && <p className="text-sm text-gray-600">{invoice.hospitalName}</p>}
          <p className="text-sm text-gray-600">GSTIN: 07AAACU9823M1Z9</p>
          <p className="text-sm text-gray-600">Email: billing@hmssystems.com</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-semibold text-gray-900 text-lg">{invoice.patientName || "Walk-in Patient"}</p>
          <p className="text-sm text-gray-600">Patient ID: {invoice.patientId || "N/A"}</p>
          
          {invoice.billingMode === "Insurance" && invoice.insuranceDetails && (
            <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Insurance Details</h4>
              <p className="text-sm">Provider: {invoice.insuranceDetails.provider}</p>
              <p className="text-sm">Claim ID: {invoice.insuranceDetails.claimId}</p>
            </div>
          )}
        </div>
        <div className="text-right space-y-1 text-sm">
          <p><span className="font-semibold text-gray-700">Invoice No:</span> {invoice.invoiceNumber || invoice.id}</p>
          <p><span className="font-semibold text-gray-700">Invoice Date:</span> {new Date(invoice.issuedDate).toLocaleDateString()}</p>
          <p><span className="font-semibold text-gray-700">Type:</span> {invoice.invoiceType}</p>
          <p><span className="font-semibold text-gray-700">Status:</span> <span className="uppercase">{invoice.status}</span></p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm text-left border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-4 py-3 font-semibold text-gray-700">S.No</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Qty</th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Rate (₹)</th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Taxable (₹)</th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">GST %</th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            // Logic for package display: If invoiceType is package, we can conditionally show things.
            // As per user request: "if there is individual items alongwith the package even then show package name and individual items in invoice"
            // The itemCategory handles this automatically because each line item will state if it's a Package or a separate item.
            const taxable = item.quantity * item.unitPrice;
            return (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-800">{index + 1}</td>
                <td className="px-4 py-3 text-gray-800">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-xs text-gray-500">{item.itemCategory}</div>
                </td>
                <td className="px-4 py-3 text-gray-800 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{taxable.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{item.taxRate}%</td>
                <td className="px-4 py-3 text-gray-900 font-medium text-right">
                  {item.total.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Taxable Amount:</span>
            <span>₹ {invoice.amount.toFixed(2)}</span>
          </div>
          {invoice.taxBreakup ? (
            <>
              <div className="flex justify-between text-sm text-gray-600">
                <span>CGST:</span>
                <span>₹ {invoice.taxBreakup.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>SGST:</span>
                <span>₹ {invoice.taxBreakup.sgst.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Tax (GST):</span>
              <span>₹ {(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-800 pt-2 mt-2">
            <span>Grand Total:</span>
            <span>₹ {invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-gray-800 uppercase border-b-2 border-gray-300 pb-2 mb-4">Payment & Refund History</h4>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 uppercase text-xs">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Method</th>
                <th className="py-2">Ref ID</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.paymentHistory.map(p => (
                <tr key={p.id}>
                  <td className="py-2 text-gray-800">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className={`py-2 ${p.type === 'refund' ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {p.type.toUpperCase()}
                  </td>
                  <td className="py-2 text-gray-800 uppercase">{p.method.replace('_', ' ')}</td>
                  <td className="py-2 text-gray-500 text-xs">{p.referenceId}</td>
                  <td className={`py-2 text-right font-medium ${p.type === 'refund' ? 'text-red-600' : 'text-gray-900'}`}>
                    {p.type === 'refund' ? '-' : ''}{Math.abs(p.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Final Balance Box */}
      <div className="flex justify-end mb-12">
        <div className="w-1/3 bg-gray-100 p-4 rounded text-right space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Amount Paid:</span>
            <span>₹ {(invoice.paidAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-2">
            <span>Balance Due:</span>
            <span>₹ {(invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
        <p>This is a computer-generated invoice and does not require a physical signature.</p>
        <p>For any billing inquiries, please contact the administration desk.</p>
      </div>
    </div>
  );
}
