import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Shield,
    Wallet,
    Gift,
    ShieldBan,
    ShieldCheck,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Loader2,
    Building2,
    CreditCard,
    Landmark,
    Image as ImageIcon,
    Trash2,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Types ──
interface UserDetail {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    website?: string;
    role: "Guest" | "Vendor" | "Dual Mode" | "Admin";
    status: "Active" | "Blocked";
    walletBalance: number;
    panNumber?: string;
    gstin?: string;
    bankAccount?: string;
    bankIFSC?: string;
    kycStatus: "Pending" | "Approved" | "Rejected" | "Not Submitted";
    aadharFront?: string;
    aadharBack?: string;
    panCardImage?: string;
    createdAt: string;
    updatedAt: string;
}

interface UserDetailModuleProps {
    setAudits: React.Dispatch<React.SetStateAction<any[]>>;
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

function getKycIcon(kycStatus: string): React.ReactNode {
    switch (kycStatus) {
        case "Approved":
            return <CheckCircle2 className="w-3.5 h-3.5" />;
        case "Pending":
            return <Clock className="w-3.5 h-3.5" />;
        case "Rejected":
            return <XCircle className="w-3.5 h-3.5" />;
        default:
            return <FileText className="w-3.5 h-3.5" />;
    }
}

function maskBankAccount(account: string): string {
    if (!account) return "—";
    return "••••" + account.slice(-4);
}

export const UserDetailModule: React.FC<UserDetailModuleProps> = ({ setAudits }) => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggling, setToggling] = useState(false);

    // Award coins inline state
    const [awardAmount, setAwardAmount] = useState(500);
    const [awardReason, setAwardReason] = useState("Sign-up Promotional Credit");
    const [awarding, setAwarding] = useState(false);

    // Delete confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const deleteConfirmRef = React.useRef("");

    // ── Fetch ──
    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `HTTP ${res.status}`);
            }
            const json = await res.json();
            setUser(json.data.user);
        } catch (err: any) {
            setError(err.message || "Failed to load user details.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // ── Toggle Status ──
    const handleToggleStatus = async () => {
        if (!user) return;
        const actionLabel = user.status === "Active" ? "block" : "unblock";
        const previousStatus = user.status;
        setToggling(true);

        // Optimistic
        setUser((prev) =>
            prev ? { ...prev, status: prev.status === "Active" ? "Blocked" : "Active" } : prev
        );

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/users/${user._id}/toggle-status`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
                    detail: `${user.name} (${user.email})`,
                },
                ...logs,
            ]);
        } catch {
            setUser((prev) =>
                prev ? { ...prev, status: previousStatus } : prev
            );
        } finally {
            setToggling(false);
        }
    };

    // ── Award Coins ──
    const handleAwardCoins = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || awardAmount <= 0) return;

        const prevBalance = user.walletBalance;
        setAwarding(true);

        // Optimistic
        setUser((prev) =>
            prev ? { ...prev, walletBalance: prev.walletBalance + awardAmount } : prev
        );

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/users/${user._id}/wallet`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
                    detail: `${user.name} — ${awardReason}`,
                },
                ...logs,
            ]);

            setAwardAmount(500);
            setAwardReason("Sign-up Promotional Credit");
        } catch {
            setUser((prev) =>
                prev ? { ...prev, walletBalance: prevBalance } : prev
            );
        } finally {
            setAwarding(false);
        }
    };

    // ── Delete User ──
    const handleDelete = async () => {
        if (!user || deleteConfirmRef.current.toLowerCase() !== user.name.toLowerCase()) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/users/${user._id}`, {
                method: "DELETE",
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body.message || `HTTP ${res.status}`);
            }

            setAudits((logs: any[]) => [
                {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "System" as const,
                    event: "Permanently deleted user",
                    status: "Success" as const,
                    detail: `${user.name} (${user.email})`,
                },
                ...logs,
            ]);

            navigate("/users");
        } catch (err: any) {
            alert(err.message || "Failed to delete user.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-8 h-8 text-primary/50" />
                </motion.div>
                <p className="text-xs font-bold text-zinc-400">Loading user details...</p>
            </div>
        );
    }

    // ── Error State ──
    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm font-bold text-zinc-700">Failed to load user</p>
                <p className="text-xs text-zinc-400">{error || "User not found."}</p>
                <button
                    onClick={() => navigate("/users")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Users
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            {/* ── Back + Header ── */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate("/users")}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors self-start"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users Directory
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-black text-xl shrink-0 overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                (user.name || "U").charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-zinc-900">{user.name}</h1>
                            <p className="text-xs font-bold text-zinc-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleStatus}
                            disabled={toggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all border disabled:opacity-50 ${user.status === "Active"
                                ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white"
                                : "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                }`}
                        >
                            {toggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : user.status === "Active" ? (
                                <ShieldBan className="w-3.5 h-3.5" />
                            ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            {user.status === "Active" ? "Block User" : "Unblock User"}
                        </button>
                        <button
                            onClick={() => {
                                setDeleteConfirmText("");
                                setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all border bg-white border-zinc-200 text-zinc-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column: Profile + KYC ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Info Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
                        <h3 className="text-sm font-black text-zinc-900">Profile Information</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Full Name</p>
                                <p className="text-xs font-bold text-zinc-900">{user.name || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Email Address</p>
                                <p className="text-xs font-bold text-zinc-900 break-all">{user.email || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Phone Number</p>
                                <p className="text-xs font-bold text-zinc-900">{user.phone || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Website</p>
                                <p className="text-xs font-bold text-zinc-900">{user.website || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Account Role</p>
                                <span className={`inline-block text-[8px] font-black tracking-tight px-2 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Account Status</p>
                                <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full border ${getStatusBadgeClass(user.status)}`}>
                                    {user.status}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Joined At</p>
                                <p className="text-xs font-bold text-zinc-900">{user.createdAt ? formatDate(user.createdAt) : "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Last Updated</p>
                                <p className="text-xs font-bold text-zinc-900">{user.updatedAt ? formatDate(user.updatedAt) : "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* KYC Documents Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-zinc-900">KYC Documents</h3>
                            <span className={`flex items-center gap-1 text-[8px] font-black tracking-tight px-2 py-0.5 rounded border ${getKycBadgeClass(user.kycStatus)}`}>
                                {getKycIcon(user.kycStatus)}
                                {user.kycStatus}
                            </span>
                        </div>

                        {user.kycStatus === "Not Submitted" ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 bg-zinc-50 rounded-xl">
                                <FileText className="w-8 h-8 text-zinc-300" />
                                <p className="text-xs font-bold text-zinc-400">No KYC documents submitted yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Aadhar Front */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Aadhar Card (Front)</p>
                                    {user.aadharFront ? (
                                        <a href={user.aadharFront} target="_blank" rel="noopener noreferrer" className="block">
                                            <div className="aspect-[3/2] rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                                                <img
                                                    src={user.aadharFront}
                                                    alt="Aadhar Front"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-[3/2] rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-zinc-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Aadhar Back */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Aadhar Card (Back)</p>
                                    {user.aadharBack ? (
                                        <a href={user.aadharBack} target="_blank" rel="noopener noreferrer" className="block">
                                            <div className="aspect-[3/2] rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                                                <img
                                                    src={user.aadharBack}
                                                    alt="Aadhar Back"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-[3/2] rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-zinc-300" />
                                        </div>
                                    )}
                                </div>

                                {/* PAN Card */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">PAN Card</p>
                                    {user.panCardImage ? (
                                        <a href={user.panCardImage} target="_blank" rel="noopener noreferrer" className="block">
                                            <div className="aspect-[3/2] rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                                                <img
                                                    src={user.panCardImage}
                                                    alt="PAN Card"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-[3/2] rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-zinc-300" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column: Wallet + Bank ── */}
                <div className="space-y-6">
                    {/* Wallet Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900">Wallet Balance</h3>
                                <p className="text-[10px] font-bold text-zinc-400">Redeemable coins</p>
                            </div>
                        </div>

                        <div className="text-center py-3">
                            <p className="text-4xl font-black text-zinc-900">
                                ₹{(user.walletBalance || 0).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {/* Award Coins Form */}
                        <form onSubmit={handleAwardCoins} className="space-y-3 pt-2 border-t border-zinc-50">
                            <p className="text-[10px] font-black text-zinc-400 uppercase">Award Coins</p>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-zinc-400">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50000"
                                    value={awardAmount}
                                    onChange={(e) => setAwardAmount(parseInt(e.target.value) || 0)}
                                    className="w-full border border-zinc-100 bg-zinc-50 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-zinc-950 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-zinc-400">Reason</label>
                                <select
                                    value={awardReason}
                                    onChange={(e) => setAwardReason(e.target.value)}
                                    className="w-full border border-zinc-100 bg-zinc-50 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-zinc-950 transition-colors"
                                >
                                    <option value="Sign-up Promotional Credit">Sign-up Promotional Credit</option>
                                    <option value="Referral Reward Cashback">Referral Reward Cashback</option>
                                    <option value="Goodwill Compensation Refund">Goodwill Compensation Refund</option>
                                    <option value="Loyalty Campaign Bonus">Loyalty Campaign Bonus</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={awarding || awardAmount <= 0}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-tight transition-colors disabled:opacity-50"
                            >
                                {awarding ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Gift className="w-3.5 h-3.5" />
                                )}
                                {awarding ? "Processing..." : `Credit ₹${awardAmount.toLocaleString("en-IN")}`}
                            </button>
                        </form>
                    </div>

                    {/* Bank / Business Details Card (for Vendors / Dual Mode) */}
                    {(user.role === "Vendor" || user.role === "Dual Mode") && (
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-900">Business & Bank Details</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">PAN Number</p>
                                    <p className="text-xs font-bold text-zinc-900 font-mono">{user.panNumber || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">GSTIN</p>
                                    <p className="text-xs font-bold text-zinc-900 font-mono">{user.gstin || "—"}</p>
                                </div>
                                <div className="border-t border-zinc-50 pt-3 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">Bank Account</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">Account Number</p>
                                        <p className="text-xs font-bold text-zinc-900 font-mono">
                                            {user.bankAccount ? maskBankAccount(user.bankAccount) : "—"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">IFSC Code</p>
                                        <p className="text-xs font-bold text-zinc-900 font-mono">{user.bankIFSC || "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Info Card */}
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-zinc-900">Account Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-500">Role</span>
                                </div>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-500">KYC Status</span>
                                </div>
                                <span className={`flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded border ${getKycBadgeClass(user.kycStatus)}`}>
                                    {getKycIcon(user.kycStatus)}
                                    {user.kycStatus}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-500">Joined</span>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-700">
                                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Danger Icon */}
                            <div className="flex flex-col items-center gap-3 pt-2">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-lg font-black text-zinc-900">Delete User Account</h3>
                                    <p className="text-xs font-bold text-zinc-500 leading-relaxed max-w-xs">
                                        This action is <span className="text-red-500">permanent and irreversible</span>.
                                        All data associated with <span className="text-zinc-900">{user.name}</span> will be
                                        completely removed from the system, including listings, bookings, messages, and wallet balance.
                                    </p>
                                </div>
                            </div>

                            {/* Warning Checklist */}
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    What will be deleted:
                                </p>
                                <ul className="space-y-1">
                                    {[
                                        "User profile & personal information",
                                        "All KYC documents (Aadhar, PAN)",
                                        "All listings & activities they created",
                                        "Booking history & messages",
                                        `Wallet balance of ₹${(user.walletBalance || 0).toLocaleString("en-IN")}`,
                                        "All associated audit trails",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-amber-800">
                                            <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Confirm Input */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">
                                    Type <span className="text-red-500 font-black">{user.name}</span> to confirm:
                                </p>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => { setDeleteConfirmText(e.target.value); deleteConfirmRef.current = e.target.value; }}
                                    placeholder={user.name}
                                    className="w-full border border-zinc-200 bg-zinc-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                    className="flex-1 py-3 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting || deleteConfirmText.trim().toLowerCase() !== user.name.toLowerCase()}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-black tracking-tight transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};