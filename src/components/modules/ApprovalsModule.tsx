import React from "react";
import { Search, FileText, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock, IdCard, Building2, Landmark } from "lucide-react";
import type { HostApplication } from "../../types";

interface ApprovalsModuleProps {
  applications: HostApplication[];
  setSelectedKycApp: (app: HostApplication) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  kycLoading: boolean;
  kycError: string | null;
  kycFilter: string;
  setKycFilter: (v: string) => void;
  refreshKycApplications: () => Promise<void>;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export const ApprovalsModule: React.FC<ApprovalsModuleProps> = ({
  applications,
  setSelectedKycApp,
  searchTerm,
  setSearchTerm,
  kycLoading,
  kycError,
  kycFilter,
  setKycFilter,
  refreshKycApplications,
}) => {
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.panNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = applications.filter(a => a.status === "Pending").length;
  const approvedCount = applications.filter(a => a.status === "Approved").length;
  const rejectedCount = applications.filter(a => a.status === "Rejected").length;

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-50">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Vendor KYC Applications Board</h3>
          <p className="text-xs text-zinc-400 font-semibold">Review vendor identity documents — PAN, Aadhaar, GSTIN & bank mandates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshKycApplications}
            disabled={kycLoading}
            className="p-2 rounded-xl border border-zinc-100 hover:bg-zinc-50 text-zinc-400 hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh KYC applications"
          >
            <RefreshCw className={`w-4 h-4 ${kycLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 border border-zinc-100 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/10 transition-all bg-zinc-50 rounded-2xl px-4 py-2 w-full md:w-auto">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, email, PAN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-zinc-700 w-full placeholder:text-zinc-400 p-0"
            />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(tab => {
          const count = tab.value === "" ? applications.length
            : tab.value === "Pending" ? pendingCount
              : tab.value === "Approved" ? approvedCount
                : rejectedCount;
          return (
            <button
              key={tab.value}
              onClick={() => setKycFilter(tab.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                kycFilter === tab.value
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md shadow-zinc-950/10"
                  : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200 hover:text-zinc-700"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-md text-[10px]",
                kycFilter === tab.value ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {kycError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{kycError}</span>
          <button onClick={refreshKycApplications} className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 transition-colors text-rose-700 font-black">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {kycLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-zinc-400">Loading KYC applications...</p>
        </div>
      )}

      {/* Application Cards */}
      {!kycLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApps.map(app => (
            <div
              key={app._id || app.id}
              className="p-6 rounded-[32px] border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-primary/5 bg-white transition-all space-y-4 relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={cn(
                  "text-[8px] font-black tracking-tight px-2.5 py-1 rounded-full border flex items-center gap-1",
                  app.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-100",
                  app.status === "Approved" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                  app.status === "Rejected" && "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {app.status === "Pending" && <Clock className="w-3 h-3" />}
                  {app.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                  {app.status === "Rejected" && <XCircle className="w-3 h-3" />}
                  {app.status}
                </span>
              </div>

              {/* Vendor Identity */}
              <div className="space-y-1 pr-20">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-zinc-900 truncate">{app.name}</h4>
                  <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">
                    {app.role}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold">{app.email} • {app.phone}</p>
              </div>

              {/* KYC Document Details */}
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
                  <IdCard className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[9px] font-black text-zinc-400 tracking-wider uppercase">KYC Documents</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                  <div>
                    <span className="text-zinc-400 font-semibold">PAN:</span>
                    <p className="text-zinc-950 font-bold font-mono">{app.panNumber || "—"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold">GSTIN:</span>
                    <p className="text-zinc-950 font-bold font-mono text-blue-600">{app.gstin || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 font-semibold">Bank A/C:</span>
                    <p className="text-zinc-950 font-bold font-mono">{app.bankAccount || "—"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold">IFSC:</span>
                    <p className="text-zinc-950 font-bold font-mono">{app.bankIFSC || "—"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold">Submitted:</span>
                    <p className="text-zinc-950 font-bold">{app.submittedDate}</p>
                  </div>
                </div>

                {/* Document Upload Indicators */}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1",
                    app.aadharFront ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                  )}>
                    <Landmark className="w-3 h-3" />
                    {app.aadharFront ? "Aadhaar ✓" : "Aadhaar ✗"}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1",
                    app.panCardImage ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                  )}>
                    <IdCard className="w-3 h-3" />
                    {app.panCardImage ? "PAN Card ✓" : "PAN Card ✗"}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1",
                    app.bankIFSC ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                  )}>
                    <Building2 className="w-3 h-3" />
                    Bank ✓
                  </span>
                </div>
              </div>

              {/* Review Button */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedKycApp(app)}
                  className="w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover hover:scale-[1.01] transition-all text-xs font-black text-white text-center flex items-center justify-center gap-1.5 shadow-md shadow-primary/15"
                >
                  <FileText className="w-4 h-4 text-white" /> Review Application
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredApps.length === 0 && !kycError && (
            <div className="col-span-full py-16 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-xs font-bold text-zinc-400">
                {kycFilter
                  ? `No ${kycFilter.toLowerCase()} KYC applications found.`
                  : "No KYC applications found. When vendors submit KYC from the user panel, they will appear here."}
              </p>
              <button
                onClick={refreshKycApplications}
                className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 text-xs font-bold text-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
