import React from "react";
import { RefreshCw } from "lucide-react";
import type { AuditLog } from "../types";

interface HeaderProps {
  activeTab: string;
  setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setAudits }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Platform Operations";
      case "approvals": return "Host KYC Approvals Board";
      case "users": return "Platform Users & Coins Dashboard";
      case "listings": return "Property & Activity Moderation";
      case "financials": return "Settlement & Payout Ledger";
      case "coupons": return "Campaigns & Offer Center";
      case "attractions": return "Nearby Tourist Hotspots";
      case "audits": return "System Queues & Audit Logs";
      default: return "Triptay Hub Console";
    }
  };

  const handleRefreshTelemetry = () => {
    setAudits(prev => [{
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "System",
      event: "Manual server health telemetry refresh requested.",
      status: "Success"
    }, ...prev]);
  };

  return (
    <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-8 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black text-zinc-900 tracking-tight">
          {getTabTitle()}
        </h2>
        <div className="h-4 w-px bg-zinc-200 hidden md:block" />
        <span className="text-xs font-bold text-zinc-400 hidden md:block tracking-normal">Enterprise Console v1.3</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-900 tracking-tight">Live Operations</p>
          <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Server: AWS Mumbai</p>
        </div>
        <button 
          onClick={handleRefreshTelemetry}
          className="p-2.5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors text-zinc-500"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
