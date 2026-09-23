import React from "react";
import { useLocation } from "react-router-dom";
import { RefreshCw, Menu } from "lucide-react";
import type { AuditLog } from "../types";

const TAB_TITLES: Record<string, string> = {
  "/": "Platform Operations",
  "/approvals": "Host KYC Approvals Board",
  "/users": "Platform Users & Coins Dashboard",
  "/listings": "Property & Activity Moderation",
  "/financials": "Settlement & Payout Ledger",
  "/disputes": "Dispute & Refund Arbitration",
  "/chats": "Support Chat Inbox",
  "/coupons": "Campaigns & Offer Center",
  "/attractions": "Nearby Tourist Hotspots",
  "/settings": "System & Security Settings",
  "/audits": "System Queues & Audit Logs",
};

interface HeaderProps {
  setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setAudits, onMenuToggle }) => {
  const location = useLocation();
  const title = TAB_TITLES[location.pathname] || "Triptay Hub Console";

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
    <header className="h-16 lg:h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only on mobile (below lg) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2.5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors text-zinc-500 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h2 className="text-base lg:text-lg font-black text-zinc-900 tracking-tight truncate">
          {title}
        </h2>
        <div className="h-4 w-px bg-zinc-200 hidden md:block" />
        <span className="text-[10px] lg:text-xs font-bold text-zinc-400 hidden md:block tracking-normal">Enterprise Console v1.3</span>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] lg:text-xs font-bold text-zinc-900 tracking-tight">Live Operations</p>
          <p className="text-[9px] lg:text-[10px] text-zinc-400 font-bold tracking-tight">Server: AWS Mumbai</p>
        </div>
        <button
          onClick={handleRefreshTelemetry}
          className="p-2 lg:p-2.5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors text-zinc-500"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
