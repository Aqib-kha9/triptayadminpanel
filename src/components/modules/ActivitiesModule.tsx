import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    Filter,
    Eye,
    CheckCircle,
    FileText,
    XCircle,
    ShieldCheck,
    ShieldOff,
    MapPin,
    Star,
    IndianRupee,
    Loader2,
    AlertTriangle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Clock,
    Dumbbell,
    Compass,
} from "lucide-react";
import type { AuditLog } from "../../types";

// ──────────────────────── Constants ────────────────────────

const API_BASE = ""; // Vite proxy forwards /api → backend
const PAGE_SIZE = 10;

const STATUS_TABS = [
    { key: "", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Draft" },
    { key: "rejected", label: "Rejected" },
    { key: "unlisted", label: "Unlisted" },
] as const;

// ──────────────────────── Types ────────────────────────

interface ActivityHost {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
}

interface ActivityItem {
    _id: string;
    name: string;
    slug: string;
    activityType: string;
    difficulty: string;
    durationHours: number;
    durationDays: number;
    city: string;
    state: string;
    country: string;
    basePrice: number;
    childPrice?: number;
    foreignerPrice?: number;
    avgRating: number;
    totalReviews: number;
    status: "draft" | "published" | "unlisted" | "rejected";
    isActive: boolean;
    isFeatured: boolean;
    adminNotes?: string;
    maxGroupSize: number;
    minAge: number;
    media: { url: string; isCover: boolean; type: string; order: number }[];
    host: ActivityHost;
    createdAt: string;
}

interface PaginationMeta {
    page: number;
    totalPages: number;
    total: number;
    results: number;
}

// ──────────────────────── Props ────────────────────────

interface ActivitiesModuleProps {
    setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

// ──────────────────────── Helpers ────────────────────────

function getCoverUrl(item: ActivityItem): string | null {
    if (!item.media || item.media.length === 0) return null;
    const cover = item.media.find((m) => m.isCover);
    if (cover) return cover.url;
    const sorted = [...item.media].sort((a, b) => a.order - b.order);
    return sorted[0].url;
}

function formatNumber(n: number): string {
    return n.toLocaleString("en-IN");
}

function getStatusBadgeClass(status: string, isActive: boolean): string {
    switch (status) {
        case "published":
            return "bg-emerald-50 border-emerald-100 text-emerald-700";
        case "draft":
            return "bg-amber-50 border-amber-100 text-amber-700";
        case "rejected":
            return "bg-red-50 border-red-100 text-red-600";
        case "unlisted":
            return isActive
                ? "bg-purple-50 border-purple-100 text-purple-600"
                : "bg-zinc-100 border-zinc-200 text-zinc-500";
        default:
            return "bg-zinc-50 border-zinc-100 text-zinc-500";
    }
}

function getStatusLabel(item: ActivityItem): string {
    if (!item.isActive && item.status !== "unlisted") return item.status.charAt(0).toUpperCase() + item.status.slice(1);
    if (item.status === "unlisted") return item.isActive ? "Unlisted" : "Suspended";
    return item.status.charAt(0).toUpperCase() + item.status.slice(1);
}

function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case "Easy":
            return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "Moderate":
            return "bg-amber-50 text-amber-600 border-amber-100";
        case "Challenging":
            return "bg-orange-50 text-orange-600 border-orange-100";
        case "Extreme":
            return "bg-red-50 text-red-600 border-red-100";
        default:
            return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
}

// ──────────────────────── Component ────────────────────────

export const ActivitiesModule: React.FC<ActivitiesModuleProps> = ({ setAudits }) => {
    const navigate = useNavigate();

    // State
    const [activities, setActivities] = useState<ActivityItem[]>([]);
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
    const fetchActivities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));
            if (search.trim()) params.set("search", search.trim());
            if (statusFilter) params.set("status", statusFilter);

            const res = await fetch(`${API_BASE}/api/admin/activities?${params}`, {
                credentials: "include",
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `HTTP ${res.status}`);
            }
            const json = await res.json();
            setActivities(json.data.activities);
            setMeta({
                page: json.page,
                totalPages: json.totalPages,
                total: json.total,
                results: json.results,
            });
        } catch (err: any) {
            setError(err.message || "Failed to load activities.");
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // ── Debounced Search ──
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPage(1);
        }, 400);
    };

    // When page changes, fetch
    useEffect(() => {
        fetchActivities();
    }, [page]);

    // ── Toggle Status (Suspend / Activate) ──
    const handleToggleStatus = async (item: ActivityItem) => {
        const action = item.isActive ? "suspend" : "activate";
        const previousState = { ...item };
        setTogglingId(item._id);

        // Optimistic
        setActivities((prev) =>
            prev.map((a) =>
                a._id === item._id
                    ? { ...a, isActive: !a.isActive, status: !a.isActive ? a.status : "unlisted" }
                    : a
            )
        );

        try {
            const res = await fetch(
                `${API_BASE}/api/admin/activities/${item._id}/toggle-status`,
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
                    event: action === "suspend" ? "Suspended activity" : "Activated activity",
                    status: "Success" as const,
                },
                ...logs,
            ]);
        } catch {
            // Rollback
            setActivities((prev) =>
                prev.map((a) => (a._id === item._id ? previousState : a))
            );
        } finally {
            setTogglingId(null);
        }
    };

    // ── Change Status (Publish / Draft / Reject) ──
    const handleChangeStatus = async (item: ActivityItem, newStatus: "published" | "draft" | "rejected") => {
        const previousState = { ...item };
        setChangingStatusId(item._id);

        // Optimistic
        setActivities((prev) =>
            prev.map((a) =>
                a._id === item._id
                    ? {
                        ...a,
                        status: newStatus,
                        isActive: newStatus === "published",
                    }
                    : a
            )
        );

        try {
            const res = await fetch(
                `${API_BASE}/api/admin/activities/${item._id}/change-status`,
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
                    event: `Changed activity status to "${newStatus}"`,
                    status: "Success" as const,
                },
                ...logs,
            ]);
        } catch (err: any) {
            // Rollback
            console.error("[change-status] Failed:", err.message || err);
            setActivities((prev) =>
                prev.map((a) => (a._id === item._id ? previousState : a))
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
                        Activities Management
                    </h1>
                    <p className="text-xs font-bold text-zinc-400 mt-1">
                        View, search, and moderate all vendor-created activity listings
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white rounded-xl border border-zinc-100 px-4 py-2.5 shadow-sm">
                    <Compass className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                        {meta.total.toLocaleString("en-IN")} total activit
                        {meta.total !== 1 ? "ies" : "y"}
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
            {loading && activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="w-8 h-8 text-primary/50" />
                    </motion.div>
                    <p className="text-xs font-bold text-zinc-400">Loading activities...</p>
                </div>
            ) : error && activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-sm font-bold text-zinc-700">Failed to load activities</p>
                    <p className="text-xs text-zinc-400">{error}</p>
                    <button
                        onClick={fetchActivities}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                    </button>
                </div>
            ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                        <Compass className="w-6 h-6 text-zinc-300" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500">No activities found</p>
                    <p className="text-xs text-zinc-400">
                        {search || statusFilter
                            ? "Try adjusting your search or filter criteria."
                            : "No vendors have created activity listings yet."}
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
                                        <th className="py-4 px-5">Activity</th>
                                        <th className="py-4 px-5">Host</th>
                                        <th className="py-4 px-5">Type / Difficulty</th>
                                        <th className="py-4 px-5">Location</th>
                                        <th className="py-4 px-5">Duration</th>
                                        <th className="py-4 px-5">Price</th>
                                        <th className="py-4 px-5">Rating</th>
                                        <th className="py-4 px-5">Status</th>
                                        <th className="py-4 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                                    <AnimatePresence mode="popLayout">
                                        {activities.map((item) => (
                                            <motion.tr
                                                key={item._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-zinc-50/50 transition-colors"
                                            >
                                                {/* Activity Name + Image */}
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
                                                                    <Compass className="w-4 h-4 text-zinc-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5 min-w-0 max-w-[200px]">
                                                            <p className="text-xs font-black text-zinc-800 truncate">
                                                                {item.name}
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

                                                {/* Type + Difficulty */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">
                                                            <Dumbbell className="w-3 h-3" />
                                                            {item.activityType}
                                                        </span>
                                                        <br />
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${getDifficultyColor(item.difficulty)}`}>
                                                            {item.difficulty}
                                                        </span>
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

                                                {/* Duration */}
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                                        <Clock className="w-3 h-3" />
                                                        {item.durationDays > 0 ? (
                                                            <span>
                                                                {item.durationDays}d {item.durationHours}h
                                                            </span>
                                                        ) : (
                                                            <span>{item.durationHours}h</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-300 mt-0.5">
                                                        Max group: {item.maxGroupSize}
                                                    </p>
                                                </td>

                                                {/* Price */}
                                                <td className="py-4 px-5">
                                                    <span className="flex items-center gap-0.5 text-zinc-800 font-black">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {formatNumber(item.basePrice)}
                                                        <span className="text-[9px] font-medium text-zinc-400">
                                                            /person
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
                                                            onClick={() => navigate(`/activities/${item._id}`)}
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
                                    {meta.total.toLocaleString("en-IN")} activities
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
                    {loading && activities.length > 0 && (
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
                    {error && activities.length > 0 && (
                        <div className="flex items-center gap-2 justify-center py-4 text-xs text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {error}
                            <button
                                onClick={fetchActivities}
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