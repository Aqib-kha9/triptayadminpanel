import React from "react";
import { CheckCircle2 } from "lucide-react";

interface PayoutModalProps {
  payoutVendor: { name: string; balance: number } | null;
  setPayoutVendor: (vendor: any) => void;
  payoutReceipt: string | null;
  setPayoutReceipt: (receipt: any) => void;
  executeManualPayout: () => void;
  closePayoutReceipt: () => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  payoutVendor,
  setPayoutVendor,
  payoutReceipt,
  executeManualPayout,
  closePayoutReceipt
}) => {
  if (!payoutVendor) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] max-w-sm w-full p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {!payoutReceipt ? (
          // Stage 1: Confirm Settlement Payout Details
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-zinc-900 tracking-tight">Settle Host Payout</h3>
              <p className="text-xs text-zinc-400 font-semibold">Send verified bank payout transfer</p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-semibold">Host Recipient:</span>
                <span className="text-zinc-950 font-bold">{payoutVendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-semibold">Account Payout:</span>
                <span className="text-zinc-950 font-mono font-bold">**** **** 6123</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2 text-sm font-black">
                <span className="text-zinc-950">Amount Settle:</span>
                <span className="text-emerald-600">₹{payoutVendor.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setPayoutVendor(null)}
                className="flex-1 py-3 rounded-2xl border border-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeManualPayout}
                className="flex-1 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black tracking-tight transition-colors"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        ) : (
          // Stage 2: Settlement Payout Invoice Receipt Generated
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-zinc-900 tracking-tight">Settlement Succeeded</h3>
              <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Receipt Number: {payoutReceipt}</p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2 text-[10px] text-left font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">Paid to Recipient:</span>
                <span className="text-zinc-900 font-extrabold">{payoutVendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Settled:</span>
                <span className="text-emerald-600 font-black">₹{payoutVendor.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100/50 pt-2">
                <span className="text-zinc-400">Transfer ID:</span>
                <span className="text-zinc-900 font-mono">TXN-99882231A</span>
              </div>
            </div>

            <button 
              onClick={closePayoutReceipt}
              className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black tracking-tight transition-colors"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
