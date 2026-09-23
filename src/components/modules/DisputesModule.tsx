import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  Search, 
  Clock, 
  Coins, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import type { DisputeTicket } from "../../types";

interface DisputesModuleProps {
  disputes: DisputeTicket[];
  onRefund: (disputeId: string) => void;
  onRelease: (disputeId: string) => void;
  onBlockHost: (hostName: string) => void;
}

export const DisputesModule: React.FC<DisputesModuleProps> = ({
  disputes,
  onRefund,
  onRelease,
  onBlockHost
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Resolved-Refunded" | "Resolved-PaidVendor">("All");

  // Filtered Disputes
  const filteredDisputes = disputes.filter(disp => {
    const matchesSearch = 
      disp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || disp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalDisputes = disputes.length;
  const pendingCount = disputes.filter(d => d.status === "Pending").length;
  const refundedCount = disputes.filter(d => d.status === "Resolved-Refunded").length;
  const releasedCount = disputes.filter(d => d.status === "Resolved-PaidVendor").length;

  return (
    <div className="space-y-8">
      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-tight text-zinc-400 uppercase">Total Disputes</span>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{totalDisputes}</h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">Reported tickets</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-tight text-zinc-400 uppercase">Pending Arbitration</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-rose-500 tracking-tight">{pendingCount}</h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-tight text-zinc-400 uppercase">Refunded Guests</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-500 tracking-tight">{refundedCount}</h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">Credits returned to guest wallets</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-tight text-zinc-400 uppercase">Released to Host</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-blue-500 tracking-tight">{releasedCount}</h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">Vendor payout cleared</p>
          </div>
        </div>
      </div>

      {/* Filter and Control Panel */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search disputes (ID, Booking ID, User, Host)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(["All", "Pending", "Resolved-Refunded", "Resolved-PaidVendor"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all ${
                  statusFilter === tab 
                    ? "bg-zinc-900 text-white shadow-sm" 
                    : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100"
                }`}
              >
                {tab === "Resolved-Refunded" ? "Refunded" : tab === "Resolved-PaidVendor" ? "Released Payout" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dispute Tickets List */}
        {filteredDisputes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-zinc-600">No disputes found</p>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">There are no matching dispute tickets currently on the board.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDisputes.map(dispute => (
              <div 
                key={dispute.id} 
                className="bg-zinc-50/50 border border-zinc-100 rounded-[28px] p-6 hover:border-zinc-200 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-100/80 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-zinc-900">{dispute.id}</span>
                      <span className="text-[10px] font-bold text-zinc-400">•</span>
                      <span className="text-[10px] font-black text-zinc-500">Booking: {dispute.bookingId}</span>
                      <span className="text-[10px] font-bold text-zinc-400">•</span>
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dispute.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 mt-1">
                      <span className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-full border border-primary/10 text-[10px] font-black">
                        Guest: {dispute.guestName}
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 text-[10px] font-black">
                        Host: {dispute.hostName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <p className="text-xs font-black text-zinc-900">₹{dispute.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-400 font-bold">Disputed Amount</p>
                    </div>
                    
                    {dispute.status === "Pending" && (
                      <span className="bg-rose-50 text-rose-500 text-[9px] font-black tracking-tight px-3 py-1 rounded-full border border-rose-100 uppercase">
                        Pending Admin Decision
                      </span>
                    )}
                    {dispute.status === "Resolved-Refunded" && (
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-tight px-3 py-1 rounded-full border border-emerald-100 uppercase">
                        Resolved - Refunded
                      </span>
                    )}
                    {dispute.status === "Resolved-PaidVendor" && (
                      <span className="bg-blue-50 text-blue-600 text-[9px] font-black tracking-tight px-3 py-1 rounded-full border border-blue-100 uppercase">
                        Resolved - Host Paid
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black tracking-tight text-zinc-400 uppercase mb-1">Issue Description</h4>
                  <p className="text-xs text-zinc-600 font-bold bg-white border border-zinc-100 p-3.5 rounded-2xl leading-relaxed">
                    {dispute.issue}
                  </p>
                </div>

                {dispute.status === "Pending" && (
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-2 border-t border-zinc-100/50">
                    <button
                      onClick={() => onRefund(dispute.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black tracking-tight shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" /> Refund Guest Wallet
                    </button>
                    <button
                      onClick={() => onRelease(dispute.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-rose-500 text-white text-xs font-black tracking-tight shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Release Funds to Host
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => onBlockHost(dispute.hostName)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-500 text-xs font-black tracking-tight hover:bg-rose-50 active:scale-[0.98] transition-all flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Suspend Host & List
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
