import React from "react";
import { Download, Receipt, Loader2 } from "lucide-react";
import type { SystemBooking } from "../../types";

interface CommissionSummary {
  totalCommission: number;
  totalHostPayout: number;
  pendingCommission: number;
  processedCommission: number;
  totalTransactions: number;
}

interface HostBreakdownItem {
  hostId: string;
  hostName: string;
  hostEmail: string;
  commission: number;
  payout: number;
  pending: number;
}

interface PayoutItem {
  id: string;
  hostId: string;
  hostName: string;
  hostEmail: string;
  amount: number;
  status: string;
  payoutRef: string;
  createdAt: string;
}

interface FinancialsModuleProps {
  bookings: SystemBooking[];
  commissionRate: number;
  setCommissionRate: (rate: number) => void;
  gstRate: number;
  setGstRate: (rate: number) => void;
  triggerPayoutModal: (vendorName: string, balance: number) => void;
  handleCancelAndRefundBooking: (bookingId: string) => void;
  setSelectedInvoiceBooking: (booking: SystemBooking | null) => void;
  commissionSummary: CommissionSummary | null;
  hostBreakdown: HostBreakdownItem[];
  payouts: PayoutItem[];
  financialsLoading: boolean;
}

export const FinancialsModule: React.FC<FinancialsModuleProps> = ({
  bookings,
  commissionRate,
  setCommissionRate,
  gstRate,
  setGstRate,
  triggerPayoutModal,
  handleCancelAndRefundBooking,
  setSelectedInvoiceBooking,
  commissionSummary,
  hostBreakdown,
  payouts,
  financialsLoading
}) => {
  const handleExportCSV = () => {
    const headers = "Booking ID,Guest Name,Property/Experience,Host Name,Amount,Date,Status\n";
    const rows = bookings.map(b =>
      `"${b.id}","${b.guestName}","${b.propertyName}","${b.hostName}",${b.amount},"${b.date}","${b.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `triptay_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const activeBookings = bookings.filter(b => b.status !== "Cancelled");
  // Use real commission summary from backend if available, otherwise fall back to calculated values
  const platformRevenueCalculated = commissionSummary?.totalCommission ?? activeBookings.reduce((sum, b) => sum + (b.amount * (commissionRate / 100)), 0);
  const gstCalculatedCut = activeBookings.reduce((sum, b) => sum + (b.amount * (gstRate / 100)), 0);
  const vendorShareCalculated = commissionSummary?.totalHostPayout ?? activeBookings.reduce((sum, b) => sum + (b.amount * (1 - (commissionRate / 100) - (gstRate / 100))), 0);
  const totalFinancialVolume = activeBookings.reduce((sum, b) => sum + b.amount, 0);
  const pendingCommissionTotal = commissionSummary?.pendingCommission ?? 0;
  const processedCommissionTotal = commissionSummary?.processedCommission ?? 0;

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
                  <th className="py-4 px-4">Platform Commission</th>
                  <th className="py-4 px-4">Processed Payout</th>
                  <th className="py-4 px-4">Pending Balance</th>
                  <th className="py-4 px-4 text-right">Manual Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                {financialsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold">Loading settlement ledger...</span>
                      </div>
                    </td>
                  </tr>
                ) : hostBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs font-bold">
                      No host settlement records found yet.
                    </td>
                  </tr>
                ) : (
                  hostBreakdown.map((host) => (
                    <tr key={host.hostId} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-zinc-950 font-extrabold">{host.hostName}</div>
                        <div className="text-[10px] text-zinc-400 font-semibold">{host.hostEmail}</div>
                      </td>
                      <td className="py-4 px-4 text-primary">₹{host.commission.toLocaleString()}</td>
                      <td className="py-4 px-4 text-zinc-500">₹{host.payout.toLocaleString()}</td>
                      <td className="py-4 px-4 font-black text-emerald-600">₹{host.pending.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => triggerPayoutModal(host.hostName, host.pending)}
                          disabled={host.pending <= 0}
                          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-black tracking-tight transition-all shadow-md shadow-secondary/15"
                        >
                          Settle Balance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Recent System Bookings & Direct Refunds</h3>
            <p className="text-xs text-zinc-400 font-semibold">Track stays/tours bookings, handle direct cancellations, and issue immediate wallet cashbacks / refunds</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-tight flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" /> Export to CSV
          </button>
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
                <th className="py-4 px-4 text-right">Actions</th>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-all text-zinc-600 text-[10px] font-black tracking-tight flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Invoice
                      </button>
                      {b.status !== "Cancelled" ? (
                        <button
                          onClick={() => handleCancelAndRefundBooking(b.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all text-rose-500 text-[10px] font-black tracking-tight"
                        >
                          Cancel & Refund
                        </button>
                      ) : (
                        <span className="text-zinc-400 italic text-[10px] font-semibold px-2">Refunded ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Payout History</h3>
          <p className="text-xs text-zinc-400 font-semibold">Record of all processed and pending vendor payouts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-400 tracking-wider uppercase">Total Commission</span>
            <h4 className="text-lg font-black text-primary">₹{(commissionSummary?.totalCommission ?? 0).toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1 border border-amber-100">
            <span className="text-[9px] font-black text-amber-500 tracking-wider uppercase">Pending Commission</span>
            <h4 className="text-lg font-black text-amber-600">₹{pendingCommissionTotal.toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-1 border border-emerald-100">
            <span className="text-[9px] font-black text-emerald-500 tracking-wider uppercase">Processed Commission</span>
            <h4 className="text-lg font-black text-emerald-600">₹{processedCommissionTotal.toLocaleString()}</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                <th className="py-4 px-4">Payout Ref</th>
                <th className="py-4 px-4">Host Name</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
              {financialsLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">Loading payout history...</span>
                    </div>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs font-bold">
                    No payouts processed yet.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4"><span className="font-mono text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">{p.payoutRef || p.id}</span></td>
                    <td className="py-4 px-4">
                      <div className="text-zinc-950 font-extrabold">{p.hostName}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold">{p.hostEmail}</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-900 font-black">₹{p.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[8px] font-black tracking-tight px-2.5 py-1 rounded-full border",
                        p.status === "completed" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                        p.status === "pending" && "bg-amber-50 text-amber-600 border-amber-100",
                        p.status === "failed" && "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-semibold">{p.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
