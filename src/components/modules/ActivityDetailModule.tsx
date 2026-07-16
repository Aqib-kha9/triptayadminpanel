import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Star,
    Users,
    IndianRupee,
    Loader2,
    AlertTriangle,
    ShieldOff,
    ShieldCheck,
    EyeOff,
    FileText,
    XCircle,
    CheckCircle,
    Clock,
    Dumbbell,
    Compass,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Shield,
    Info,
    AlertCircle,
} from "lucide-react";
import type { AuditLog } from "../../types";

// ──────────────────────── Types ────────────────────────

interface MediaItem {
    url: string;
    publicId: string;
    type: "photo" | "video";
    caption?: string;
    isCover: boolean;
    order: number;
}

interface HostInfo {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
    kycStatus: string;
}

interface NearbyPlace {
    name: string;
    distanceKm: number;
    category: string;
    description?: string;
}

interface HouseRule {
    rule: string;
    icon?: string;
}

interface SeasonalPrice {
    seasonName: string;
    startDate: string;
    endDate: string;
    pricePerPerson: number;
}

interface ActivityDetail {
    _id: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    host: HostInfo;
    activityType: string;
    difficulty: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark?: string;
    meetingPoint?: string;
    durationHours: number;
    durationDays: number;
    startTimes: string[];
    availability: string;
    availabilityNotes?: string;
    minAge: number;
    maxGroupSize: number;
    minGroupSize: number;
    basePrice: number;
    weekendPrice?: number;
    childPrice?: number;
    foreignerPrice?: number;
    seasonalPrices: SeasonalPrice[];
    taxes: number;
    securityDeposit: number;
    equipmentProvided: string[];
    equipmentRequired: string[];
    safetyGuidelines: string;
    hasInsurance: boolean;
    certifiedGuides: boolean;
    guideRatio?: string;
    included: string[];
    excluded: string[];
    houseRules: HouseRule[];
    cancellationPolicy: string;
    cancellationDetails?: string;
    isPetFriendly: boolean;
    petRules?: string;
    restrictions?: string;
    nearbyPlaces: NearbyPlace[];
    media: MediaItem[];
    videoTourUrl?: string;
    instantBook: boolean;
    advanceNoticeHours: number;
    maxGuestsPerBooking: number;
    status: "draft" | "published" | "unlisted" | "rejected";
    isActive: boolean;
    isFeatured: boolean;
    adminNotes?: string;
    avgRating: number;
    totalReviews: number;
    languagesSpoken: string[];
    createdAt: string;
    updatedAt: string;
}

// ──────────────────────── Constants ────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    draft: { label: "Draft", className: "bg-amber-50 text-amber-700 border-amber-100", icon: <FileText className="w-3.5 h-3.5" /> },
    unlisted: { label: "Suspended", className: "bg-red-50 text-red-700 border-red-100", icon: <EyeOff className="w-3.5 h-3.5" /> },
    rejected: { label: "Rejected", className: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const DIFFICULTY_CONFIG: Record<string, { className: string }> = {
    Easy: { className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    Moderate: { className: "bg-amber-50 text-amber-600 border-amber-100" },
    Challenging: { className: "bg-orange-50 text-orange-600 border-orange-100" },
    Extreme: { className: "bg-red-50 text-red-600 border-red-100" },
};

// ──────────────────────── Props ────────────────────────

interface ActivityDetailModuleProps {
    setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

// ──────────────────────── Helpers ────────────────────────

function formatPrice(price: number): string {
    return `₹${price.toLocaleString("en-IN")}`;
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getCoverUrl(activity: ActivityDetail): string | null {
    const cover = activity.media.find((m) => m.isCover);
    if (cover) return cover.url;
    if (activity.media.length > 0) return activity.media[0].url;
    return null;
}

// ──────────────────────── Component ────────────────────────

export const ActivityDetailModule: React.FC<ActivityDetailModuleProps> = ({ setAudits }) => {
    const { activityId } = useParams<{ activityId: string }>();
    const navigate = useNavigate();

    const [activity, setActivity] = useState<ActivityDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // ── Fetch detail ──

    const fetchDetail = useCallback(async () => {
        if (!activityId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok || json.status === "fail") {
                throw new Error(json.message || "Failed to load activity.");
            }
            const data = json.data.activity as ActivityDetail;
            setActivity(data);
            setAdminNotes(data.adminNotes || "");
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // ── Change status (publish / draft / reject) ──

    const handleChangeStatus = async (newStatus: "published" | "draft" | "rejected") => {
        if (!activity) return;
        setActionLoading(newStatus);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/activities/${activity._id}/change-status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ status: newStatus, adminNotes: adminNotes || undefined }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to change status.");

            setActivity((prev) =>
                prev
                    ? { ...prev, status: newStatus, isActive: newStatus === "published", adminNotes: adminNotes || undefined }
                    : prev
            );

            const statusLabels: Record<string, string> = {
                published: "Published",
                draft: "Moved to Draft",
                rejected: "Rejected",
            };
            setAudits((logs) => [
                {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "System",
                    event: `Activity "${activity.name}" status changed to ${statusLabels[newStatus]}`,
                    status: "Success",
                },
                ...logs,
            ]);
        } catch (err: any) {
            setAudits((logs) => [
                {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "System",
                    event: `Failed to change activity "${activity.name}" status: ${err.message}`,
                    status: "Failed",
                },
                ...logs,
            ]);
        } finally {
            setActionLoading(null);
        }
    };

    // ── Toggle active (suspend / activate) ──

    const handleToggleActive = async () => {
        if (!activity) return;
        const action = activity.isActive ? "suspend" : "activate";
        setActionLoading(action);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/activities/${activity._id}/toggle-status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ action }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || `Failed to ${action}.`);

            setActivity((prev) =>
                prev
                    ? {
                        ...prev,
                        isActive: action === "activate",
                        status: action === "suspend" ? "unlisted" : "published",
                    }
                    : prev
            );

            setAudits((logs) => [
                {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "System",
                    event: `Activity "${activity.name}" ${action === "suspend" ? "suspended" : "activated"}`,
                    status: "Success",
                },
                ...logs,
            ]);
        } catch (err: any) {
            setAudits((logs) => [
                {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "System",
                    event: `Failed to ${action} activity "${activity.name}": ${err.message}`,
                    status: "Failed",
                },
                ...logs,
            ]);
        } finally {
            setActionLoading(null);
        }
    };

    // ── Loading State ──

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <Loader2 className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-xs font-bold text-zinc-400">Loading activity details…</p>
            </div>
        );
    }

    // ── Error State ──

    if (error || !activity) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p className="text-sm font-bold text-zinc-600">{error || "Activity not found."}</p>
                <button
                    onClick={() => navigate("/activities")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-black hover:bg-zinc-700 transition-all"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Activities
                </button>
            </div>
        );
    }

    const coverUrl = getCoverUrl(activity);
    const statusCfg = STATUS_CONFIG[activity.status] || STATUS_CONFIG.draft;
    const difficultyCfg = DIFFICULTY_CONFIG[activity.difficulty] || DIFFICULTY_CONFIG.Moderate;
    const allMedia = activity.media.sort((a, b) => a.order - b.order);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-6 pb-12"
        >
            {/* ── Back Button ── */}
            <button
                onClick={() => navigate("/activities")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Activities List
            </button>

            {/* ── Header Card ── */}
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                {/* Cover Image */}
                {coverUrl && (
                    <div className="relative h-64 sm:h-80 bg-zinc-100">
                        <img
                            src={coverUrl}
                            alt={activity.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">{activity.name}</h1>
                                <p className="text-sm font-bold text-white/80 flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {activity.city}, {activity.state}, {activity.country}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border ${statusCfg.className}`}>
                                {statusCfg.icon}
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>
                )}

                {!coverUrl && (
                    <div className="p-6 border-b border-zinc-50">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-zinc-900">{activity.name}</h1>
                                <p className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {activity.city}, {activity.state}, {activity.country}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border ${statusCfg.className}`}>
                                {statusCfg.icon}
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-50 border-t border-zinc-50">
                    <div className="p-4 text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Activity Type</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{activity.activityType}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border mt-1 ${difficultyCfg.className}`}>
                            {activity.difficulty}
                        </span>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Base Price</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{formatPrice(activity.basePrice)}</p>
                        <p className="text-[10px] text-zinc-400">per person</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Rating</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5 flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {activity.avgRating > 0 ? activity.avgRating.toFixed(1) : "—"}
                        </p>
                        <p className="text-[10px] text-zinc-400">{activity.totalReviews} reviews</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Created</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{formatDate(activity.createdAt)}</p>
                        <p className="text-[10px] text-zinc-400">Updated {formatDate(activity.updatedAt)}</p>
                    </div>
                </div>
            </div>

            {/* ── Two-Column Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary + Description */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">About this Activity</h2>
                        <p className="text-sm font-bold text-zinc-700 leading-relaxed">{activity.summary}</p>
                        <div className="border-t border-zinc-50 pt-4">
                            <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
                        </div>
                    </div>

                    {/* Activity Details Grid */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Activity Details</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2.5">
                                <Dumbbell className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Type</p>
                                    <p className="text-sm font-black text-zinc-900">{activity.activityType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Compass className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Difficulty</p>
                                    <p className="text-sm font-black text-zinc-900">{activity.difficulty}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Users className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Group Size</p>
                                    <p className="text-sm font-black text-zinc-900">{activity.minGroupSize}–{activity.maxGroupSize}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Duration</p>
                                    <p className="text-sm font-black text-zinc-900">
                                        {activity.durationDays > 0 ? `${activity.durationDays}d ` : ""}{activity.durationHours}h
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Availability</p>
                                    <p className="text-sm font-black text-zinc-900">{activity.availability}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Min Age</p>
                                    <p className="text-sm font-black text-zinc-900">{activity.minAge}+ years</p>
                                </div>
                            </div>
                        </div>

                        {/* Start Times */}
                        {activity.startTimes.length > 0 && (
                            <div className="border-t border-zinc-50 pt-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Start Times</p>
                                <div className="flex flex-wrap gap-2">
                                    {activity.startTimes.map((t, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600"
                                        >
                                            <Clock className="w-3 h-3" />
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Address */}
                        <div className="border-t border-zinc-50 pt-4">
                            <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Full Address</p>
                            <p className="text-xs font-bold text-zinc-600">
                                {activity.address}, {activity.city}, {activity.state}, {activity.zipCode}, {activity.country}
                            </p>
                            {activity.landmark && (
                                <p className="text-[10px] text-zinc-400 mt-1">Landmark: {activity.landmark}</p>
                            )}
                        </div>

                        {/* Meeting Point */}
                        {activity.meetingPoint && (
                            <div className="border-t border-zinc-50 pt-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Meeting Point</p>
                                <p className="text-xs font-bold text-zinc-600">{activity.meetingPoint}</p>
                            </div>
                        )}

                        {/* Restrictions */}
                        {activity.restrictions && (
                            <div className="border-t border-zinc-50 pt-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Restrictions</p>
                                <p className="text-xs font-bold text-zinc-600">{activity.restrictions}</p>
                            </div>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Pricing (per person)</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Base Price</p>
                                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {activity.basePrice.toLocaleString("en-IN")}
                                </p>
                            </div>
                            {activity.weekendPrice != null && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Weekend Price</p>
                                    <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {activity.weekendPrice.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                            {activity.childPrice != null && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Child Price</p>
                                    <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {activity.childPrice.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                            {activity.foreignerPrice != null && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Foreigner Price</p>
                                    <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {activity.foreignerPrice.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Security Deposit</p>
                                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {activity.securityDeposit.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Taxes</p>
                                <p className="text-sm font-black text-zinc-900">{activity.taxes}%</p>
                            </div>
                        </div>

                        {/* Seasonal Prices */}
                        {activity.seasonalPrices.length > 0 && (
                            <div className="border-t border-zinc-50 pt-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">Seasonal Pricing</p>
                                <div className="space-y-2">
                                    {activity.seasonalPrices.map((sp: any, i) => {
                                        const fromVal = sp.from || sp.startDate || "";
                                        const toVal = sp.to || sp.endDate || "";
                                        const priceVal = sp.price ?? sp.pricePerPerson ?? 0;

                                        return (
                                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 text-xs font-bold">
                                                <div>
                                                    <span className="text-zinc-700">{sp.seasonName}</span>
                                                    <span className="text-[10px] text-zinc-400 ml-2">
                                                        {formatDate(fromVal)} – {formatDate(toVal)}
                                                    </span>
                                                </div>
                                                <span className="text-zinc-900 flex items-center gap-0.5">
                                                    <IndianRupee className="w-3 h-3" />
                                                    {Number(priceVal).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Equipment */}
                    {(activity.equipmentProvided.length > 0 || activity.equipmentRequired.length > 0) && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Equipment</h2>
                            {activity.equipmentProvided.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Provided by Vendor</p>
                                    <div className="flex flex-wrap gap-2">
                                        {activity.equipmentProvided.map((eq, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activity.equipmentRequired.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Guest Must Bring</p>
                                    <div className="flex flex-wrap gap-2">
                                        {activity.equipmentRequired.map((eq, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700"
                                            >
                                                <AlertCircle className="w-3 h-3" />
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Safety */}
                    {(activity.safetyGuidelines || activity.hasInsurance || activity.certifiedGuides || activity.guideRatio) && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Safety & Guides</h2>
                            {activity.safetyGuidelines && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Safety Guidelines</p>
                                    <p className="text-xs font-bold text-zinc-600 whitespace-pre-wrap">{activity.safetyGuidelines}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-50">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50">
                                    <Shield className={`w-4 h-4 ${activity.hasInsurance ? "text-emerald-500" : "text-zinc-300"}`} />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">Insurance</p>
                                        <p className="text-xs font-bold text-zinc-700">{activity.hasInsurance ? "Covered" : "Not covered"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50">
                                    <Users className={`w-4 h-4 ${activity.certifiedGuides ? "text-emerald-500" : "text-zinc-300"}`} />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">Certified Guides</p>
                                        <p className="text-xs font-bold text-zinc-700">{activity.certifiedGuides ? "Yes" : "No"}</p>
                                    </div>
                                </div>
                                {activity.guideRatio && (
                                    <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-zinc-50">
                                        <Info className="w-4 h-4 text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase">Guide Ratio</p>
                                            <p className="text-xs font-bold text-zinc-700">{activity.guideRatio}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Inclusions & Exclusions */}
                    {(activity.included.length > 0 || activity.excluded.length > 0) && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inclusions & Exclusions</h2>
                            {activity.included.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Included</p>
                                    <div className="space-y-1.5">
                                        {activity.included.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activity.excluded.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-red-500 uppercase mb-2">Excluded</p>
                                    <div className="space-y-1.5">
                                        {activity.excluded.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                                                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* House Rules */}
                    {activity.houseRules.length > 0 && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Rules & Policies</h2>
                            <div className="space-y-2">
                                {activity.houseRules.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                        {r.rule}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 pt-2 border-t border-zinc-50">
                                <span>Pets: {activity.isPetFriendly ? "Allowed" : "Not Allowed"}</span>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-500">
                                Cancellation: <span className="text-zinc-700">{activity.cancellationPolicy}</span>
                                {activity.cancellationDetails && ` — ${activity.cancellationDetails}`}
                            </p>
                            {activity.petRules && (
                                <p className="text-[10px] font-bold text-zinc-500">
                                    Pet Rules: <span className="text-zinc-600">{activity.petRules}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Media Gallery */}
                    {allMedia.length > 0 && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                                Media ({allMedia.length} items)
                            </h2>
                            <div className="relative">
                                <div className="overflow-hidden rounded-xl bg-zinc-100 h-64 sm:h-80">
                                    <img
                                        src={allMedia[currentMediaIndex]?.url}
                                        alt={allMedia[currentMediaIndex]?.caption || `Media ${currentMediaIndex + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {allMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-zinc-700" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4 text-zinc-700" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {allMedia.map((m, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentMediaIndex(idx)}
                                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentMediaIndex ? "border-primary ring-2 ring-primary/20" : "border-zinc-100 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                                        {m.isCover && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[8px] font-black text-center py-0.5">
                                                COVER
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nearby Places */}
                    {activity.nearbyPlaces.length > 0 && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Nearby Places</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {activity.nearbyPlaces.map((np, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 text-xs font-bold">
                                        <span className="text-zinc-700">{np.name}</span>
                                        <span className="text-zinc-400 text-[10px]">{np.distanceKm} km · {np.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar — Host Info + Status Controls */}
                <div className="space-y-6">
                    {/* Host Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Host</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-rose-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                                {activity.host?.avatar ? (
                                    <img src={activity.host.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    activity.host?.name?.charAt(0)?.toUpperCase() || "H"
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-black text-zinc-900">{activity.host?.name || "Unknown Host"}</p>
                                <p className="text-[10px] font-bold text-zinc-400">{activity.host?.email || "—"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Role</span>
                                <p className="text-zinc-700">{activity.host?.role || "—"}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">KYC</span>
                                <p className={`${activity.host?.kycStatus === "Approved" ? "text-emerald-600" : "text-amber-600"}`}>
                                    {activity.host?.kycStatus || "—"}
                                </p>
                            </div>
                            <div className="col-span-2 p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Phone</span>
                                <p className="text-zinc-700">{activity.host?.phone || "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Controls Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Status Management</h2>

                        {/* Current Status */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50">
                            <span className="text-[10px] font-black text-zinc-400 uppercase">Current Status</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${statusCfg.className}`}>
                                {statusCfg.icon}
                                {statusCfg.label}
                            </span>
                        </div>

                        {/* Active Toggle */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase">Visibility</p>
                            <button
                                onClick={handleToggleActive}
                                disabled={actionLoading === "suspend" || actionLoading === "activate"}
                                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${activity.isActive
                                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                    } disabled:opacity-50`}
                            >
                                {actionLoading === "suspend" || actionLoading === "activate" ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : activity.isActive ? (
                                    <ShieldOff className="w-3.5 h-3.5" />
                                ) : (
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                                {activity.isActive ? "Suspend Activity" : "Activate Activity"}
                            </button>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase">Change Publication Status</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleChangeStatus("published")}
                                    disabled={activity.status === "published" || actionLoading === "published"}
                                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === "published" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    <span className="text-[9px] font-black uppercase">Publish</span>
                                </button>
                                <button
                                    onClick={() => handleChangeStatus("draft")}
                                    disabled={activity.status === "draft" || actionLoading === "draft"}
                                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === "draft" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4" />
                                    )}
                                    <span className="text-[9px] font-black uppercase">Draft</span>
                                </button>
                                <button
                                    onClick={() => handleChangeStatus("rejected")}
                                    disabled={activity.status === "rejected" || actionLoading === "rejected"}
                                    className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === "rejected" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                    <span className="text-[9px] font-black uppercase">Reject</span>
                                </button>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase">Admin Notes</p>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes about this activity…"
                                rows={3}
                                className="w-full text-xs font-bold text-zinc-700 placeholder:text-zinc-300 border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                            <button
                                onClick={() => handleChangeStatus(activity.status as "published" | "draft" | "rejected")}
                                disabled={actionLoading !== null}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wide hover:bg-zinc-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                Save Notes
                            </button>
                        </div>
                    </div>

                    {/* Booking Settings */}
                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-3">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Booking Settings</h2>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Instant Book</span>
                                <p className="text-zinc-700">{activity.instantBook ? "Yes" : "No"}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Advance Notice</span>
                                <p className="text-zinc-700">{activity.advanceNoticeHours}h</p>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Max Per Booking</span>
                                <p className="text-zinc-700">{activity.maxGuestsPerBooking} guests</p>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-50">
                                <span className="text-zinc-400">Languages</span>
                                <p className="text-zinc-700">{activity.languagesSpoken.length > 0 ? activity.languagesSpoken.join(", ") : "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};