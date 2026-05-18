import React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Coins,
  Tag,
  Map,
  Database,
  Users
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "approvals" | "listings" | "financials" | "coupons" | "attractions" | "audits" | "users";
  setActiveTab: (tab: any) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingApprovalsCount }) => {
  return (
    <aside className="w-72 bg-white border-r border-zinc-100 flex flex-col justify-between flex-shrink-0 z-10 shadow-sm">
      <div>
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-50">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-zinc-950 text-white shadow-lg shadow-zinc-950/20">
            <span className="text-2xl font-black italic">T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-zinc-900">Triptay</span>
              <span className="bg-zinc-950/10 text-zinc-950 text-[8px] font-black tracking-tight px-1.5 py-0.5 rounded">Hub</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-normal">Operations Control Console</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {[
            { id: "dashboard", label: "Operations Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "approvals", label: "Host KYC Approvals", icon: <ShieldCheck className="w-4 h-4" />, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
            { id: "users", label: "Users & Wallet Coins", icon: <Users className="w-4 h-4" /> },
            { id: "listings", label: "Moderate listings", icon: <Building2 className="w-4 h-4" /> },
            { id: "financials", label: "GST & Ledger split", icon: <Coins className="w-4 h-4" /> },
            { id: "coupons", label: "Coupons & Campaigns", icon: <Tag className="w-4 h-4" /> },
            { id: "attractions", label: "Attractions CMS", icon: <Map className="w-4 h-4" /> },
            { id: "audits", label: "Queue & Audit Logs", icon: <Database className="w-4 h-4" /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black tracking-tight transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/10 scale-[1.02]"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[9px] font-black rounded-full h-5 px-2 flex items-center justify-center min-w-5 ${
                  activeTab === item.id ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Superadmin Card Profile */}
      <div className="p-4 border-t border-zinc-50 bg-zinc-50/20">
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-black flex items-center justify-center text-sm shadow-md shadow-zinc-950/10">
            AQ
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-zinc-900 truncate">Aqib Khan</p>
            <p className="text-[9px] text-emerald-600 font-bold tracking-normal flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
