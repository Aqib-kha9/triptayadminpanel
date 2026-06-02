import React, { useState, useEffect } from "react";
import { X, User, Save } from "lucide-react";
import type { PlatformUser } from "../../types";

interface EditUserModalProps {
  user: PlatformUser | null;
  onClose: () => void;
  onSave: (updatedUser: PlatformUser) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSave
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"Guest" | "Vendor" | "Dual Mode">("Guest");
  const [status, setStatus] = useState<"Active" | "Blocked">("Active");
  const [walletBalance, setWalletBalance] = useState(0);

  // KYC and Bank Credentials
  const [panNumber, setPanNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [kycStatus, setKycStatus] = useState<"Pending" | "Approved" | "Rejected" | "Not Submitted">("Not Submitted");

  // Sync state with selected user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setRole(user.role);
      setStatus(user.status);
      setWalletBalance(user.walletBalance);
      setPanNumber(user.panNumber || "");
      setGstin(user.gstin || "");
      setBankAccount(user.bankAccount || "");
      setBankIFSC(user.bankIFSC || "");
      setKycStatus(user.kycStatus || "Not Submitted");
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlatformUser = {
      ...user,
      name,
      email,
      phone,
      role,
      status,
      walletBalance: Number(walletBalance),
      panNumber: panNumber.trim() || undefined,
      gstin: gstin.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      bankIFSC: bankIFSC.trim() || undefined,
      kycStatus
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-zinc-100 shadow-2xl rounded-[36px] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">
              Edit User & Verification Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Core Credentials */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Personal Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Contact Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Section 2: Roles, Status & Ledger balances */}
          <div className="border-t border-zinc-100 pt-4 space-y-4">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Access Control & Wallet Ledger</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Security Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none"
                >
                  <option value="Guest">Guest (Customer)</option>
                  <option value="Vendor">Vendor (Host / Guide)</option>
                  <option value="Dual Mode">Dual Mode (Flexible)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none"
                >
                  <option value="Active">Active Account</option>
                  <option value="Blocked">Blocked Account</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Wallet Balance (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Compliance KYC Documents & Settlements bank details */}
          <div className="border-t border-zinc-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Compliance & Bank Settlement Details</h4>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                kycStatus === "Approved" 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : kycStatus === "Pending"
                    ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse"
                    : kycStatus === "Rejected"
                      ? "bg-rose-50 text-rose-500 border-rose-100"
                      : "bg-zinc-50 text-zinc-500 border-zinc-200"
              }`}>
                KYC: {kycStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">PAN Card Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">GSTIN Registration</label>
                <input
                  type="text"
                  placeholder="02ABCDE1234F1Z4"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">Settlement Bank Account Details</label>
                <input
                  type="text"
                  placeholder="987654321098 (SBI Bank)"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500">IFSC Verification Code</label>
                <input
                  type="text"
                  placeholder="SBIN0001234"
                  value={bankIFSC}
                  onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* KYC Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Revise KYC Status</label>
              <select
                value={kycStatus}
                onChange={(e) => setKycStatus(e.target.value as any)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none"
              >
                <option value="Not Submitted">Not Submitted</option>
                <option value="Pending">Pending Audit Check</option>
                <option value="Approved">Approved / Onboarded</option>
                <option value="Rejected">Rejected Compliance Failures</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-primary to-rose-500 text-white rounded-xl text-xs font-black tracking-tight hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              <Save className="w-4 h-4" /> Save User Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-zinc-500 rounded-xl text-xs font-black tracking-tight transition-all"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
