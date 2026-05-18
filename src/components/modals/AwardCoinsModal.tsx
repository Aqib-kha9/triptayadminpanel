import React from "react";
import { X } from "lucide-react";
import type { PlatformUser } from "../../types";

interface AwardCoinsModalProps {
  selectedUserForCoins: PlatformUser | null;
  setSelectedUserForCoins: (user: PlatformUser | null) => void;
  awardAmount: number;
  setAwardAmount: (amount: number) => void;
  awardReason: string;
  setAwardReason: (reason: string) => void;
  handleAwardCoins: (e: React.FormEvent) => void;
}

export const AwardCoinsModal: React.FC<AwardCoinsModalProps> = ({
  selectedUserForCoins,
  setSelectedUserForCoins,
  awardAmount,
  setAwardAmount,
  awardReason,
  setAwardReason,
  handleAwardCoins
}) => {
  if (!selectedUserForCoins) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] max-w-sm w-full p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => setSelectedUserForCoins(null)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-[9px] font-black text-zinc-950 bg-zinc-950/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Loyalty & Wallet Coins Management
          </span>
          <h3 className="text-lg font-black text-zinc-900 leading-tight">Award Coins</h3>
          <p className="text-xs text-zinc-400 font-semibold">Crediting: {selectedUserForCoins.name}</p>
        </div>

        <form onSubmit={handleAwardCoins} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400">Award Coins Amount (₹)</label>
            <input 
              type="number"
              min="50"
              max="10000"
              value={awardAmount}
              onChange={e => setAwardAmount(parseInt(e.target.value))}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400">Reason / Description for Credit</label>
            <select
              value={awardReason}
              onChange={e => setAwardReason(e.target.value)}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            >
              <option value="Sign-up Promotional Credit">Sign-up Promotional Credit</option>
              <option value="Referral Reward Cashback">Referral Reward Cashback</option>
              <option value="Goodwill Compensation Refund">Goodwill Compensation Refund</option>
              <option value="Loyalty Campaign Bonus">Loyalty Campaign Bonus</option>
            </select>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={() => setSelectedUserForCoins(null)}
              className="flex-1 py-3 rounded-2xl border border-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black tracking-tight transition-colors"
            >
              Award Coins
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
