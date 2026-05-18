import React from "react";
import type { SystemBooking } from "../../types";

interface FinancialsModuleProps {
  bookings: SystemBooking[];
  commissionRate: number;
  setCommissionRate: (rate: number) => void;
  gstRate: number;
  setGstRate: (rate: number) => void;
  triggerPayoutModal: (vendorName: string, balance: number) => void;
  handleCancelAndRefundBooking: (bookingId: string) => void;
}

export const FinancialsModule: React.FC<FinancialsModuleProps> = ({
  bookings,
  commissionRate,
  setCommissionRate,
  gstRate,
  setGstRate,
  triggerPayoutModal,
  handleCancelAndRefundBooking
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const activeBookings = bookings.filter(b => b.status !== "Cancelled");
  const platformRevenueCalculated = activeBookings.reduce((sum, b) => sum + (b.amount * (commissionRate / 100)), 0);
  const gstCalculatedCut = activeBookings.reduce((sum, b) => sum + (b.amount * (gstRate / 100)), 0);
  const vendorShareCalculated = activeBookings.reduce((sum, b) => sum + (b.amount * (1 - (commissionRate / 100) - (gstRate / 100))), 0);
  const totalFinancialVolume = activeBookings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-8">
      {/* Financial Slider Configurator */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Ledger Allocation Configuration</h3>
          <p className="text-xs text-zinc-400 font-semibold">Dynamically adjust global commission margin rates and gst compliance splits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black">
              <span className="text-zinc-500">Platform commission Rate</span>
              <span className="text-primary bg-primary/5 px-2 py-0.5 rounded">{commissionRate}%</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="35" 
              value={commissionRate}
              onChange={e => setCommissionRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-zinc-400 font-semibold">Applies globally to Homestays & Activity checkouts</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black">
              <span className="text-zinc-500">CGST + SGST Combined Split</span>
              <span className="text-secondary bg-secondary/5 px-2 py-0.5 rounded">{gstRate}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="28" 
              value={gstRate}
              onChange={e => setGstRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <p className="text-[10px] text-zinc-400 font-semibold">Configured as per central government GST compliance acts</p>
          </div>
        </div>

        {/* Live Calculation Output Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-zinc-50">
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-400 tracking-wider uppercase">Active volume (Total)</span>
            <h4 className="text-lg font-black text-zinc-900">₹{totalFinancialVolume.toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1 border border-primary/10">
            <span className="text-[9px] font-black text-primary tracking-wider uppercase">Platform gross fee ({commissionRate}%)</span>
            <h4 className="text-lg font-black text-primary">₹{platformRevenueCalculated.toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1 border border-secondary/10">
            <span className="text-[9px] font-black text-secondary tracking-wider uppercase">GST Compliance Cut ({gstRate}%)</span>
            <h4 className="text-lg font-black text-secondary">₹{gstCalculatedCut.toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-400 tracking-wider uppercase">Vendor net split payout</span>
            <h4 className="text-lg font-black text-emerald-600">₹{vendorShareCalculated.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Financial calculations card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ledger splits */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Platform Settlement Ledger</h3>
            <p className="text-xs text-zinc-400 font-semibold">Ledger history tracking with manual cash settlement tools</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                  <th className="py-4 px-4">Host Name</th>
                  <th className="py-4 px-4">Total Bookings</th>
                  <th className="py-4 px-4">Platform commission</th>
                  <th className="py-4 px-4">Expected payout balance</th>
                  <th className="py-4 px-4 text-right">Manual Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                {[
                  { name: "Aryan Singh", count: 4, gross: 65000, balance: 55250 },
                  { name: "Sneha Reddy", count: 2, gross: 32000, balance: 27200 },
                  { name: "Rakesh Negi", count: 1, gross: 2400, balance: 2040 }
                ].map((v, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4 text-zinc-950 font-extrabold">{v.name}</td>
                    <td className="py-4 px-4">{v.count} bookings (₹{v.gross.toLocaleString()})</td>
                    <td className="py-4 px-4 text-primary">₹{(v.gross * (commissionRate / 100)).toLocaleString()}</td>
                    <td className="py-4 px-4 font-black text-emerald-600">₹{v.balance.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => triggerPayoutModal(v.name, v.balance)}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-[10px] font-black tracking-tight transition-all shadow-md shadow-secondary/15"
                      >
                        Settle Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Ledger split logic details */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Internal Billing logic</h3>
            <p className="text-xs text-zinc-400 font-semibold">Automatic calculation split breakdown</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-zinc-900">How splitting works:</p>
              
              <div className="space-y-2 text-zinc-500 text-[11px] leading-relaxed font-medium">
                <div className="flex gap-2">
                  <span className="text-zinc-950 font-bold">1.</span>
                  <span>Customer is shown the <strong>Final Inclusive Price</strong> (Base + GST + Platform fee).</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-950 font-bold">2.</span>
                  <span>Platform Fee is included automatically without separate highlights to increase conversion.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-950 font-bold">3.</span>
                  <span>Upon payment success, 15% gets auto-split into Platform revenue ledger and 5% into GST collection ledger.</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-zinc-200 text-xs font-bold text-zinc-400 space-y-1">
              <p className="text-[10px] font-black tracking-wider text-zinc-500">Manual payout ledger</p>
              <p className="leading-relaxed font-semibold">
                Payouts to vendors are NOT automatic. Platform logs direct ledger entries. Admin will manually verify and settle payments post traveler check-out.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Bookings & Refund Directory */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Recent System Bookings & Direct Refunds</h3>
          <p className="text-xs text-zinc-400 font-semibold">Track stays/tours bookings, handle direct cancellations, and issue immediate wallet cashbacks / refunds</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                <th className="py-4 px-4">Booking ID</th>
                <th className="py-4 px-4">Guest Name</th>
                <th className="py-4 px-4">Property / Experience</th>
                <th className="py-4 px-4">Host Name</th>
                <th className="py-4 px-4">Transaction Value</th>
                <th className="py-4 px-4">Date & Time</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Moderation action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-4"><span className="font-mono text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">{b.id}</span></td>
                  <td className="py-4 px-4 text-zinc-950 font-extrabold">{b.guestName}</td>
                  <td className="py-4 px-4 text-zinc-700">{b.propertyName}</td>
                  <td className="py-4 px-4 text-zinc-500">{b.hostName}</td>
                  <td className="py-4 px-4 text-zinc-900 font-black">₹{b.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-zinc-400 font-semibold">{b.date}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[8px] font-black tracking-tight px-2.5 py-1 rounded-full border",
                      b.status === "Completed" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                      b.status === "Upcoming" && "bg-blue-50 text-blue-600 border-blue-100",
                      b.status === "Cancelled" && "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {b.status !== "Cancelled" ? (
                      <button
                        onClick={() => handleCancelAndRefundBooking(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all text-rose-500 text-[10px] font-black tracking-tight"
                      >
                        Cancel & Refund
                      </button>
                    ) : (
                      <span className="text-zinc-400 italic text-[10px] font-semibold">Refund Credited ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
