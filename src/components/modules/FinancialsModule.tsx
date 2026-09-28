import React, { useState, useRef, useEffect } from "react";
import { Download, Receipt, Loader2, Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { SystemBooking } from "../../types";

interface CommissionSummary {
  totalCommission: number;
  totalHostPayout: number;
  totalGst?: number;
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
  papDebtPending: number;
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
  settlePapDebt: (bookingId: string) => Promise<void>;
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
  settlePapDebt,
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
  const gstCalculatedCut = commissionSummary?.totalGst ?? activeBookings.reduce((sum, b) => sum + ((b.amount * (commissionRate / 100)) * (gstRate / 100)), 0);
  const vendorShareCalculated = commissionSummary?.totalHostPayout ?? activeBookings.reduce((sum, b) => sum + (b.paymentMethod === "PAY_AT_PROPERTY" ? 0 : (b.amount * (1 - (commissionRate / 100) - (gstRate / 100)))), 0);
  const totalFinancialVolume = activeBookings.reduce((sum, b) => sum + b.amount, 0);
  const pendingCommissionTotal = commissionSummary?.pendingCommission ?? 0;
  const processedCommissionTotal = commissionSummary?.processedCommission ?? 0;

  // Pagination & Search States
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingPage, setBookingPage] = useState(1);
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutPage, setPayoutPage] = useState(1);
  const itemsPerPage = 6;

  // Bookings logic
  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) || 
    b.propertyName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.hostName.toLowerCase().includes(bookingSearch.toLowerCase())
  );
  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = filteredBookings.slice((bookingPage - 1) * itemsPerPage, bookingPage * itemsPerPage);

  // Payouts logic
  const filteredPayouts = payouts.filter(p => 
    p.hostName.toLowerCase().includes(payoutSearch.toLowerCase()) || 
    (p.payoutRef && p.payoutRef.toLowerCase().includes(payoutSearch.toLowerCase()))
  );
  const totalPayoutPages = Math.max(1, Math.ceil(filteredPayouts.length / itemsPerPage));
  const paginatedPayouts = filteredPayouts.slice((payoutPage - 1) * itemsPerPage, payoutPage * itemsPerPage);

  // Slider Save Indicator Logic
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const triggerSaveIndicator = () => {
    setIsConfigSaving(true);
    setConfigSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setIsConfigSaving(false);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
    }, 1000);
  };

  const handleCommissionChange = (val: number) => {
    setCommissionRate(val);
    triggerSaveIndicator();
  };

  const handleGstChange = (val: number) => {
    setGstRate(val);
    triggerSaveIndicator();
  };

  return (
    <div className="space-y-8">
      {/* 1. Top Level KPIs - Live Calculation Output */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-zinc-100 shadow-sm rounded-[32px] space-y-1.5 flex flex-col justify-center">
          <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">Total Booking Revenue (GMV)</span>
          <h4 className="text-2xl font-black text-zinc-900">₹{totalFinancialVolume.toLocaleString()}</h4>
        </div>
        <div className="p-6 bg-white border border-primary/20 shadow-sm rounded-[32px] space-y-1.5 flex flex-col justify-center">
          <span className="text-[10px] font-black text-primary tracking-wider uppercase">Platform Earnings (Commission)</span>
          <h4 className="text-2xl font-black text-primary">₹{platformRevenueCalculated.toLocaleString()}</h4>
        </div>
        <div className="p-6 bg-white border border-secondary/20 shadow-sm rounded-[32px] space-y-1.5 flex flex-col justify-center">
          <span className="text-[10px] font-black text-secondary tracking-wider uppercase">GST Collected (To Remit)</span>
          <h4 className="text-2xl font-black text-secondary">₹{gstCalculatedCut.toLocaleString()}</h4>
        </div>
        <div className="p-6 bg-white border border-emerald-100 shadow-sm rounded-[32px] space-y-1.5 flex flex-col justify-center">
          <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">Vendor Earnings (Payable)</span>
          <h4 className="text-2xl font-black text-emerald-600">₹{vendorShareCalculated.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h3 className="text-base font-black text-zinc-900 tracking-tight">Vendor Balances & Settlements</h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1">Manage vendor balances and manual cash settlements</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                  <th className="py-4 px-4">Host Name</th>
                  <th className="py-4 px-4">Our Commission</th>
                  <th className="py-4 px-4">Total Paid Out</th>
                  <th className="py-4 px-4">Unpaid Balance</th>
                  <th className="py-4 px-4 text-rose-500">PAP Debt</th>
                  <th className="py-4 px-4 text-right">Action</th>
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
                      <td className="py-4 px-4 text-primary">₹{Math.round(host.commission).toLocaleString()}</td>
                      <td className="py-4 px-4 text-zinc-500">₹{Math.round(host.payout).toLocaleString()}</td>
                      <td className="py-4 px-4 font-black text-emerald-600">₹{Math.round(host.pending).toLocaleString()}</td>
                      <td className="py-4 px-4 font-black text-rose-500">₹{Math.round(host.papDebtPending || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => triggerPayoutModal(host.hostName, host.pending)}
                          disabled={host.pending <= 0}
                          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-black tracking-tight transition-all active:scale-95"
                        >
                          Settle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* 4. Recent Bookings & Refund Directory */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-black text-zinc-900 tracking-tight">Recent Bookings & Invoices</h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1">Manage refunds and download invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={bookingSearch}
                onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                className="pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-tight flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                <th className="py-4 px-4">ID</th>
                <th className="py-4 px-4">Guest</th>
                <th className="py-4 px-4">Property</th>
                <th className="py-4 px-4">Host</th>
                <th className="py-4 px-4">Value</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs font-bold">
                    No bookings found.
                  </td>
                </tr>
              ) : paginatedBookings.map(b => (
                <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-4"><span className="font-mono text-[10px] text-zinc-500">{b.id.substring(0,8)}</span></td>
                  <td className="py-4 px-4 text-zinc-950 font-extrabold">{b.guestName}</td>
                  <td className="py-4 px-4 text-zinc-700">{b.propertyName}</td>
                  <td className="py-4 px-4 text-zinc-500">{b.hostName}</td>
                  <td className="py-4 px-4 text-zinc-900 font-black">₹{b.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-zinc-400 font-semibold">{b.date}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[9px] font-black tracking-tight px-2.5 py-1 rounded-full",
                      b.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                      b.status === "Upcoming" ? "bg-blue-50 text-blue-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors"
                        title="View Invoice"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      {(b as any).paymentMethod === "PAY_AT_PROPERTY" && (b as any).papSettlementStatus === "pending" && (
                        <button
                          onClick={() => {
                            settlePapDebt(b.id).catch(() => {});
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-500 text-[10px] font-black tracking-tight transition-all"
                          title="Mark PAP commission debt as manually settled offline"
                        >
                          Settle PAP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalBookingPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-50">
            <span className="text-xs font-semibold text-zinc-400">
              Showing {(bookingPage - 1) * itemsPerPage + 1} to {Math.min(bookingPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookingPage(p => Math.max(1, p - 1))}
                disabled={bookingPage === 1}
                className="p-1.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-30 transition-all text-zinc-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-900 min-w-[2rem] text-center">{bookingPage} / {totalBookingPages}</span>
              <button
                onClick={() => setBookingPage(p => Math.min(totalBookingPages, p + 1))}
                disabled={bookingPage === totalBookingPages}
                className="p-1.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-30 transition-all text-zinc-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-black text-zinc-900 tracking-tight">Payout History</h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1">Record of all processed and pending vendor payouts</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Host or Ref..."
              value={payoutSearch}
              onChange={(e) => { setPayoutSearch(e.target.value); setPayoutPage(1); }}
              className="pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-black text-zinc-500 tracking-wider uppercase mb-1">Total Platform Revenue</span>
            <h4 className="text-xl font-black text-zinc-900">₹{(commissionSummary?.totalCommission ?? 0).toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-black text-amber-500 tracking-wider uppercase mb-1">Unpaid Balance (Platform-wide)</span>
            <h4 className="text-xl font-black text-amber-600">₹{pendingCommissionTotal.toLocaleString()}</h4>
          </div>
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase mb-1">Total Transferred to Vendors</span>
            <h4 className="text-xl font-black text-emerald-600">₹{processedCommissionTotal.toLocaleString()}</h4>
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
              ) : paginatedPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs font-bold">
                    No payouts found.
                  </td>
                </tr>
              ) : (
                paginatedPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4"><span className="font-mono text-[10px] text-zinc-500">{p.payoutRef || p.id.substring(0,8)}</span></td>
                    <td className="py-4 px-4">
                      <div className="text-zinc-950 font-extrabold">{p.hostName}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold">{p.hostEmail}</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-900 font-black">₹{p.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[9px] font-black tracking-tight px-2.5 py-1 rounded-full",
                        p.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                        p.status === "pending" ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
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

        {/* Pagination controls */}
        {totalPayoutPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-50">
            <span className="text-xs font-semibold text-zinc-400">
              Showing {(payoutPage - 1) * itemsPerPage + 1} to {Math.min(payoutPage * itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                disabled={payoutPage === 1}
                className="p-1.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-30 transition-all text-zinc-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-900 min-w-[2rem] text-center">{payoutPage} / {totalPayoutPages}</span>
              <button
                onClick={() => setPayoutPage(p => Math.min(totalPayoutPages, p + 1))}
                disabled={payoutPage === totalPayoutPages}
                className="p-1.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-30 transition-all text-zinc-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
