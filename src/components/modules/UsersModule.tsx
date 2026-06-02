import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Coins,
  AlertCircle,
  Search,
  X,
  Filter,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldBan,
  ShieldCheck,
  Eye,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "";
const PAGE_SIZE = 10;

// ── Types ──
interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "Guest" | "Vendor" | "Dual Mode" | "Admin";
  status: "Active" | "Blocked";
  walletBalance: number;
  kycStatus: "Pending" | "Approved" | "Rejected" | "Not Submitted";
  panNumber?: string;
  gstin?: string;
  bankAccount?: string;
  bankIFSC?: string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  results: number;
}

interface UsersModuleProps {
  setAudits: React.Dispatch<React.SetStateAction<any[]>>;
}

const ROLE_TABS = [
  { key: "", label: "All" },
  { key: "Guest", label: "Guest" },
  { key: "Vendor", label: "Vendor" },
  { key: "Dual Mode", label: "Dual Mode" },
];

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "Dual Mode":
      return "bg-purple-50 text-purple-600 border border-purple-100";
    case "Vendor":
      return "bg-blue-50 text-blue-600 border border-blue-100";
    case "Guest":
      return "bg-zinc-100 text-zinc-500";
    default:
      return "bg-zinc-100 text-zinc-500";
  }
}

function getStatusBadgeClass(status: string): string {
  return status === "Active"
    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
    : "bg-rose-50 text-rose-600 border-rose-100";
}

function getKycBadgeClass(kycStatus: string): string {
  switch (kycStatus) {
    case "Approved":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Pending":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "Rejected":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-zinc-50 text-zinc-400 border-zinc-100";
  }
}

export const UsersModule: React.FC<UsersModuleProps> = ({ setAudits }) => {
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, totalPages: 0, total: 0, results: 0 });
  const [_stats, set_stats] = useState({ totalUsers: 0, totalBlocked: 0, totalWalletBalance: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Award Coins modal state (inline)
  const [awardTarget, setAwardTarget] = useState<UserItem | null>(null);
  const [awardAmount, setAwardAmount] = useState(500);
  const [awardReason, setAwardReason] = useState("Sign-up Promotional Credit");
  const [awarding, setAwarding] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setUsers(json.data.users);
      setMeta({
        page: json.page,
        totalPages: json.totalPages,
        total: json.total,
        results: json.results,
      });
      // Compute stats from server response or fall back to client-side
      if (json.stats) {
        set_stats(json.stats);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Debounced Search ──
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, 400);
  };

  // ── Toggle Status (Block/Unblock) ──
  const handleToggleStatus = async (item: UserItem) => {
    const actionLabel = item.status === "Active" ? "block" : "unblock";
    const previousState = { ...item };
    setTogglingId(item._id);

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u._id === item._id
          ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" as "Active" | "Blocked" }
          : u
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${item._id}/toggle-status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      setAudits((logs: any[]) => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "System" as const,
          event: actionLabel === "block" ? "Blocked user" : "Unblocked user",
          status: "Success" as const,
          detail: `${item.name} (${item.email})`,
        },
        ...logs,
      ]);
    } catch {
      // Rollback
      setUsers((prev) =>
        prev.map((u) => (u._id === item._id ? previousState : u))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Award Coins ──
  const handleAwardCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTarget || awardAmount <= 0) return;

    const prevBalance = awardTarget.walletBalance;
    const target = awardTarget;
    setAwarding(true);

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u._id === target._id
          ? { ...u, walletBalance: u.walletBalance + awardAmount }
          : u
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${target._id}/wallet`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: awardAmount, reason: awardReason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      setAudits((logs: any[]) => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "Financial" as const,
          event: `Awarded ₹${awardAmount.toLocaleString("en-IN")} coins`,
          status: "Success" as const,
          detail: `${target.name} — ${awardReason}`,
        },
        ...logs,
      ]);

      setAwardTarget(null);
      setAwardAmount(500);
      setAwardReason("Sign-up Promotional Credit");
    } catch {
      // Rollback
      setUsers((prev) =>
        prev.map((u) =>
          u._id === target._id ? { ...u, walletBalance: prevBalance } : u
        )
      );
    } finally {
      setAwarding(false);
    }
  };

  // ── Navigate to detail ──
  const viewDetail = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Users & Wallet Management
          </h1>
          <p className="text-xs font-bold text-zinc-400 mt-1">
            View, search, block users, and manage wallet coins
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white rounded-xl border border-zinc-100 px-4 py-2.5 shadow-sm">
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {meta.total.toLocaleString("en-IN")} total user
            {meta.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Total Users</p>
            <h3 className="text-2xl font-black text-zinc-900">{meta.total.toLocaleString("en-IN")} Users</h3>
            <p className="text-[9px] text-blue-600 font-bold tracking-normal">Guest, Vendor & Dual Mode</p>
          </div>
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Total Wallet Balance</p>
            <h3 className="text-2xl font-black text-zinc-900">
              ₹{users.reduce((sum, u) => sum + (u.walletBalance || 0), 0).toLocaleString("en-IN")}
            </h3>
            <p className="text-[9px] text-emerald-600 font-bold tracking-normal">Redeemable by users</p>
          </div>
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Blocked Accounts</p>
            <h3 className="text-2xl font-black text-zinc-900">
              {users.filter((u) => u.status === "Blocked").length}
            </h3>
            <p className="text-[9px] text-rose-500 font-bold tracking-normal">Policy violations enforced</p>
          </div>
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Search + Role Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-100 bg-white text-xs font-bold text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-zinc-100 shadow-sm flex-wrap">
          <Filter className="w-3.5 h-3.5 text-zinc-300 ml-2 mr-1 shrink-0" />
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setRoleFilter(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${roleFilter === tab.key
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary/50" />
          </motion.div>
          <p className="text-xs font-bold text-zinc-400">Loading users...</p>
        </div>
      ) : error && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm font-bold text-zinc-700">Failed to load users</p>
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-zinc-300" />
          </div>
          <p className="text-sm font-bold text-zinc-500">No users found</p>
          <p className="text-xs text-zinc-400">
            {search || roleFilter
              ? "Try adjusting your search or filter criteria."
              : "No registered users in the system yet."}
          </p>
        </div>
      ) : (
        <>
          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400 uppercase">
                    <th className="py-4 px-5">User</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5">KYC</th>
                    <th className="py-4 px-5">Joined</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Wallet</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                  <AnimatePresence mode="popLayout">
                    {users.map((item) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        {/* User info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-black text-sm shrink-0 overflow-hidden">
                              {item.avatar ? (
                                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                (item.name || "U").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-950 font-extrabold truncate max-w-[180px]">{item.name}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold truncate max-w-[180px]">
                                {item.email}
                                {item.phone ? ` • ${item.phone}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          <span className={`text-[8px] font-black tracking-tight px-2 py-0.5 rounded ${getRoleBadgeClass(item.role)}`}>
                            {item.role}
                          </span>
                        </td>

                        {/* KYC */}
                        <td className="py-4 px-5">
                          <span className={`text-[8px] font-black tracking-tight px-2 py-0.5 rounded border ${getKycBadgeClass(item.kycStatus)}`}>
                            {item.kycStatus}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="py-4 px-5 text-zinc-400 whitespace-nowrap">
                          {item.createdAt ? formatDate(item.createdAt) : "—"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Wallet */}
                        <td className="py-4 px-5 text-zinc-900 font-black whitespace-nowrap">
                          ₹{(item.walletBalance || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail */}
                            <button
                              onClick={() => viewDetail(item._id)}
                              className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-all"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Award Coins */}
                            <button
                              onClick={() => setAwardTarget(item)}
                              className="p-2 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-500 hover:text-amber-600 transition-all"
                              title="Award coins"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock */}
                            <button
                              onClick={() => handleToggleStatus(item)}
                              disabled={togglingId === item._id}
                              className={`p-2 rounded-lg border transition-all disabled:opacity-50 ${item.status === "Active"
                                  ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white"
                                  : "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                }`}
                              title={item.status === "Active" ? "Block user" : "Unblock user"}
                            >
                              {togglingId === item._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : item.status === "Active" ? (
                                <ShieldBan className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-50">
                <p className="text-[10px] font-bold text-zinc-400">
                  Showing {(meta.page - 1) * PAGE_SIZE + 1}–
                  {Math.min(meta.page * PAGE_SIZE, meta.total)} of{" "}
                  {meta.total.toLocaleString("en-IN")} users
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page <= 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${p === meta.page
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={meta.page >= meta.totalPages}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Loading overlay for pagination / search changes with existing data ── */}
          {loading && users.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5 text-primary/50" />
              </motion.div>
            </div>
          )}

          {/* ── Inline error after data loaded ── */}
          {error && users.length > 0 && (
            <div className="flex items-center gap-2 justify-center py-4 text-xs text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
              <button
                onClick={fetchUsers}
                className="ml-2 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Award Coins Inline Modal ── */}
      <AnimatePresence>
        {awardTarget && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setAwardTarget(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-950 bg-zinc-950/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Loyalty & Wallet Coins
                </span>
                <h3 className="text-lg font-black text-zinc-900 leading-tight">Award Coins</h3>
                <p className="text-xs text-zinc-400 font-semibold">
                  Crediting: {awardTarget.name} • Current: ₹{(awardTarget.walletBalance || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <form onSubmit={handleAwardCoins} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(parseInt(e.target.value) || 0)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">Reason</label>
                  <select
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950 transition-colors"
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
                    onClick={() => setAwardTarget(null)}
                    className="flex-1 py-3 rounded-2xl border border-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={awarding || awardAmount <= 0}
                    className="flex-1 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black tracking-tight transition-colors disabled:opacity-50"
                  >
                    {awarding ? "Processing..." : "Award Coins"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
