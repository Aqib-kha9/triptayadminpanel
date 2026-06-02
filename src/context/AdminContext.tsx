import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
    PlatformUser,
    HostApplication,
    Property,
    SystemBooking,
    Coupon,
    Campaign,
    AuditLog,
    DisputeTicket,
    ChatRoom,
    ChatMessage
} from "../types";
import {
    INITIAL_USERS,
    INITIAL_PROPERTIES,
    INITIAL_BOOKINGS,
    INITIAL_COUPONS,
    INITIAL_CAMPAIGNS,
    INITIAL_AUDITS,
    INITIAL_DISPUTES,
    INITIAL_CHATROOMS
} from "../data/mockData";

// ──────────────────── Context Type ────────────────────
interface AdminContextType {
    // Data
    users: PlatformUser[];
    setUsers: React.Dispatch<React.SetStateAction<PlatformUser[]>>;
    applications: HostApplication[];
    setApplications: React.Dispatch<React.SetStateAction<HostApplication[]>>;
    properties: Property[];
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    bookings: SystemBooking[];
    coupons: Coupon[];
    campaigns: Campaign[];
    audits: AuditLog[];
    setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
    disputes: DisputeTicket[];
    chatRooms: ChatRoom[];

    // KYC-specific states
    kycLoading: boolean;
    kycError: string | null;
    kycFilter: string;
    setKycFilter: (v: string) => void;
    refreshKycApplications: () => Promise<void>;

    // Financial settings
    commissionRate: number;
    setCommissionRate: (v: number) => void;
    gstRate: number;
    setGstRate: (v: number) => void;
    autoPayoutEnabled: boolean;
    setAutoPayoutEnabled: (v: boolean) => void;
    rateLimit: number;
    setRateLimit: (v: number) => void;
    ipBlocklist: string[];
    setIpBlocklist: React.Dispatch<React.SetStateAction<string[]>>;

    // Search & filters
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    categoryFilter: string;
    setCategoryFilter: (v: string) => void;

    // Modal state
    selectedKycApp: HostApplication | null;
    setSelectedKycApp: (v: HostApplication | null) => void;
    payoutVendor: { name: string; balance: number } | null;
    setPayoutVendor: (v: { name: string; balance: number } | null) => void;
    payoutReceipt: string | null;
    setPayoutReceipt: (v: string | null) => void;
    selectedInvoiceBooking: SystemBooking | null;
    setSelectedInvoiceBooking: (v: SystemBooking | null) => void;
    selectedPropertyForEdit: Property | null;
    setSelectedPropertyForEdit: (v: Property | null) => void;
    selectedUserForEdit: PlatformUser | null;
    setSelectedUserForEdit: (v: PlatformUser | null) => void;
    selectedUserForCoins: PlatformUser | null;
    setSelectedUserForCoins: (v: PlatformUser | null) => void;
    awardAmount: number;
    setAwardAmount: (v: number) => void;
    awardReason: string;
    setAwardReason: (v: string) => void;

    // Form state
    newCouponCode: string;
    setNewCouponCode: (v: string) => void;
    newCouponDiscount: number;
    setNewCouponDiscount: (v: number) => void;
    newCouponType: "Global" | "Stay-Specific" | "Activity-Specific";
    setNewCouponType: (v: "Global" | "Stay-Specific" | "Activity-Specific") => void;
    newCouponTarget: string;
    setNewCouponTarget: (v: string) => void;
    newCampTitle: string;
    setNewCampTitle: (v: string) => void;
    newCampGroup: "Guests" | "Vendors" | "All Users";
    setNewCampGroup: (v: "Guests" | "Vendors" | "All Users") => void;
    newCampChannel: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push";
    setNewCampChannel: (v: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push") => void;

    // Handlers
    handleApprove: (appId: string) => Promise<void>;
    handleReject: (appId: string) => Promise<void>;
    handleCreateCoupon: (e: React.FormEvent) => void;
    handleLaunchCampaign: (e: React.FormEvent) => void;
    triggerPayoutModal: (vendorName: string, balance: number) => void;
    executeManualPayout: () => void;
    closePayoutReceipt: () => void;
    toggleUserStatus: (userId: string) => void;
    handleAwardCoins: (e: React.FormEvent) => void;
    handleCancelAndRefundBooking: (bookingId: string) => void;
    handleRefundDispute: (disputeId: string) => void;
    handleReleaseDispute: (disputeId: string) => void;
    handleBlockHost: (hostName: string) => void;
    handleSendMessage: (roomId: string, text: string, sender: "Guest" | "Host" | "Admin") => void;
    handleSimulateIncoming: (roomId: string, text: string, sender: "Guest" | "Host") => void;
    handleSimulateLog: (type: "Webhook" | "SQS Queue" | "Security" | "System", event: string, status: "Success" | "Failed" | "Blocked") => void;
    handleSaveListing: (updatedProperty: Property) => void;
    handleSaveUser: (updatedUser: PlatformUser) => void;

    // Computed
    pendingApprovalsCount: number;
    pendingDisputesCount: number;
    unreadChatsCount: number;
}

const AdminContext = createContext<AdminContextType | null>(null);

// ──────────────────── API Helper ────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}/api/admin${path}`;
    const res = await fetch(url, { ...options, credentials: "include" });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed with status ${res.status}`);
    }
    return res.json();
}

// ──────────────────── Provider ────────────────────
export function AdminProvider({ children }: { children: ReactNode }) {
    // Data
    const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
    const [applications, setApplications] = useState<HostApplication[]>([]);
    const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
    const [bookings, setBookings] = useState<SystemBooking[]>(INITIAL_BOOKINGS);
    const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
    const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
    const [audits, setAudits] = useState<AuditLog[]>(INITIAL_AUDITS);
    const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_DISPUTES);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>(INITIAL_CHATROOMS);

    // KYC-specific states
    const [kycLoading, setKycLoading] = useState(false);
    const [kycError, setKycError] = useState<string | null>(null);
    const [kycFilter, setKycFilter] = useState("");

    // Financial
    const [commissionRate, setCommissionRate] = useState(15);
    const [gstRate, setGstRate] = useState(5);
    const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);
    const [rateLimit, setRateLimit] = useState(120);
    const [ipBlocklist, setIpBlocklist] = useState<string[]>(["192.168.1.108", "45.2.12.9"]);

    // Search & filters
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Modal state
    const [selectedKycApp, setSelectedKycApp] = useState<HostApplication | null>(null);
    const [payoutVendor, setPayoutVendor] = useState<{ name: string; balance: number } | null>(null);
    const [payoutReceipt, setPayoutReceipt] = useState<string | null>(null);
    const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<SystemBooking | null>(null);
    const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState<Property | null>(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<PlatformUser | null>(null);
    const [selectedUserForCoins, setSelectedUserForCoins] = useState<PlatformUser | null>(null);
    const [awardAmount, setAwardAmount] = useState(500);
    const [awardReason, setAwardReason] = useState("Sign-up Promotional Credit");

    // Form state
    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState(10);
    const [newCouponType, setNewCouponType] = useState<"Global" | "Stay-Specific" | "Activity-Specific">("Global");
    const [newCouponTarget, setNewCouponTarget] = useState("");
    const [newCampTitle, setNewCampTitle] = useState("");
    const [newCampGroup, setNewCampGroup] = useState<"Guests" | "Vendors" | "All Users">("Guests");
    const [newCampChannel, setNewCampChannel] = useState<"AWS SES Email" | "Twilio WhatsApp" | "Firebase Push">("AWS SES Email");

    // ────────── KYC: Fetch applications from backend ──────────
    const refreshKycApplications = useCallback(async () => {
        setKycLoading(true);
        setKycError(null);
        try {
            const query = kycFilter ? `?status=${encodeURIComponent(kycFilter)}` : "";
            const res = await apiFetch<{ status: string; data: { applications: HostApplication[] } }>(`/kyc${query}`);
            if (res.status === "success") {
                setApplications(res.data.applications);
            } else {
                setKycError("Failed to load KYC applications.");
            }
        } catch (err: any) {
            setKycError(err.message || "Network error while fetching KYC applications.");
        } finally {
            setKycLoading(false);
        }
    }, [kycFilter]);

    // Initial fetch
    useEffect(() => {
        refreshKycApplications();
    }, [refreshKycApplications]);

    // ────────── Handlers ──────────

    const handleApprove = useCallback(async (appId: string): Promise<void> => {
        try {
            const res = await apiFetch<{ status: string; message: string; data: { application: HostApplication } }>(
                `/kyc/${appId}/approve`,
                { method: "PATCH" }
            );
            if (res.status === "success") {
                setApplications(prev =>
                    prev.map(a => a._id === appId || a.id === appId
                        ? { ...a, kycStatus: "Approved" as const, status: "Approved" as const }
                        : a
                    )
                );
                setAudits(logs => [
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `KYC approved for ${res.data.application.name} (${res.data.application.email}). Host onboarding completed.`, status: "Success" },
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: KYC approval notification email queued for ${res.data.application.email}.`, status: "Success" },
                    ...logs
                ]);
                setSelectedKycApp(null);
            }
        } catch (err: any) {
            setAudits(logs => [
                { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `KYC approval failed for ID ${appId}: ${err.message}`, status: "Failed" },
                ...logs
            ]);
        }
    }, []);

    const handleReject = useCallback(async (appId: string): Promise<void> => {
        try {
            const res = await apiFetch<{ status: string; message: string; data: { application: HostApplication } }>(
                `/kyc/${appId}/reject`,
                { method: "PATCH" }
            );
            if (res.status === "success") {
                setApplications(prev =>
                    prev.map(a => a._id === appId || a.id === appId
                        ? { ...a, kycStatus: "Rejected" as const, status: "Rejected" as const }
                        : a
                    )
                );
                setAudits(logs => [
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `KYC rejected for ${res.data.application.name} (${res.data.application.email}).`, status: "Failed" },
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: KYC rejection notification email queued for ${res.data.application.email}.`, status: "Success" },
                    ...logs
                ]);
                setSelectedKycApp(null);
            }
        } catch (err: any) {
            setAudits(logs => [
                { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `KYC rejection failed for ID ${appId}: ${err.message}`, status: "Failed" },
                ...logs
            ]);
        }
    }, []);

    const handleCreateCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCouponCode) return;
        const newCpn: Coupon = { id: `CPN-${Math.floor(Math.random() * 90) + 10}`, code: newCouponCode.toUpperCase(), discountPercent: newCouponDiscount, type: newCouponType, targetName: newCouponTarget || "All Stays & Experiences", expiryDate: "30 September, 2026", status: "Active" };
        setCoupons(prev => [newCpn, ...prev]);
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Global Promo Coupon "${newCpn.code}" (${newCouponDiscount}%) generated successfully.`, status: "Success" }, ...logs]);
        setNewCouponCode("");
        setNewCouponTarget("");
    };

    const handleLaunchCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampTitle) return;
        const count = newCampGroup === "Guests" ? 850 : newCampGroup === "Vendors" ? 40 : 890;
        const newCamp: Campaign = { id: `CMP-${Math.floor(Math.random() * 900) + 100}`, title: newCampTitle, targetGroup: newCampGroup, channel: newCampChannel, scheduledTime: "Immediate Dispatch", status: "Sent", analytics: { sent: count, opens: Math.round(count * 0.45), clicks: Math.round(count * 0.12) } };
        setCampaigns(prev => [newCamp, ...prev]);
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: Initialized Campaign Queue job ${newCamp.id} (${newCampChannel}). Dispatching to ${count} targets.`, status: "Success" }, ...logs]);
        setNewCampTitle("");
    };

    const triggerPayoutModal = (vendorName: string, balance: number) => {
        setPayoutVendor({ name: vendorName, balance });
    };

    const executeManualPayout = () => {
        if (!payoutVendor) return;
        const receiptNum = `PAY-RC-${Math.floor(Math.random() * 90000) + 10000}`;
        setPayoutReceipt(receiptNum);
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Settled manual payout receipt ${receiptNum} to Host ${payoutVendor.name} totaling ₹${payoutVendor.balance.toLocaleString()}.`, status: "Success" }, ...logs]);
    };

    const closePayoutReceipt = () => {
        setPayoutVendor(null);
        setPayoutReceipt(null);
    };

    const toggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const nextStatus = u.status === "Active" ? "Blocked" : "Active";
                const log: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `User ${userId} (${u.name}) has been ${nextStatus.toUpperCase()} by Administrator.`, status: "Success" };
                setAudits(logs => [log, ...logs]);
                return { ...u, status: nextStatus };
            }
            return u;
        }));
    };

    const handleAwardCoins = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForCoins) return;
        setUsers(prev => prev.map(u => {
            if (u.id === selectedUserForCoins.id) {
                const newBalance = u.walletBalance + awardAmount;
                const log: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Awarded ₹${awardAmount.toLocaleString()} Loyalty Coins to user ${u.name} (Reason: ${awardReason}).`, status: "Success" };
                const queueLog: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: Wallet credit notification email task triggered successfully for ${u.email}.`, status: "Success" };
                setAudits(logs => [log, queueLog, ...logs]);
                return { ...u, walletBalance: newBalance };
            }
            return u;
        }));
        setSelectedUserForCoins(null);
        setAwardAmount(500);
        setAwardReason("Sign-up Promotional Credit");
    };

    const handleCancelAndRefundBooking = (bookingId: string) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                if (b.status === "Cancelled") return b;
                setUsers(allUsers => allUsers.map(u => {
                    if (u.name.toLowerCase() === b.guestName.toLowerCase()) {
                        const nextBalance = u.walletBalance + b.amount;
                        const refundLog: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Cancelled booking ${bookingId} and refunded ₹${b.amount.toLocaleString()} to User ${u.name}'s Triptay Wallet.`, status: "Success" };
                        const sqsLog: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS Job: Dispatched automated refund email confirmation to guest ${u.email}.`, status: "Success" };
                        setAudits(logs => [refundLog, sqsLog, ...logs]);
                        return { ...u, walletBalance: nextBalance };
                    }
                    return u;
                }));
                return { ...b, status: "Cancelled" as const };
            }
            return b;
        }));
    };

    const handleRefundDispute = (disputeId: string) => {
        setDisputes(prev => prev.map(d => {
            if (d.id === disputeId) {
                if (d.status !== "Pending") return d;
                const updated = { ...d, status: "Resolved-Refunded" as const };
                handleCancelAndRefundBooking(d.bookingId);
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute ticket ${disputeId} resolved: Guest refunded for booking ${d.bookingId}.`, status: "Success" }, ...logs]);
                return updated;
            }
            return d;
        }));
    };

    const handleReleaseDispute = (disputeId: string) => {
        setDisputes(prev => prev.map(d => {
            if (d.id === disputeId) {
                if (d.status !== "Pending") return d;
                const updated = { ...d, status: "Resolved-PaidVendor" as const };
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute ticket ${disputeId} resolved: Payout funds released to Host (${d.hostName}) for booking ${d.bookingId}.`, status: "Success" }, ...logs]);
                return updated;
            }
            return d;
        }));
    };

    const handleBlockHost = (hostName: string) => {
        setUsers(prev => prev.map(u => u.name.toLowerCase() === hostName.toLowerCase() ? { ...u, status: "Blocked" as const } : u));
        setProperties(prev => prev.map(p => p.hostName.toLowerCase() === hostName.toLowerCase() ? { ...p, status: "Suspended" as const } : p));
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `Host account blocked & all listings suspended for: ${hostName} due to active arbitration violations.`, status: "Success" }, ...logs]);
        setDisputes(prev => prev.map(d => d.hostName.toLowerCase() === hostName.toLowerCase() && d.status === "Pending" ? { ...d, status: "Resolved-Refunded" as const } : d));
    };

    const handleSendMessage = (roomId: string, text: string, sender: "Guest" | "Host" | "Admin") => {
        const newMessage: ChatMessage = { id: `msg-${Date.now()}`, sender, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setChatRooms(prev => prev.map(room => room.id === roomId ? { ...room, lastMessage: text, messages: [...room.messages, newMessage] } : room));
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Arbitration message dispatched to Support Channel ${roomId} by ${sender}.`, status: "Success" }, ...logs]);
    };

    const handleSimulateIncoming = (roomId: string, text: string, sender: "Guest" | "Host") => {
        const newMessage: ChatMessage = { id: `msg-${Date.now()}`, sender, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setChatRooms(prev => prev.map(room => room.id === roomId ? { ...room, lastMessage: text, unreadCount: room.unreadCount + 1, messages: [...room.messages, newMessage] } : room));
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Webhook", event: `WebSocket Frame Recv: support channel ${roomId} from ${sender}.`, status: "Success" }, ...logs]);
    };

    const handleSimulateLog = (type: "Webhook" | "SQS Queue" | "Security" | "System", event: string, status: "Success" | "Failed" | "Blocked") => {
        setAudits(prev => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type, event, status }, ...prev]);
    };

    const handleSaveListing = (updatedProperty: Property) => {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Listing ${updatedProperty.id} details updated by administrator: price ₹${updatedProperty.price.toLocaleString()}.`, status: "Success" }, ...logs]);
        setSelectedPropertyForEdit(null);
    };

    const handleSaveUser = (updatedUser: PlatformUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `User ${updatedUser.id} profile configuration modified: KYC status set to ${updatedUser.kycStatus}.`, status: "Success" }, ...logs]);
        setSelectedUserForEdit(null);
    };

    // Computed
    const pendingApprovalsCount = applications.filter(app => app.status === "Pending").length;
    const pendingDisputesCount = disputes.filter(d => d.status === "Pending").length;
    const unreadChatsCount = chatRooms.reduce((sum, r) => sum + r.unreadCount, 0);

    const value: AdminContextType = {
        users, setUsers,
        applications, setApplications, properties, setProperties, bookings, coupons, campaigns, audits, setAudits, disputes, chatRooms,
        kycLoading, kycError, kycFilter, setKycFilter, refreshKycApplications,
        commissionRate, setCommissionRate, gstRate, setGstRate, autoPayoutEnabled, setAutoPayoutEnabled,
        rateLimit, setRateLimit, ipBlocklist, setIpBlocklist,
        searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
        selectedKycApp, setSelectedKycApp, payoutVendor, setPayoutVendor, payoutReceipt, setPayoutReceipt,
        selectedInvoiceBooking, setSelectedInvoiceBooking, selectedPropertyForEdit, setSelectedPropertyForEdit,
        selectedUserForEdit, setSelectedUserForEdit, selectedUserForCoins, setSelectedUserForCoins,
        awardAmount, setAwardAmount, awardReason, setAwardReason,
        newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount,
        newCouponType, setNewCouponType, newCouponTarget, setNewCouponTarget,
        newCampTitle, setNewCampTitle, newCampGroup, setNewCampGroup, newCampChannel, setNewCampChannel,
        handleApprove, handleReject, handleCreateCoupon, handleLaunchCampaign,
        triggerPayoutModal, executeManualPayout, closePayoutReceipt, toggleUserStatus, handleAwardCoins,
        handleCancelAndRefundBooking, handleRefundDispute, handleReleaseDispute, handleBlockHost,
        handleSendMessage, handleSimulateIncoming, handleSimulateLog, handleSaveListing, handleSaveUser,
        pendingApprovalsCount, pendingDisputesCount, unreadChatsCount,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// ──────────────────── Hook ────────────────────
export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}