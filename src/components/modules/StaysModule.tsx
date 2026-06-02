import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Star,
  BedDouble,
  Users,
  IndianRupee,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
  Eye,
  CheckCircle,
  FileText,
  XCircle,
  Wifi,
  Car,
  Utensils,
  Waves,
  Filter,
  X,
} from "lucide-react";
import type { AuditLog } from "../../types";

// ──────────────────────── Types ────────────────────────

interface ListingHost {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface ListingItem {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  host: ListingHost | null;
  city: string;
  state: string;
  country: string;
  propertyType: string;
  basePrice: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  avgRating: number;
  totalReviews: number;
  status: "draft" | "published" | "unlisted" | "rejected";
  isActive: boolean;
  amenities?: string[];
  hasKitchen: boolean;
  isPetFriendly: boolean;
  parkingAvailable?: boolean;
  media: { url: string; isCover: boolean; type: string }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  results: number;
}

// ──────────────────────── Constants ────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "";
const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: "", label: "All Stays" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "unlisted", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
] as const;

function getCoverUrl(item: ListingItem): string | null {
  if (!item.media?.length) return null;
  const cover = item.media.find((m) => m.isCover);
  return cover?.url || item.media[0]?.url || null;
}

function getStatusBadgeClass(status: string, isActive: boolean): string {
  if (!isActive) return "bg-red-50 text-red-600 border-red-200";
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "draft":
      return "bg-amber-50 text-amber-600 border-amber-200";
    case "unlisted":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    case "rejected":
      return "bg-red-50 text-red-500 border-red-200";
    default:
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
  }
}

function getStatusLabel(item: ListingItem): string {
  if (!item.isActive) return "Suspended";
  return item.status.charAt(0).toUpperCase() + item.status.slice(1);
}

// ──────────────────────── Component ────────────────────────

interface StaysModuleProps {
  setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export const StaysModule: React.FC<StaysModuleProps> = ({ setAudits }) => {
  const navigate = useNavigate();

  // State
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, totalPages: 0, total: 0, results: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${API_BASE}/api/admin/listings?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setListings(json.data.listings);
      setMeta({
        page: json.page,
        totalPages: json.totalPages,
        total: json.total,
        results: json.results,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ── Debounced Search ──
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      // fetchListings picks up via the dependency change
    }, 400);
  };

  // When page changes, fetch
  useEffect(() => {
    fetchListings();
  }, [page]);

  // ── Toggle Status ──
  const handleToggleStatus = async (item: ListingItem) => {
    const action = item.isActive ? "suspend" : "activate";
    const previousState = { ...item };
    setTogglingId(item._id);

    // Optimistic
    setListings((prev) =>
      prev.map((l) =>
        l._id === item._id
          ? { ...l, isActive: !l.isActive, status: !l.isActive ? l.status : "unlisted" }
          : l
      )
    );

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/listings/${item._id}/toggle-status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      setAudits((logs) => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "System" as const,
          event: action === "suspend" ? "Suspended listing" : "Activated listing",
          status: "Success" as const,
        },
        ...logs,
      ]);
    } catch {
      // Rollback
      setListings((prev) =>
        prev.map((l) => (l._id === item._id ? previousState : l))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Change Status (Publish / Draft / Reject) ──
  const handleChangeStatus = async (item: ListingItem, newStatus: "published" | "draft" | "rejected") => {
    const previousState = { ...item };
    setChangingStatusId(item._id);

    // Optimistic
    setListings((prev) =>
      prev.map((l) =>
        l._id === item._id
          ? {
            ...l,
            status: newStatus,
            isActive: newStatus === "published",
          }
          : l
      )
    );

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/listings/${item._id}/change-status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      setAudits((logs) => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "System" as const,
          event: `Changed listing status to "${newStatus}"`,
          status: "Success" as const,
        },
        ...logs,
      ]);
    } catch (err: any) {
      // Rollback
      console.error("[change-status] Failed:", err.message || err);
      setListings((prev) =>
        prev.map((l) => (l._id === item._id ? previousState : l))
      );
      setError(
        `Failed to change status to "${newStatus}": ${err.message || err || "Unknown error"}`
      );
      setTimeout(() => setError(null), 6000);
    } finally {
      setChangingStatusId(null);
    }
  };

  // ── Render ──
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
            Stays Management
          </h1>
          <p className="text-xs font-bold text-zinc-400 mt-1">
            View, search, and moderate all vendor-created stay listings
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white rounded-xl border border-zinc-100 px-4 py-2.5 shadow-sm">
          <Home className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {meta.total.toLocaleString("en-IN")} total listing
            {meta.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, city, or state..."
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-zinc-100 shadow-sm flex-wrap">
          <Filter className="w-3.5 h-3.5 text-zinc-300 ml-2 mr-1 shrink-0" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${statusFilter === tab.key
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
      {loading && listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary/50" />
          </motion.div>
          <p className="text-xs font-bold text-zinc-400">Loading listings...</p>
        </div>
      ) : error && listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm font-bold text-zinc-700">Failed to load listings</p>
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={fetchListings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
            <Home className="w-6 h-6 text-zinc-300" />
          </div>
          <p className="text-sm font-bold text-zinc-500">No listings found</p>
          <p className="text-xs text-zinc-400">
            {search || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "No vendors have created stay listings yet."}
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
                    <th className="py-4 px-5">Stay</th>
                    <th className="py-4 px-5">Host</th>
                    <th className="py-4 px-5">Location</th>
                    <th className="py-4 px-5">Details</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5">Rating</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                  <AnimatePresence mode="popLayout">
                    {listings.map((item) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        {/* Stay Name + Image */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                              {getCoverUrl(item) ? (
                                <img
                                  src={getCoverUrl(item)!}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                  <Home className="w-4 h-4 text-zinc-300" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0 max-w-[200px]">
                              <p className="text-xs font-black text-zinc-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-bold text-zinc-400 truncate">
                                {item.propertyType}
                              </p>
                              <p className="text-[9px] font-medium text-zinc-300 truncate">
                                {item._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Host */}
                        <td className="py-4 px-5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-zinc-700">
                              {item.host?.name || "Unknown Host"}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-400 max-w-[160px] truncate">
                              {item.host?.email || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-5">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 text-zinc-300 mt-0.5 shrink-0" />
                            <span className="text-xs font-bold text-zinc-600 max-w-[140px]">
                              {item.city}, {item.state}
                            </span>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="flex items-center gap-1 text-zinc-500">
                              <BedDouble className="w-3 h-3" />
                              {item.bedrooms}
                            </span>
                            <span className="text-zinc-300">|</span>
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Users className="w-3 h-3" />
                              {item.maxGuests}
                            </span>
                            {item.amenities && item.amenities.length > 0 && (
                              <>
                                <span className="text-zinc-300">|</span>
                                <span className="flex items-center gap-1 text-zinc-400">
                                  {item.amenities.slice(0, 3).map((a) => (
                                    <span
                                      key={a}
                                      className="bg-zinc-50 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-5">
                          <span className="flex items-center gap-0.5 text-zinc-800 font-black">
                            <IndianRupee className="w-3 h-3" />
                            {item.basePrice.toLocaleString("en-IN")}
                            <span className="text-[9px] font-medium text-zinc-400">
                              /night
                            </span>
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-black text-zinc-700">
                              {item.avgRating || "—"}
                            </span>
                            <span className="text-[10px] text-zinc-300">
                              ({item.totalReviews})
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClass(
                              item.status,
                              item.isActive
                            )}`}
                          >
                            {item.isActive ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <ShieldOff className="w-3 h-3" />
                            )}
                            {getStatusLabel(item)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => navigate(`/stays/${item._id}`)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                            </button>

                            {/* Status Change Buttons */}
                            {item.status !== "published" && (
                              <button
                                onClick={() => handleChangeStatus(item, "published")}
                                disabled={changingStatusId === item._id}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 disabled:opacity-50"
                                title="Publish"
                              >
                                {changingStatusId === item._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </button>
                            )}
                            {item.status !== "draft" && (
                              <button
                                onClick={() => handleChangeStatus(item, "draft")}
                                disabled={changingStatusId === item._id}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 disabled:opacity-50"
                                title="Move to Draft"
                              >
                                {changingStatusId === item._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FileText className="w-3 h-3" />
                                )}
                              </button>
                            )}
                            {item.status !== "rejected" && (
                              <button
                                onClick={() => handleChangeStatus(item, "rejected")}
                                disabled={changingStatusId === item._id}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 disabled:opacity-50"
                                title="Reject"
                              >
                                {changingStatusId === item._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                              </button>
                            )}

                            {/* Suspend / Activate */}
                            <button
                              onClick={() => handleToggleStatus(item)}
                              disabled={togglingId === item._id || changingStatusId === item._id}
                              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${item.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                                } disabled:opacity-50`}
                              title={item.isActive ? "Suspend" : "Activate"}
                            >
                              {togglingId === item._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : item.isActive ? (
                                <ShieldOff className="w-3 h-3" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
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
                  Showing {(meta.page - 1) * PAGE_SIZE + 1}–{Math.min(meta.page * PAGE_SIZE, meta.total)} of{" "}
                  {meta.total.toLocaleString("en-IN")} listings
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
          {loading && listings.length > 0 && (
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
          {error && listings.length > 0 && (
            <div className="flex items-center gap-2 justify-center py-4 text-xs text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
              <button
                onClick={fetchListings}
                className="ml-2 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};