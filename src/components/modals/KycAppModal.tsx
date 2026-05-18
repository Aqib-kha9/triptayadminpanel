import React from "react";
import { X, Check, AlertCircle } from "lucide-react";
import type { HostApplication } from "../../types";

interface KycAppModalProps {
  selectedKycApp: HostApplication | null;
  setSelectedKycApp: (app: HostApplication | null) => void;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}

export const KycAppModal: React.FC<KycAppModalProps> = ({
  selectedKycApp,
  setSelectedKycApp,
  handleApprove,
  handleReject
}) => {
  if (!selectedKycApp) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] max-w-lg w-full p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Close button */}
        <button 
          onClick={() => setSelectedKycApp(null)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[9px] font-black text-zinc-950 bg-zinc-950/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
            KYC Identity Document Review
          </span>
          <h3 className="text-lg font-black text-zinc-900 leading-tight">Review Application {selectedKycApp.id}</h3>
          <p className="text-xs text-zinc-400 font-semibold">Verify pan card numbers and bank ledger splits</p>
        </div>

        {/* Content details */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          
          {/* Identity */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase">Host Identity Details</h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">Host Registrant:</span>
                <span className="text-zinc-950">{selectedKycApp.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Registered Email:</span>
                <span className="text-zinc-950 font-mono">{selectedKycApp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Contact Number:</span>
                <span className="text-zinc-950">{selectedKycApp.phone}</span>
              </div>
            </div>
          </div>

          {/* Property listings expectations */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase">Stay / Experience Details</h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">Listing Name:</span>
                <span className="text-zinc-950 truncate max-w-[200px]">{selectedKycApp.property}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Region:</span>
                <span className="text-zinc-950">{selectedKycApp.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Listing pricing base:</span>
                <span className="text-zinc-950 font-extrabold text-emerald-600">₹{selectedKycApp.priceExpected.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Legal document mandates */}
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase">Legal Document Mandates</h4>
            <div className="text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="text-zinc-400">PAN Number:</span>
                <span className="text-zinc-950 font-mono">{selectedKycApp.panNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">GSTIN Registry:</span>
                <span className="text-zinc-950 font-mono text-blue-600">{selectedKycApp.gstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Bank mandate account:</span>
                <span className="text-zinc-950 font-mono text-zinc-600 truncate max-w-[200px]">{selectedKycApp.bankAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Bank IFSC code:</span>
                <span className="text-zinc-950 font-mono">{selectedKycApp.bankIFSC}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Buttons actions */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={() => handleReject(selectedKycApp.id)}
            className="flex-1 py-3.5 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all text-rose-500 text-xs font-black tracking-tight flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4" /> Reject Host
          </button>
          <button
            onClick={() => handleApprove(selectedKycApp.id)}
            className="flex-1 py-3.5 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-950/20 transition-all text-xs font-black tracking-tight flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Approve Host
          </button>
        </div>
      </div>
    </div>
  );
};
