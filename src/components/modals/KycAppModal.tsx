import React from "react";
import { X, Check, AlertCircle, IdCard, Landmark, Building2, CreditCard, ExternalLink } from "lucide-react";
import type { HostApplication } from "../../types";

interface KycAppModalProps {
  selectedKycApp: HostApplication | null;
  setSelectedKycApp: (app: HostApplication | null) => void;
  handleApprove: (id: string) => Promise<void>;
  handleReject: (id: string) => Promise<void>;
}

export const KycAppModal: React.FC<KycAppModalProps> = ({
  selectedKycApp,
  setSelectedKycApp,
  handleApprove,
  handleReject
}) => {
  if (!selectedKycApp) return null;

  const app = selectedKycApp;
  const appId = app._id || app.id;

  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Close button */}
        <button
          onClick={() => setSelectedKycApp(null)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header — fixed */}
        <div className="px-8 pt-8 pb-2 flex-shrink-0 space-y-1">
          <span className="text-[9px] font-black text-zinc-950 bg-zinc-950/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
            KYC Identity Document Review
          </span>
          <h3 className="text-lg font-black text-zinc-900 leading-tight">
            Review Application
            <span className="ml-2 text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
              {appId}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 font-semibold">Verify PAN, Aadhaar, GSTIN & bank mandate documents</p>
        </div>

        {/* Content details — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-2 space-y-4 min-h-0">

          {/* Identity */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Vendor Identity Details
            </h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">Vendor Name:</span>
                <span className="text-zinc-950">{app.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="text-zinc-950 font-mono text-[11px]">{app.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Phone:</span>
                <span className="text-zinc-950">{app.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Role:</span>
                <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{app.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Submitted:</span>
                <span className="text-zinc-950">{app.submittedDate}</span>
              </div>
            </div>
          </div>

          {/* Legal Document Mandates */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" /> Legal Document Mandates
            </h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">PAN Number:</span>
                <span className="text-zinc-950 font-mono">{app.panNumber || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">GSTIN:</span>
                <span className="text-zinc-950 font-mono text-blue-600">{app.gstin || "—"}</span>
              </div>
            </div>
          </div>

          {/* Bank Mandate Details */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Bank Mandate Details
            </h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">Account Number:</span>
                <span className="text-zinc-950 font-mono text-[11px] truncate max-w-[200px]">{app.bankAccount || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">IFSC Code:</span>
                <span className="text-zinc-950 font-mono">{app.bankIFSC || "—"}</span>
              </div>
            </div>
          </div>

          {/* Uploaded Document Images */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-3">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" /> Uploaded Identity Documents
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Aadhaar Front */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Aadhaar Front</span>
                {app.aadharFront ? (
                  <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 h-28">
                    <img
                      src={app.aadharFront}
                      alt="Aadhaar Front"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <a
                      href={app.aadharFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-all flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 h-28 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-zinc-300">Not uploaded</span>
                  </div>
                )}
              </div>

              {/* Aadhaar Back */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Aadhaar Back</span>
                {app.aadharBack ? (
                  <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 h-28">
                    <img
                      src={app.aadharBack}
                      alt="Aadhaar Back"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <a
                      href={app.aadharBack}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-all flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 h-28 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-zinc-300">Not uploaded</span>
                  </div>
                )}
              </div>

              {/* PAN Card */}
              <div className="col-span-2 space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">PAN Card Image</span>
                {app.panCardImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 h-32">
                    <img
                      src={app.panCardImage}
                      alt="PAN Card"
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <a
                      href={app.panCardImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-all flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 h-32 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-zinc-300">Not uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer — fixed */}
        <div className="px-8 pb-8 pt-2 flex-shrink-0 space-y-3">
          {/* KYC Status Badge */}
          <div className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-black text-center",
            app.status === "Pending" && "bg-amber-50 text-amber-600 border border-amber-100",
            app.status === "Approved" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
            app.status === "Rejected" && "bg-rose-50 text-rose-600 border border-rose-100"
          )}>
            Current Status: {app.status}
          </div>

          {/* Action Buttons — only show for pending applications */}
          {app.status === "Pending" && (
            <div className="flex gap-4">
              <button
                onClick={() => handleReject(appId)}
                className="flex-1 py-3.5 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all text-rose-500 text-xs font-black tracking-tight flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" /> Reject Vendor
              </button>
              <button
                onClick={() => handleApprove(appId)}
                className="flex-1 py-3.5 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-950/20 transition-all text-xs font-black tracking-tight flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Approve Vendor
              </button>
            </div>
          )}

          {/* Closed application notice */}
          {app.status !== "Pending" && (
            <p className="text-[10px] text-center text-zinc-400 font-semibold">
              This application has been {app.status.toLowerCase()}. No further action is required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
