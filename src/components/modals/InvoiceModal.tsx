import React from "react";
import { X, Printer, Download, Receipt, Sparkles } from "lucide-react";
import type { SystemBooking } from "../../types";

interface InvoiceModalProps {
  booking: SystemBooking | null;
  onClose: () => void;
  commissionRate: number;
  gstRate: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  booking,
  onClose,
  commissionRate,
  gstRate
}) => {
  if (!booking) return null;

  // Calculate pricing breakdown based on SOW math
  // Total Amount (A) = Base Price (X) + GST (Y) + Platform Fee (Z)
  // X = A / (1 + (gstRate/100) + (commissionRate/100))
  const totalAmount = booking.amount;
  const rateSum = (gstRate + commissionRate) / 100;
  const basePrice = Math.round(totalAmount / (1 + rateSum));
  const gstAmount = Math.round(basePrice * (gstRate / 100));
  const platformFee = totalAmount - basePrice - gstAmount; // ensures precise rounding match

  const handlePrint = () => {
    // Standard print action simulator
    window.print();
  };

  const handleDownload = () => {
    // Download PDF simulator
    alert(`Downloading Invoice_${booking.id}.pdf to your device...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-zinc-100 shadow-2xl rounded-[36px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header Actions */}
        <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Booking Invoice Summary</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div id="printable-invoice" className="p-8 flex-1 overflow-y-auto space-y-8 print:p-0">
          
          {/* Brand Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-zinc-900">Triptay</span>
                <span className="bg-primary/10 text-primary text-[8px] font-black tracking-tight px-1.5 py-0.5 rounded">INVOICE</span>
              </div>
              <p className="text-[9px] text-zinc-400 font-bold">Triptay Tech Pvt. Ltd. • GSTIN: 29AAACT9870R1Z2</p>
              <p className="text-[9px] text-zinc-400 font-bold">Bengaluru, KA, India</p>
            </div>
            
            <div className="text-right">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${
                booking.status === "Completed" 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : booking.status === "Upcoming"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-rose-50 text-rose-500 border border-rose-100"
              }`}>
                {booking.status}
              </span>
              <p className="text-[10px] text-zinc-400 font-bold mt-2.5">Invoice No: INV-{booking.id}</p>
              <p className="text-[10px] text-zinc-400 font-bold">Date: {booking.date}</p>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 text-xs font-bold text-zinc-700">
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mb-2">Billed To (Guest)</h4>
              <p className="text-zinc-900 font-black">{booking.guestName}</p>
              <p className="text-zinc-400 text-[10px] font-bold mt-0.5">Triptay Guest User</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mb-2">Provider (Host)</h4>
              <p className="text-zinc-900 font-black">{booking.hostName}</p>
              <p className="text-zinc-400 text-[10px] font-bold mt-0.5">Onboarded Property Partner</p>
            </div>
          </div>

          {/* Booking Context */}
          <div className="bg-zinc-50 border border-zinc-100/50 p-4 rounded-2xl">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mb-1">Service description</h4>
            <p className="text-xs text-zinc-800 font-black">{booking.propertyName}</p>
            <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Booking confirmation reference: {booking.id}</p>
          </div>

          {/* Table Breakdown */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 border-b border-zinc-100 pb-2 text-[10px] font-black text-zinc-400 uppercase tracking-tight">
              <span>Item / Description</span>
              <span className="text-center">Rate Config</span>
              <span className="text-right">Amount</span>
            </div>

            {/* Base price */}
            <div className="grid grid-cols-3 text-xs font-bold text-zinc-700 py-1">
              <span>Homestay / Experience Fee (Base)</span>
              <span className="text-zinc-400 text-center">-</span>
              <span className="text-right text-zinc-900">₹{basePrice.toLocaleString()}</span>
            </div>

            {/* Platform fee */}
            <div className="grid grid-cols-3 text-xs font-bold text-zinc-700 py-1">
              <span>Platform Facilitation Fee</span>
              <span className="text-zinc-400 text-center">{commissionRate}% split</span>
              <span className="text-right text-zinc-900">₹{platformFee.toLocaleString()}</span>
            </div>

            {/* GST fee */}
            <div className="grid grid-cols-3 text-xs font-bold text-zinc-700 py-1">
              <span>GST (Goods & Services Tax)</span>
              <span className="text-zinc-400 text-center">{gstRate}% split</span>
              <span className="text-right text-zinc-900">₹{gstAmount.toLocaleString()}</span>
            </div>

            <div className="border-t border-zinc-900 pt-3 flex justify-between items-center">
              <span className="text-xs font-black text-zinc-900">Grand Total (Inclusive)</span>
              <span className="text-base font-black text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Thank you for booking through Triptay Homestays & Activities.</span>
            </div>
            <span className="text-[8px] text-zinc-300 font-bold uppercase tracking-tight">Automated Ledger Audit</span>
          </div>

        </div>

      </div>
    </div>
  );
};
