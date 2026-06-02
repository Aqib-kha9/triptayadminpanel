import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Coins,
  Tag,
  Map,
  Database,
  Users,
  AlertTriangle,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  pendingApprovalsCount: number;
  pendingDisputesCount?: number;
  unreadChatsCount?: number;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Operations Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/" },
  { id: "approvals", label: "Host KYC Approvals", icon: <ShieldCheck className="w-4 h-4" />, path: "/approvals", badgeKey: "approvals" as const },
  { id: "users", label: "Users & Wallet Coins", icon: <Users className="w-4 h-4" />, path: "/users" },
  { id: "stays", label: "Stays Management", icon: <Home className="w-4 h-4" />, path: "/stays" },
  { id: "activities", label: "Activities Management", icon: <Compass className="w-4 h-4" />, path: "/activities" },
  { id: "financials", label: "GST & Ledger split", icon: <Coins className="w-4 h-4" />, path: "/financials" },
  { id: "disputes", label: "Dispute Tickets", icon: <AlertTriangle className="w-4 h-4" />, path: "/disputes", badgeKey: "disputes" as const },
  { id: "chats", label: "Support Chat Inbox", icon: <MessageSquare className="w-4 h-4" />, path: "/chats", badgeKey: "chats" as const },
  { id: "coupons", label: "Coupons & Campaigns", icon: <Tag className="w-4 h-4" />, path: "/coupons" },
  { id: "attractions", label: "Attractions CMS", icon: <Map className="w-4 h-4" />, path: "/attractions" },
  { id: "settings", label: "System Settings", icon: <Settings className="w-4 h-4" />, path: "/settings" },
  { id: "audits", label: "Queue & Audit Logs", icon: <Database className="w-4 h-4" />, path: "/audits" },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  pendingApprovalsCount,
  pendingDisputesCount = 0,
  unreadChatsCount = 0
}) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const adminInitials = admin?.name
    ? admin.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "AD";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getBadge = (badgeKey: string | undefined) => {
    if (badgeKey === "approvals") return pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined;
    if (badgeKey === "disputes") return pendingDisputesCount > 0 ? pendingDisputesCount : undefined;
    if (badgeKey === "chats") return unreadChatsCount > 0 ? unreadChatsCount : undefined;
    return undefined;
  };

  return (
    <aside className="w-72 bg-white border-r border-zinc-100 flex flex-col justify-between flex-shrink-0 z-10 shadow-sm">
      <div>
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-50">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-primary to-rose-500 text-white shadow-lg shadow-primary/30">
            <span className="text-2xl font-black italic">T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-zinc-900">Triptay</span>
              <span className="bg-primary/10 text-primary text-[8px] font-black tracking-tight px-1.5 py-0.5 rounded">Hub</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-normal">Operations Control Console</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const badge = getBadge("badgeKey" in item ? (item as typeof item & { badgeKey: string }).badgeKey : undefined);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black tracking-tight transition-all duration-300 ${isActive
                    ? "bg-gradient-to-r from-primary to-rose-500 text-white shadow-lg shadow-primary/25 scale-[1.02]"
                    : "text-zinc-500 hover:bg-primary/5 hover:text-primary"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {badge !== undefined && (
                  <span className="text-[9px] font-black rounded-full h-5 px-2 flex items-center justify-center min-w-5 bg-white text-primary">
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Superadmin Card Profile */}
      <div className="p-4 border-t border-zinc-50 bg-zinc-50/20 space-y-2">
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-primary/20">
            {adminInitials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-black text-zinc-900 truncate">
              {admin?.name || "Administrator"}
            </p>
            <p className="text-[9px] text-emerald-600 font-bold tracking-normal flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Admin
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-black text-zinc-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all duration-200 tracking-tight"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Console
        </button>
      </div>
    </aside>
  );
};
