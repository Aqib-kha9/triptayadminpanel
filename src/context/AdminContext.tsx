import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { io } from "socket.io-client";
import type {
    PlatformUser,
    HostApplication,
    Property,
    SystemBooking,
    Coupon,
    Campaign,
    CampaignTemplate,
    AuditLog,
    DisputeTicket,
    ChatRoom,
    ChatMessage,
    Activity
} from "../types";
// No mock data imports - pure live data connectivity

// ──────────────────── Dashboard Stats Type ────────────────────
interface DashboardStats {
    counts: {
        users: number;
        listings: number;
        activities: number;
        bookings: number;
        pendingKyc: number;
        publishedListings: number;
        publishedActivities: number;
        activeBookings: number;
        pendingPayouts: number;
        activeCoupons: number;
    };
    revenue: number;
    recentBookings: Array<{
        _id: string;
        id: string;
        bookingRef: string;
        status: string;
        totalAmount: number;
        createdAt: string;
        userId: string;
        itemName: string;
        userName?: string;
        userEmail?: string;
    }>;
    recentUsers: Array<{
        _id: string;
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        createdAt: string;
    }>;
}

// ──────────────────── Gateway Settings Type ────────────────────
interface GatewaySettings {
    razorpay: {
        enabled: boolean;
        liveMode: boolean;
        keyId: string;
        keySecret: string;
        keySecretConfigured: boolean;
        webhookSecret: string;
        webhookSecretConfigured: boolean;
        testKeyId: string;
        testKeySecret: string;
        testKeySecretConfigured: boolean;
        accountId: string;
        webhookUrl: string;
    };
    payu: {
        enabled: boolean;
        liveMode: boolean;
        merchantId: string;
        key: string;
        salt: string;
        saltConfigured: boolean;
        webhookSalt: string;
        webhookSaltConfigured: boolean;
        baseUrl: string;
        paymentHandleUrl: string;
        successUrl: string;
        failureUrl: string;
        testMerchantId: string;
        testKey: string;
        testSalt: string;
        testSaltConfigured: boolean;
    };
    defaultGateway: string;
    fallbackEnabled: boolean;
}

interface GatewayTestResult {
    gateway: string;
    success: boolean;
    message: string;
    details?: string;
}

// ──────────────────── Context Type ────────────────────
interface AdminContextType {
    // Data
    users: PlatformUser[];
    setUsers: React.Dispatch<React.SetStateAction<PlatformUser[]>>;
    applications: HostApplication[];
    setApplications: React.Dispatch<React.SetStateAction<HostApplication[]>>;
    properties: Property[];
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    bookings: SystemBooking[];
    coupons: Coupon[];
    campaigns: Campaign[];
    templates: CampaignTemplate[];
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

    // Dashboard stats
    dashboardStats: DashboardStats | null;
    dashboardLoading: boolean;
    refreshDashboard: () => Promise<void>;

    // Real data loading states & refreshers
    usersLoading: boolean;
    refreshUsers: () => Promise<void>;
    propertiesLoading: boolean;
    refreshProperties: () => Promise<void>;
    activitiesLoading: boolean;
    refreshActivities: () => Promise<void>;
    bookingsLoading: boolean;
    refreshBookings: () => Promise<void>;
    couponsLoading: boolean;
    refreshCoupons: () => Promise<void>;
    auditsLoading: boolean;
    refreshAudits: () => Promise<void>;
    disputesLoading: boolean;
    refreshDisputes: () => Promise<void>;
    campaignsLoading: boolean;
    refreshCampaigns: () => Promise<void>;
    templatesLoading: boolean;
    refreshTemplates: () => Promise<void>;

    // Financials (commission summary + payouts)
    commissionSummary: {
        totalCommission: number;
        totalHostPayout: number;
        pendingCommission: number;
        processedCommission: number;
        totalTransactions: number;
    } | null;
    hostBreakdown: Array<{
        hostId: string;
        hostName: string;
        hostEmail: string;
        commission: number;
        payout: number;
        pending: number;
    }>;
    payouts: Array<{
        id: string;
        hostId: string;
        hostName: string;
        hostEmail: string;
        amount: number;
        status: string;
        payoutRef: string;
        createdAt: string;
    }>;
    financialsLoading: boolean;
    refreshFinancials: () => Promise<void>;

    // Financial settings
    commissionRate: number;
    setCommissionRate: (v: number) => void;
    gstRate: number;
    setGstRate: (v: number) => void;
    platformFeeRate: number;
    setPlatformFeeRate: (v: number) => void;
    payoutMinThreshold: number;
    setPayoutMinThreshold: (v: number) => void;
    autoPayoutEnabled: boolean;
    setAutoPayoutEnabled: (v: boolean) => void;
    rateLimit: number;
    setRateLimit: (v: number) => void;
    rateLimitAuthMax: number;
    setRateLimitAuthMax: (v: number) => void;
    bookingExpiryMinutes: number;
    setBookingExpiryMinutes: (v: number) => void;
    maintenanceMode: boolean;
    setMaintenanceMode: (v: boolean) => void;
    whatsappNotificationsEnabled: boolean;
    setWhatsappNotificationsEnabled: (v: boolean) => void;
    mfaEnforced: boolean;
    setMfaEnforced: (v: boolean) => void;
    globalSiteTitle: string;
    setGlobalSiteTitle: (v: string) => void;
    globalMetaDescription: string;
    setGlobalMetaDescription: (v: string) => void;
    ipBlocklist: string[];
    setIpBlocklist: React.Dispatch<React.SetStateAction<string[]>>;
    configurationsLoading: boolean;
    refreshConfigurations: () => Promise<void>;
    saveConfiguration: (key: string, value: unknown) => void;

    sesRegion: string;
    setSesRegion: (val: string) => void;
    sesFromEmail: string;
    setSesFromEmail: (val: string) => void;
    sesFromName: string;
    setSesFromName: (val: string) => void;
    sesConfigurationSet: string;
    setSesConfigurationSet: (val: string) => void;
    whatsappApiUrl: string;
    setWhatsappApiUrl: (val: string) => void;
    whatsappPhoneNumberId: string;
    setWhatsappPhoneNumberId: (val: string) => void;
    whatsappAccessToken: string;
    setWhatsappAccessToken: (val: string) => void;
    whatsappVerifyToken: string;
    setWhatsappVerifyToken: (val: string) => void;

    // Cancellation Policy Settings
    cancellationDefaultPolicy: string;
    setCancellationDefaultPolicy: (v: string) => void;
    cancellationVendorOverrideEnabled: boolean;
    setCancellationVendorOverrideEnabled: (v: boolean) => void;
    cancellationFlexibleFullRefundHours: number;
    setCancellationFlexibleFullRefundHours: (v: number) => void;
    cancellationModerateFullRefundHours: number;
    setCancellationModerateFullRefundHours: (v: number) => void;
    cancellationModeratePartialRefundHours: number;
    setCancellationModeratePartialRefundHours: (v: number) => void;
    cancellationStrictPartialRefundHours: number;
    setCancellationStrictPartialRefundHours: (v: number) => void;

    // Payment Gateway Settings
    gatewaySettings: GatewaySettings | null;
    gatewaySettingsLoading: boolean;
    refreshGatewaySettings: () => Promise<void>;
    saveGatewaySetting: (key: string, value: unknown) => void;
    testGateway: (gateway: "razorpay" | "payu") => Promise<GatewayTestResult>;
    gatewayTestResult: GatewayTestResult | null;
    gatewayTesting: boolean;

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
    newCouponExpiry: string;
    setNewCouponExpiry: (v: string) => void;
    newCouponMinOrder: number;
    setNewCouponMinOrder: (v: number) => void;
    newCouponLimit: number;
    setNewCouponLimit: (v: number) => void;
    newCampTitle: string;
    setNewCampTitle: (v: string) => void;
    newCampGroup: "Guests" | "Vendors" | "All Users";
    setNewCampGroup: (v: "Guests" | "Vendors" | "All Users") => void;
    newCampChannel: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push";
    setNewCampChannel: (v: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push") => void;
    newCampSubject: string;
    setNewCampSubject: (v: string) => void;
    newCampContent: string;
    setNewCampContent: (v: string) => void;
    newCampScheduled: boolean;
    setNewCampScheduled: (v: boolean) => void;
    newCampScheduledAt: string;
    setNewCampScheduledAt: (v: string) => void;

    // Handlers
    handleApprove: (appId: string) => Promise<void>;
    handleReject: (appId: string) => Promise<void>;
    handleCreateCoupon: (e: React.FormEvent) => void;
    handleDeleteCoupon: (couponId: string) => Promise<void>;
    handleLaunchCampaign: (e: React.FormEvent) => void;
    handleExecuteCampaign: (campaignId: string) => Promise<void>;
    handleCancelCampaign: (campaignId: string) => Promise<void>;
    handleDeleteCampaign: (campaignId: string) => Promise<void>;
    handleCreateTemplate: (template: { name: string; type: string; subject?: string; body: string }) => Promise<void>;
    handleUpdateTemplate: (id: string, template: { name?: string; type?: string; subject?: string; body?: string }) => Promise<void>;
    handleDeleteTemplate: (id: string) => Promise<void>;
    triggerPayoutModal: (vendorName: string, balance: number) => void;
    executeManualPayout: () => void;
    closePayoutReceipt: () => void;
    toggleUserStatus: (userId: string) => void;
    toggleListingStatus: (listingId: string) => void;
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
    const token = localStorage.getItem("admin_token");
    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed with status ${res.status}`);
    }
    return res.json();
}

// ──────────────────── Provider ────────────────────
export function AdminProvider({ children }: { children: ReactNode }) {
    // Data - Empty by default (requires backend connectivity)
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [applications, setApplications] = useState<HostApplication[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [bookings, setBookings] = useState<SystemBooking[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [audits, setAudits] = useState<AuditLog[]>([]);
    const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    // Real data loading states
    const [usersLoading, setUsersLoading] = useState(false);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [auditsLoading, setAuditsLoading] = useState(false);
    const [disputesLoading, setDisputesLoading] = useState(false);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [templatesLoading, setTemplatesLoading] = useState(false);

    // Financials (commission summary + payouts)
    const [commissionSummary, setCommissionSummary] = useState<{
        totalCommission: number;
        totalHostPayout: number;
        pendingCommission: number;
        processedCommission: number;
        totalTransactions: number;
    } | null>(null);
    const [hostBreakdown, setHostBreakdown] = useState<Array<{
        hostId: string;
        hostName: string;
        hostEmail: string;
        commission: number;
        payout: number;
        pending: number;
    }>>([]);
    const [payouts, setPayouts] = useState<Array<{
        id: string;
        hostId: string;
        hostName: string;
        hostEmail: string;
        amount: number;
        status: string;
        payoutRef: string;
        createdAt: string;
    }>>([]);
    const [financialsLoading, setFinancialsLoading] = useState(false);

    // KYC-specific states
    const [kycLoading, setKycLoading] = useState(false);
    const [kycError, setKycError] = useState<string | null>(null);
    const [kycFilter, setKycFilter] = useState("");

    // Financial / Platform Configuration
    const [commissionRate, setCommissionRateRaw] = useState(15);
    const [gstRate, setGstRateRaw] = useState(5);
    const [platformFeeRate, setPlatformFeeRateRaw] = useState(5);
    const [payoutMinThreshold, setPayoutMinThresholdRaw] = useState(500);
    const [autoPayoutEnabled, setAutoPayoutEnabledRaw] = useState(false);
    const [rateLimit, setRateLimitRaw] = useState(120);
    const [rateLimitAuthMax, setRateLimitAuthMaxRaw] = useState(10);
    const [bookingExpiryMinutes, setBookingExpiryMinutesRaw] = useState(30);
    const [maintenanceMode, setMaintenanceModeRaw] = useState(false);
    const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabledRaw] = useState(true);
    const [mfaEnforced, setMfaEnforcedRaw] = useState(false);
    const [globalSiteTitle, setGlobalSiteTitleRaw] = useState("Triptay | Premium Stays & Experiences");
    const [globalMetaDescription, setGlobalMetaDescriptionRaw] = useState("Discover and book unique homestays, cottages, and adventure activities across India.");
    const [ipBlocklist, setIpBlocklistRaw] = useState<string[]>(["192.168.1.108", "45.2.12.9"]);

    const [sesRegion, setSesRegionRaw] = useState("ap-south-1");
    const [sesFromEmail, setSesFromEmailRaw] = useState("no-reply@triptay.com");
    const [sesFromName, setSesFromNameRaw] = useState("Triptay");
    const [sesConfigurationSet, setSesConfigurationSetRaw] = useState("");
    const [whatsappApiUrl, setWhatsappApiUrlRaw] = useState("https://graph.facebook.com/v18.0");
    const [whatsappPhoneNumberId, setWhatsappPhoneNumberIdRaw] = useState("");
    const [whatsappAccessToken, setWhatsappAccessTokenRaw] = useState("");
    const [whatsappVerifyToken, setWhatsappVerifyTokenRaw] = useState("triptay_verify");

    // Cancellation Policy Settings state
    const [cancellationDefaultPolicy, setCancellationDefaultPolicyRaw] = useState("Moderate");
    const [cancellationVendorOverrideEnabled, setCancellationVendorOverrideEnabledRaw] = useState(true);
    const [cancellationFlexibleFullRefundHours, setCancellationFlexibleFullRefundHoursRaw] = useState(24);
    const [cancellationModerateFullRefundHours, setCancellationModerateFullRefundHoursRaw] = useState(120);
    const [cancellationModeratePartialRefundHours, setCancellationModeratePartialRefundHoursRaw] = useState(48);
    const [cancellationStrictPartialRefundHours, setCancellationStrictPartialRefundHoursRaw] = useState(168);

    const [configurationsLoading, setConfigurationsLoading] = useState(false);
    const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Payment Gateway Settings state
    const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings | null>(null);
    const [gatewaySettingsLoading, setGatewaySettingsLoading] = useState(false);
    const [gatewayTestResult, setGatewayTestResult] = useState<GatewayTestResult | null>(null);
    const [gatewayTesting, setGatewayTesting] = useState(false);

    // Persist a single configuration key to the backend (debounced 800ms)
    const saveConfiguration = useCallback((key: string, value: unknown) => {
        if (saveTimers.current[key]) {
            clearTimeout(saveTimers.current[key]);
        }
        saveTimers.current[key] = setTimeout(async () => {
            try {
                await apiFetch(`/configurations/${key}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value }),
                });
            } catch (err: any) {
                console.error(`Failed to save configuration ${key}:`, err.message);
            }
        }, 800);
    }, []);

    // Wrapper setters: update local state + persist to backend
    const setCommissionRate = useCallback((rate: number) => {
        setCommissionRateRaw(rate);
        saveConfiguration("commission_rate", rate);
    }, [saveConfiguration]);
    const setGstRate = useCallback((rate: number) => {
        setGstRateRaw(rate);
        saveConfiguration("gst_rate", rate);
    }, [saveConfiguration]);
    const setPlatformFeeRate = useCallback((rate: number) => {
        setPlatformFeeRateRaw(rate);
        saveConfiguration("platform_fee_rate", rate);
    }, [saveConfiguration]);
    const setPayoutMinThreshold = useCallback((val: number) => {
        setPayoutMinThresholdRaw(val);
        saveConfiguration("payout_min_threshold", val);
    }, [saveConfiguration]);
    const setAutoPayoutEnabled = useCallback((enabled: boolean) => {
        setAutoPayoutEnabledRaw(enabled);
        saveConfiguration("auto_payout_enabled", enabled);
    }, [saveConfiguration]);
    const setRateLimit = useCallback((limit: number) => {
        setRateLimitRaw(limit);
        saveConfiguration("rate_limit_global_max", limit);
    }, [saveConfiguration]);
    const setRateLimitAuthMax = useCallback((val: number) => {
        setRateLimitAuthMaxRaw(val);
        saveConfiguration("rate_limit_auth_max", val);
    }, [saveConfiguration]);
    const setBookingExpiryMinutes = useCallback((val: number) => {
        setBookingExpiryMinutesRaw(val);
        saveConfiguration("booking_expiry_minutes", val);
    }, [saveConfiguration]);
    const setMaintenanceMode = useCallback((val: boolean) => {
        setMaintenanceModeRaw(val);
        saveConfiguration("maintenance_mode", val);
    }, [saveConfiguration]);
    const setWhatsappNotificationsEnabled = useCallback((val: boolean) => {
        setWhatsappNotificationsEnabledRaw(val);
        saveConfiguration("whatsapp_notifications_enabled", val);
    }, [saveConfiguration]);
    const setMfaEnforced = useCallback((val: boolean) => {
        setMfaEnforcedRaw(val);
        saveConfiguration("mfa_enforced", val);
    }, [saveConfiguration]);
    const setGlobalSiteTitle = useCallback((val: string) => {
        setGlobalSiteTitleRaw(val);
        saveConfiguration("global_site_title", val);
    }, [saveConfiguration]);
    const setGlobalMetaDescription = useCallback((val: string) => {
        setGlobalMetaDescriptionRaw(val);
        saveConfiguration("global_meta_description", val);
    }, [saveConfiguration]);
    const setIpBlocklist = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
        setIpBlocklistRaw(prev => {
            const next = typeof updater === "function" ? (updater as (p: string[]) => string[])(prev) : updater;
            saveConfiguration("ip_blocklist", next);
            return next;
        });
    }, [saveConfiguration]);

    const setSesRegion = useCallback((val: string) => {
        setSesRegionRaw(val);
        saveConfiguration("ses_region", val);
    }, [saveConfiguration]);
    const setSesFromEmail = useCallback((val: string) => {
        setSesFromEmailRaw(val);
        saveConfiguration("ses_from_email", val);
    }, [saveConfiguration]);
    const setSesFromName = useCallback((val: string) => {
        setSesFromNameRaw(val);
        saveConfiguration("ses_from_name", val);
    }, [saveConfiguration]);
    const setSesConfigurationSet = useCallback((val: string) => {
        setSesConfigurationSetRaw(val);
        saveConfiguration("ses_configuration_set", val);
    }, [saveConfiguration]);
    const setWhatsappApiUrl = useCallback((val: string) => {
        setWhatsappApiUrlRaw(val);
        saveConfiguration("whatsapp_api_url", val);
    }, [saveConfiguration]);
    const setWhatsappPhoneNumberId = useCallback((val: string) => {
        setWhatsappPhoneNumberIdRaw(val);
        saveConfiguration("whatsapp_phone_number_id", val);
    }, [saveConfiguration]);
    const setWhatsappAccessToken = useCallback((val: string) => {
        setWhatsappAccessTokenRaw(val);
        saveConfiguration("whatsapp_access_token", val);
    }, [saveConfiguration]);
    const setWhatsappVerifyToken = useCallback((val: string) => {
        setWhatsappVerifyTokenRaw(val);
        saveConfiguration("whatsapp_verify_token", val);
    }, [saveConfiguration]);

    // Cancellation Policy Settings setters
    const setCancellationDefaultPolicy = useCallback((v: string) => {
        setCancellationDefaultPolicyRaw(v);
        saveConfiguration("cancellation_default_policy", v);
    }, [saveConfiguration]);
    const setCancellationVendorOverrideEnabled = useCallback((v: boolean) => {
        setCancellationVendorOverrideEnabledRaw(v);
        saveConfiguration("cancellation_vendor_override_enabled", v);
    }, [saveConfiguration]);
    const setCancellationFlexibleFullRefundHours = useCallback((v: number) => {
        setCancellationFlexibleFullRefundHoursRaw(v);
        saveConfiguration("cancellation_flexible_full_refund_hours", v);
    }, [saveConfiguration]);
    const setCancellationModerateFullRefundHours = useCallback((v: number) => {
        setCancellationModerateFullRefundHoursRaw(v);
        saveConfiguration("cancellation_moderate_full_refund_hours", v);
    }, [saveConfiguration]);
    const setCancellationModeratePartialRefundHours = useCallback((v: number) => {
        setCancellationModeratePartialRefundHoursRaw(v);
        saveConfiguration("cancellation_moderate_partial_refund_hours", v);
    }, [saveConfiguration]);
    const setCancellationStrictPartialRefundHours = useCallback((v: number) => {
        setCancellationStrictPartialRefundHoursRaw(v);
        saveConfiguration("cancellation_strict_partial_refund_hours", v);
    }, [saveConfiguration]);

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
    const [newCouponExpiry, setNewCouponExpiry] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [newCouponMinOrder, setNewCouponMinOrder] = useState(0);
    const [newCouponLimit, setNewCouponLimit] = useState(100);
    const [newCampTitle, setNewCampTitle] = useState("");
    const [newCampGroup, setNewCampGroup] = useState<"Guests" | "Vendors" | "All Users">("Guests");
    const [newCampChannel, setNewCampChannel] = useState<"AWS SES Email" | "Twilio WhatsApp" | "Firebase Push">("AWS SES Email");
    const [newCampSubject, setNewCampSubject] = useState("");
    const [newCampContent, setNewCampContent] = useState("");
    const [newCampScheduled, setNewCampScheduled] = useState(false);
    const [newCampScheduledAt, setNewCampScheduledAt] = useState("");

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

    // ────────── Dashboard: Fetch stats from backend ──────────
    const refreshDashboard = useCallback(async () => {
        setDashboardLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: DashboardStats }>("/dashboard");
            if (res.status === "success") {
                setDashboardStats(res.data);
            }
        } catch (err: any) {
            // Silent fail — dashboard will show zeros / fallback
            console.error("Dashboard fetch failed:", err.message);
        } finally {
            setDashboardLoading(false);
        }
    }, []);

    // ────────── Users: Fetch from backend ──────────
    const refreshUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { users: any[] } }>("/users?limit=50");
            if (res.status === "success" && res.data?.users) {
                const mapped: PlatformUser[] = res.data.users.map((u: any) => ({
                    id: u.id || u._id,
                    name: u.name || "Unknown",
                    email: u.email || "",
                    phone: u.phone || "",
                    role: u.role || "Guest",
                    status: u.status || "Active",
                    walletBalance: u.walletBalance || 0,
                    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—",
                    panNumber: u.panNumber,
                    gstin: u.gstin,
                    bankAccount: u.bankAccount,
                    bankIFSC: u.bankIFSC,
                    kycStatus: u.kycStatus || "Not Submitted",
                }));
                setUsers(mapped);
            }
        } catch (err: any) {
            console.error("Users fetch failed:", err.message);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // ────────── Properties (Listings): Fetch from backend ──────────
    const refreshProperties = useCallback(async () => {
        setPropertiesLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { listings: any[] } }>("/listings?limit=50");
            if (res.status === "success" && res.data?.listings) {
                const mapped: Property[] = res.data.listings.map((l: any) => ({
                    id: l.id || l._id,
                    title: l.name || "Untitled",
                    hostName: l.host?.name || "Unknown Host",
                    location: [l.city, l.state].filter(Boolean).join(", ") || "—",
                    type: "Stay" as const,
                    category: l.propertyType,
                    price: l.basePrice || 0,
                    rating: l.rating || "New",
                    status: l.isActive ? "Active" : "Suspended",
                    breakfastPrice: l.breakfastPrice,
                    dinnerPrice: l.dinnerPrice,
                    parkingAvailable: l.parkingAvailable,
                }));
                setProperties(mapped);
            }
        } catch (err: any) {
            console.error("Properties fetch failed:", err.message);
        } finally {
            setPropertiesLoading(false);
        }
    }, []);

    // ────────── Activities: Fetch from backend ──────────
    const refreshActivities = useCallback(async () => {
        setActivitiesLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { activities: any[] } }>("/activities?limit=100");
            if (res.status === "success" && res.data?.activities) {
                const mapped: Activity[] = res.data.activities.map((a: any) => ({
                    id: a.id || a._id,
                    title: a.name || "Untitled Activity",
                    hostName: a.host?.name || "Unknown Host",
                    location: [a.city, a.state].filter(Boolean).join(", ") || "—",
                    price: a.price || 0,
                    rating: a.rating || "New",
                    status: a.isActive ? "Active" : "Suspended",
                }));
                setActivities(mapped);
            }
        } catch (err: any) {
            console.error("Activities fetch failed:", err.message);
        } finally {
            setActivitiesLoading(false);
        }
    }, []);

    // ────────── Bookings: Fetch from backend ──────────
    const refreshBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { bookings: any[] } }>("/bookings?limit=50");
            if (res.status === "success" && res.data?.bookings) {
                const mapped: SystemBooking[] = res.data.bookings.map((b: any) => ({
                    id: b.id || b._id,
                    guestName: b.userName || b.userEmail || "Guest",
                    propertyName: b.itemName || b.itemTitle || "Property",
                    hostName: b.hostName || "Host",
                    amount: b.totalAmount || b.amount || 0,
                    date: b.checkIn ? new Date(b.checkIn).toLocaleDateString() : (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"),
                    status: b.status === "confirmed" ? "Completed" : b.status === "cancelled" ? "Cancelled" : "Upcoming",
                }));
                setBookings(mapped);
            }
        } catch (err: any) {
            console.error("Bookings fetch failed:", err.message);
        } finally {
            setBookingsLoading(false);
        }
    }, []);

    // ────────── Coupons: Fetch from backend ──────────
    const refreshCoupons = useCallback(async () => {
        setCouponsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { coupons: any[] } }>("/coupons?limit=50");
            if (res.status === "success" && res.data?.coupons) {
                const mapped: Coupon[] = res.data.coupons.map((c: any) => {
                    const targetName = c.scope === "all"
                        ? "All Stays & Experiences"
                        : c.scope === "stay" || c.scope === "listing"
                            ? (properties.find(p => p.id === c.itemId)?.title || "Stay-Specific Offer")
                            : (activities.find(a => a.id === c.itemId)?.title || "Activity-Specific Offer");
                    return {
                        id: c.id || c._id,
                        code: c.code || "",
                        discountPercent: c.value || c.discountPercent || c.discount || 0,
                        type: c.scope === "listing" || c.scope === "stay" ? "Stay-Specific" : c.scope === "activity" ? "Activity-Specific" : "Global",
                        targetName,
                        expiryDate: c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "—",
                        status: c.isActive ? "Active" : "Expired",
                        usedCount: c.usedCount || 0,
                        usageLimit: c.usageLimit || 0,
                    };
                });
                setCoupons(mapped);
            }
        } catch (err: any) {
            console.error("Coupons fetch failed:", err.message);
        } finally {
            setCouponsLoading(false);
        }
    }, [properties, activities]);

    // ────────── Audit Logs: Fetch from backend ──────────
    const refreshAudits = useCallback(async () => {
        setAuditsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { logs: any[] } }>("/audits?limit=100");
            if (res.status === "success" && res.data?.logs) {
                const mapped: AuditLog[] = res.data.logs.map((l: any) => ({
                    id: l.id || l._id,
                    timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString() : "—",
                    type: l.category === "security" ? "Security" : l.category === "webhook" ? "Webhook" : l.category === "sqs" ? "SQS Queue" : "System",
                    event: `${l.action || "action"} — ${l.resource || "resource"} (${l.method || ""} ${l.path || ""})`,
                    status: l.statusCode && l.statusCode < 400 ? "Success" : l.statusCode && l.statusCode < 500 ? "Failed" : "Blocked",
                }));
                setAudits(mapped);
            }
        } catch (err: any) {
            console.error("Audit logs fetch failed:", err.message);
        } finally {
            setAuditsLoading(false);
        }
    }, []);

    // ────────── Disputes: Fetch from backend ──────────
    const refreshDisputes = useCallback(async () => {
        setDisputesLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { disputes: any[] } }>("/disputes?limit=50");
            if (res.status === "success" && res.data?.disputes) {
                const mapped: DisputeTicket[] = res.data.disputes.map((d: any) => ({
                    id: d.id || d._id,
                    bookingId: d.bookingRef || d.bookingId || "N/A",
                    guestName: d.raisedByRole === "guest" ? d.raisedByName : d.againstUserName,
                    hostName: d.raisedByRole === "host" ? d.raisedByName : d.againstUserName,
                    issue: d.subject || d.type || "Dispute",
                    amount: d.amount || d.refundAmount || 0,
                    status: d.status === "open" || d.status === "under_review" ? "Pending" : d.status === "resolved_refunded" ? "Resolved-Refunded" : d.status === "resolved_paid_vendor" ? "Resolved-PaidVendor" : d.status === "resolved" ? "Resolved-Refunded" : "Pending",
                    createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—",
                }));
                setDisputes(mapped);
            }
        } catch (err: any) {
            console.error("Disputes fetch failed:", err.message);
        } finally {
            setDisputesLoading(false);
        }
    }, []);

    // ────────── Campaigns: Fetch from backend ──────────
    const refreshCampaigns = useCallback(async () => {
        setCampaignsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { campaigns: any[] } }>("/campaigns?limit=50");
            if (res.status === "success" && res.data?.campaigns) {
                const mapped: Campaign[] = res.data.campaigns.map((c: any) => ({
                    id: c.id || c._id,
                    title: c.name || c.subject || "Untitled Campaign",
                    targetGroup: c.audience === "guests" ? "Guests" : c.audience === "hosts" ? "Vendors" : "All Users",
                    channel: c.type === "whatsapp" ? "Twilio WhatsApp" : c.type === "push" ? "Firebase Push" : "AWS SES Email",
                    scheduledTime: c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : c.startedAt ? new Date(c.startedAt).toLocaleString() : "Immediate Dispatch",
                    status: c.status === "completed" ? "Sent" : c.status === "scheduled" ? "Scheduled" : "Draft",
                    analytics: {
                        sent: c.totalSent || 0,
                        opens: c.totalOpened || 0,
                        clicks: c.totalClicked || 0,
                    },
                }));
                setCampaigns(mapped);
            }
        } catch (err: any) {
            console.error("Campaigns fetch failed:", err.message);
        } finally {
            setCampaignsLoading(false);
        }
    }, []);

    const refreshTemplates = useCallback(async () => {
        setTemplatesLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { templates: CampaignTemplate[] } }>("/templates");
            if (res.status === "success" && res.data?.templates) {
                setTemplates(res.data.templates);
            }
        } catch (err: any) {
            console.error("Templates fetch failed:", err.message);
        } finally {
            setTemplatesLoading(false);
        }
    }, []);

    // ────────── Financials: Commission summary + Payouts ──────────
    const refreshFinancials = useCallback(async () => {
        setFinancialsLoading(true);
        try {
            const [summaryRes, payoutsRes] = await Promise.all([
                apiFetch<{ status: string; data: any }>("/commissions/summary"),
                apiFetch<{ status: string; data: { payouts: any[] } }>("/payouts?limit=50"),
            ]);
            if (summaryRes.status === "success" && summaryRes.data) {
                const s = summaryRes.data.summary || summaryRes.data;
                setCommissionSummary({
                    totalCommission: s.totalCommission || 0,
                    totalHostPayout: s.totalHostPayout || 0,
                    pendingCommission: s.pendingCommission || 0,
                    processedCommission: s.processedCommission || 0,
                    totalTransactions: s.totalTransactions || 0,
                });
                const breakdown = summaryRes.data.hostBreakdown || [];
                setHostBreakdown(breakdown.map((h: any) => ({
                    hostId: h.hostId,
                    hostName: h.host?.name || "Unknown Host",
                    hostEmail: h.host?.email || "",
                    commission: h.commission || 0,
                    payout: h.payout || 0,
                    pending: h.pending || 0,
                })));
            }
            if (payoutsRes.status === "success" && payoutsRes.data?.payouts) {
                setPayouts(payoutsRes.data.payouts.map((p: any) => ({
                    id: p.id || p._id,
                    hostId: p.hostId,
                    hostName: p.hostName || "Unknown Host",
                    hostEmail: p.hostEmail || "",
                    amount: p.amount || 0,
                    status: p.status || "pending",
                    payoutRef: p.payoutRef || p.reference || "",
                    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—",
                })));
            }
        } catch (err: any) {
            console.error("Financials fetch failed:", err.message);
        } finally {
            setFinancialsLoading(false);
        }
    }, []);

    // ────────── Configurations: Fetch platform settings from backend ──────────
    const refreshConfigurations = useCallback(async () => {
        setConfigurationsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { configurations: any[] } }>("/configurations?limit=100");
            if (res.status === "success" && res.data?.configurations) {
                const map: Record<string, any> = {};
                res.data.configurations.forEach((c: any) => { map[c.key] = c.value; });
                if (map.commission_rate !== undefined) setCommissionRateRaw(Number(map.commission_rate));
                if (map.gst_rate !== undefined) setGstRateRaw(Number(map.gst_rate));
                if (map.platform_fee_rate !== undefined) setPlatformFeeRateRaw(Number(map.platform_fee_rate));
                if (map.payout_min_threshold !== undefined) setPayoutMinThresholdRaw(Number(map.payout_min_threshold));
                if (map.auto_payout_enabled !== undefined) setAutoPayoutEnabledRaw(Boolean(map.auto_payout_enabled));
                if (map.rate_limit_global_max !== undefined) setRateLimitRaw(Number(map.rate_limit_global_max));
                if (map.rate_limit_auth_max !== undefined) setRateLimitAuthMaxRaw(Number(map.rate_limit_auth_max));
                if (map.booking_expiry_minutes !== undefined) setBookingExpiryMinutesRaw(Number(map.booking_expiry_minutes));
                if (map.maintenance_mode !== undefined) setMaintenanceModeRaw(Boolean(map.maintenance_mode));
                if (map.whatsapp_notifications_enabled !== undefined) setWhatsappNotificationsEnabledRaw(Boolean(map.whatsapp_notifications_enabled));
                if (map.mfa_enforced !== undefined) setMfaEnforcedRaw(Boolean(map.mfa_enforced));
                if (map.global_site_title !== undefined) setGlobalSiteTitleRaw(String(map.global_site_title));
                if (map.global_meta_description !== undefined) setGlobalMetaDescriptionRaw(String(map.global_meta_description));
                if (map.ip_blocklist !== undefined && Array.isArray(map.ip_blocklist)) setIpBlocklistRaw(map.ip_blocklist);
                if (map.cancellation_default_policy !== undefined) setCancellationDefaultPolicyRaw(String(map.cancellation_default_policy));
                if (map.cancellation_vendor_override_enabled !== undefined) setCancellationVendorOverrideEnabledRaw(Boolean(map.cancellation_vendor_override_enabled));
                if (map.cancellation_flexible_full_refund_hours !== undefined) setCancellationFlexibleFullRefundHoursRaw(Number(map.cancellation_flexible_full_refund_hours));
                if (map.cancellation_moderate_full_refund_hours !== undefined) setCancellationModerateFullRefundHoursRaw(Number(map.cancellation_moderate_full_refund_hours));
                if (map.cancellation_moderate_partial_refund_hours !== undefined) setCancellationModeratePartialRefundHoursRaw(Number(map.cancellation_moderate_partial_refund_hours));
                if (map.cancellation_strict_partial_refund_hours !== undefined) setCancellationStrictPartialRefundHoursRaw(Number(map.cancellation_strict_partial_refund_hours));
                
                if (map.ses_region !== undefined) setSesRegionRaw(String(map.ses_region));
                if (map.ses_from_email !== undefined) setSesFromEmailRaw(String(map.ses_from_email));
                if (map.ses_from_name !== undefined) setSesFromNameRaw(String(map.ses_from_name));
                if (map.ses_configuration_set !== undefined) setSesConfigurationSetRaw(String(map.ses_configuration_set));
                if (map.whatsapp_api_url !== undefined) setWhatsappApiUrlRaw(String(map.whatsapp_api_url));
                if (map.whatsapp_phone_number_id !== undefined) setWhatsappPhoneNumberIdRaw(String(map.whatsapp_phone_number_id));
                if (map.whatsapp_access_token !== undefined) setWhatsappAccessTokenRaw(String(map.whatsapp_access_token));
                if (map.whatsapp_verify_token !== undefined) setWhatsappVerifyTokenRaw(String(map.whatsapp_verify_token));
            }
        } catch (err: any) {
            console.error("Configurations fetch failed:", err.message);
        } finally {
            setConfigurationsLoading(false);
        }
    }, []);

    // ────────── Gateway Settings: Fetch from backend (masked secrets) ──────────
    const refreshGatewaySettings = useCallback(async () => {
        setGatewaySettingsLoading(true);
        try {
            const res = await apiFetch<{ status: string; data: { gatewaySettings: GatewaySettings } }>("/configurations/gateway-settings");
            if (res.status === "success" && res.data?.gatewaySettings) {
                setGatewaySettings(res.data.gatewaySettings);
            }
        } catch (err: any) {
            console.error("Gateway settings fetch failed:", err.message);
        } finally {
            setGatewaySettingsLoading(false);
        }
    }, []);

    // ────────── Gateway Settings: Persist a single key (debounced) ──────────
    const saveGatewaySetting = useCallback((key: string, value: unknown) => {
        if (saveTimers.current[key]) {
            clearTimeout(saveTimers.current[key]);
        }
        saveTimers.current[key] = setTimeout(async () => {
            try {
                await apiFetch(`/configurations/${key}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value }),
                });
                // Refresh gateway settings after save so masked values reflect new state
                refreshGatewaySettings();
            } catch (err: any) {
                console.error(`Failed to save gateway setting ${key}:`, err.message);
            }
        }, 800);
    }, [refreshGatewaySettings]);

    // ────────── Gateway Settings: Test connectivity ──────────
    const testGateway = useCallback(async (gateway: "razorpay" | "payu"): Promise<GatewayTestResult> => {
        setGatewayTesting(true);
        setGatewayTestResult(null);
        try {
            const res = await apiFetch<{ status: string; data: { testResult: { success: boolean; message: string; details?: string } } }>("/configurations/gateway-settings/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway }),
            });
            if (res.status === "success" && res.data?.testResult) {
                const result: GatewayTestResult = {
                    gateway,
                    success: res.data.testResult.success,
                    message: res.data.testResult.message,
                    details: res.data.testResult.details,
                };
                setGatewayTestResult(result);
                return result;
            }
            const fail: GatewayTestResult = { gateway, success: false, message: "Unexpected response from server." };
            setGatewayTestResult(fail);
            return fail;
        } catch (err: any) {
            const fail: GatewayTestResult = { gateway, success: false, message: err.message || "Connection test failed." };
            setGatewayTestResult(fail);
            return fail;
        } finally {
            setGatewayTesting(false);
        }
    }, []);

    // Socket connection setup for real-time campaign stats and log streaming
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const socket = io(socketUrl, {
            transports: ["websocket"],
            auth: { token: localStorage.getItem("admin_token") },
        });

        socket.on("connect", () => {
            console.log("Socket connected to gateway:", socket.id);
        });

        socket.on("campaign:stats_update", (data: any) => {
            console.log("Campaign stats update received:", data);
            setCampaigns(prev => prev.map(c => {
                if (c.id === data.campaignId) {
                    let statusLabel: "Sent" | "Scheduled" | "Draft" | "Running" = "Draft";
                    if (data.status === "completed") statusLabel = "Sent";
                    else if (data.status === "running") statusLabel = "Running";
                    else if (data.status === "scheduled") statusLabel = "Scheduled";
                    
                    return {
                        ...c,
                        status: statusLabel,
                        analytics: {
                            sent: data.totalSent ?? c.analytics.sent,
                            opens: data.totalOpened ?? c.analytics.opens,
                            clicks: data.totalClicked ?? c.analytics.clicks,
                        }
                    };
                }
                return c;
            }));
        });

        socket.on("audit:new_log", (data: any) => {
            console.log("Real-time audit log received:", data);
            const mappedLog: AuditLog = {
                id: data.id || data._id,
                timestamp: data.createdAt ? new Date(data.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
                type: data.category === "security" ? "Security" : data.category === "webhook" ? "Webhook" : data.category === "sqs" ? "SQS Queue" : "System",
                event: `${data.action || "action"} — ${data.resource || "resource"} (${data.method || ""} ${data.path || ""})`,
                status: data.statusCode && data.statusCode < 400 ? "Success" : data.statusCode && data.statusCode < 500 ? "Failed" : "Blocked",
                details: data.details,
            };
            setAudits(prev => [mappedLog, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Initial fetch
    useEffect(() => {
        refreshKycApplications();
        refreshDashboard();
        refreshUsers();
        refreshProperties();
        refreshActivities();
        refreshBookings();
        refreshCoupons();
        refreshAudits();
        refreshFinancials();
        refreshDisputes();
        refreshCampaigns();
        refreshTemplates();
        refreshConfigurations();
        refreshGatewaySettings();
    }, []);

    // ────────── Handlers ──────────

    const handleApprove = useCallback(async (appId: string): Promise<void> => {
        try {
            const res = await apiFetch<{ status: string; message: string; data: HostApplication }>(
                `/kyc/${appId}/approve`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                }
            );
            if (res.status === "success") {
                setApplications(prev =>
                    prev.map(a => a._id === appId || a.id === appId
                        ? { ...a, kycStatus: "Approved" as const, status: "Approved" as const }
                        : a
                    )
                );
                setAudits(logs => [
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `KYC approved for ${res.data.name} (${res.data.email}). Host onboarding completed.`, status: "Success" },
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: KYC approval notification email queued for ${res.data.email}.`, status: "Success" },
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
            const res = await apiFetch<{ status: string; message: string; data: HostApplication }>(
                `/kyc/${appId}/reject`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                }
            );
            if (res.status === "success") {
                setApplications(prev =>
                    prev.map(a => a._id === appId || a.id === appId
                        ? { ...a, kycStatus: "Rejected" as const, status: "Rejected" as const }
                        : a
                    )
                );
                setAudits(logs => [
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `KYC rejected for ${res.data.name} (${res.data.email}).`, status: "Failed" },
                    { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `AWS SQS: KYC rejection notification email queued for ${res.data.email}.`, status: "Success" },
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

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCouponCode) return;
        try {
            const scope = newCouponType === "Global" ? "all" : newCouponType === "Stay-Specific" ? "stay" : "activity";
            const res = await apiFetch<{ status: string; data: any }>("/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: newCouponCode.toUpperCase(),
                    type: "percentage",
                    value: newCouponDiscount,
                    scope,
                    itemId: newCouponType !== "Global" ? newCouponTarget : undefined,
                    validFrom: new Date().toISOString(),
                    validUntil: new Date(newCouponExpiry).toISOString(),
                    minOrderValue: newCouponMinOrder,
                    usageLimit: newCouponLimit,
                    perUserLimit: 1,
                    isActive: true,
                }),
            });
            if (res.status === "success") {
                const c = res.data?.coupon || res.data;
                const targetName = newCouponType === "Global"
                    ? "All Stays & Experiences"
                    : newCouponType === "Stay-Specific"
                        ? (properties.find(p => p.id === newCouponTarget)?.title || newCouponTarget)
                        : (activities.find(a => a.id === newCouponTarget)?.title || newCouponTarget);
                const newCpn: Coupon = {
                    id: c.id || c._id || `CPN-${Date.now()}`,
                    code: c.code,
                    discountPercent: c.value,
                    type: newCouponType,
                    targetName,
                    expiryDate: c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "—",
                    status: c.isActive ? "Active" : "Expired",
                    usedCount: c.usedCount || 0,
                    usageLimit: c.usageLimit || 0,
                };
                setCoupons(prev => [newCpn, ...prev]);
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Coupon "${newCpn.code}" (${newCouponDiscount}%) created via API.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Coupon creation failed: ${err.message}`, status: "Failed" }, ...logs]);
        }
        setNewCouponCode("");
        setNewCouponTarget("");
        setNewCouponMinOrder(0);
        setNewCouponLimit(100);
    };

    const handleDeleteCoupon = useCallback(async (couponId: string) => {
        try {
            await apiFetch(`/coupons/${couponId}`, { method: "DELETE" });
            setCoupons(prev => prev.filter(c => c.id !== couponId && (c as any)._id !== couponId));
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Coupon ID ${couponId} deleted by administrator.`, status: "Success" }, ...logs]);
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to delete coupon ${couponId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    }, []);

    const handleLaunchCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampTitle || !newCampContent) return;
        const type = newCampChannel === "Twilio WhatsApp" ? "whatsapp" : newCampChannel === "Firebase Push" ? "push" : "email";
        const targetSegment = newCampGroup === "Guests" ? "guests" : newCampGroup === "Vendors" ? "hosts" : "all";
        
        try {
            const payload: any = {
                name: newCampTitle,
                type,
                subject: type === "email" ? (newCampSubject || newCampTitle) : undefined,
                content: newCampContent,
                targetSegment,
                status: newCampScheduled ? "scheduled" : "draft",
                scheduledAt: newCampScheduled && newCampScheduledAt ? new Date(newCampScheduledAt).toISOString() : undefined,
            };
            
            const res = await apiFetch<{ status: string; data: any }>("/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            if (res.status === "success" && res.data) {
                const c = res.data.campaign || res.data;
                let statusLabel: "Sent" | "Scheduled" | "Draft" | "Running" = newCampScheduled ? "Scheduled" : "Draft";
                let sentCount = 0;
                
                if (!newCampScheduled) {
                    try {
                        const execRes = await apiFetch<{ status: string; data: any }>(`/campaigns/${c.id || c._id}/execute`, { method: "POST" });
                        if (execRes.status === "success") {
                            statusLabel = "Sent";
                            const updatedC = execRes.data.campaign || execRes.data;
                            sentCount = updatedC.totalSent || updatedC.sent || 0;
                        }
                    } catch (execErr: any) {
                        console.error("Manual execution failed on launch:", execErr.message);
                    }
                }
                
                const newCamp: Campaign = {
                    id: c.id || c._id || `CMP-${Date.now()}`,
                    title: c.name || newCampTitle,
                    targetGroup: newCampGroup,
                    channel: newCampChannel,
                    scheduledTime: newCampScheduled && newCampScheduledAt 
                        ? new Date(newCampScheduledAt).toLocaleString() 
                        : "Immediate Dispatch",
                    status: statusLabel,
                    analytics: { sent: sentCount, opens: 0, clicks: 0 },
                };
                
                setCampaigns(prev => [newCamp, ...prev]);
                setAudits(logs => [
                    { 
                        id: `AUD-${Math.floor(Math.random() * 900) + 100}`, 
                        timestamp: new Date().toLocaleTimeString(), 
                        type: "SQS Queue", 
                        event: newCampScheduled 
                            ? `Campaign scheduled successfully for ${newCamp.scheduledTime}.` 
                            : `AWS SQS: Initialized Campaign Queue job ${newCamp.id} (${newCampChannel}). Dispatching to ${sentCount} targets.`, 
                        status: "Success" 
                    }, 
                    ...logs
                ]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `Campaign launch failed: ${err.message}`, status: "Failed" }, ...logs]);
        }
        setNewCampTitle("");
        setNewCampSubject("");
        setNewCampContent("");
        setNewCampScheduled(false);
        setNewCampScheduledAt("");
    };

    const handleExecuteCampaign = useCallback(async (campaignId: string) => {
        try {
            const res = await apiFetch<{ status: string; data: any }>(`/campaigns/${campaignId}/execute`, { method: "POST" });
            if (res.status === "success") {
                const c = res.data.campaign || res.data;
                setCampaigns(prev => prev.map(cmp => {
                    if (cmp.id === campaignId) {
                        return {
                            ...cmp,
                            status: "Sent",
                            analytics: {
                                sent: c.totalSent || 0,
                                opens: c.totalOpened || 0,
                                clicks: c.totalClicked || 0,
                            }
                        };
                    }
                    return cmp;
                }));
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `Campaign ${campaignId} manually executed. Target count: ${c.totalSent || 0}.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "SQS Queue", event: `Campaign manual execution failed: ${err.message}`, status: "Failed" }, ...logs]);
        }
    }, []);

    const handleCancelCampaign = useCallback(async (campaignId: string) => {
        try {
            const res = await apiFetch<{ status: string; data: any }>(`/campaigns/${campaignId}/cancel`, { method: "POST" });
            if (res.status === "success") {
                setCampaigns(prev => prev.map(cmp => {
                    if (cmp.id === campaignId) {
                        return { ...cmp, status: "Draft" };
                    }
                    return cmp;
                }));
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign ${campaignId} scheduling cancelled. Status reset to Draft.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign cancellation failed: ${err.message}`, status: "Failed" }, ...logs]);
        }
    }, []);

    const handleDeleteCampaign = useCallback(async (campaignId: string) => {
        try {
            await apiFetch(`/campaigns/${campaignId}`, { method: "DELETE" });
            setCampaigns(prev => prev.filter(cmp => cmp.id !== campaignId));
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign ${campaignId} deleted.`, status: "Success" }, ...logs]);
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign deletion failed: ${err.message}`, status: "Failed" }, ...logs]);
        }
    }, []);

    const handleCreateTemplate = useCallback(async (template: { name: string; type: string; subject?: string; body: string }) => {
        try {
            const res = await apiFetch<{ status: string; data: { template: CampaignTemplate } }>("/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(template),
            });
            if (res.status === "success" && res.data?.template) {
                setTemplates(prev => [...prev, res.data.template]);
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign template "${template.name}" created successfully.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to create template: ${err.message}`, status: "Failed" }, ...logs]);
            throw err;
        }
    }, []);

    const handleUpdateTemplate = useCallback(async (id: string, template: { name?: string; type?: string; subject?: string; body?: string }) => {
        try {
            const res = await apiFetch<{ status: string; data: { template: CampaignTemplate } }>(`/templates/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(template),
            });
            if (res.status === "success" && res.data?.template) {
                setTemplates(prev => prev.map(t => t.id === id ? res.data.template : t));
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign template updated successfully.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to update template: ${err.message}`, status: "Failed" }, ...logs]);
            throw err;
        }
    }, []);

    const handleDeleteTemplate = useCallback(async (id: string) => {
        try {
            const res = await apiFetch<{ status: string }>(`/templates/${id}`, {
                method: "DELETE",
            });
            if (res.status === "success") {
                setTemplates(prev => prev.filter(t => t.id !== id));
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Campaign template deleted.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to delete template: ${err.message}`, status: "Failed" }, ...logs]);
            throw err;
        }
    }, []);

    const triggerPayoutModal = (vendorName: string, balance: number) => {
        setPayoutVendor({ name: vendorName, balance });
    };

    const executeManualPayout = async () => {
        if (!payoutVendor) return;
        try {
            // Resolve hostId from vendor name by searching users
            const host = users.find(u => u.name === payoutVendor.name);
            if (!host) {
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to resolve host for payout: ${payoutVendor.name}`, status: "Failed" }, ...logs]);
                return;
            }
            const res = await apiFetch<{ status: string; data: any }>("/payouts/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hostId: host.id, bookingIds: [] }),
            });
            if (res.status === "success" && res.data) {
                const receiptNum = res.data.payoutRef || res.data.invoiceNumber || `PAY-RC-${Math.floor(Math.random() * 90000) + 10000}`;
                setPayoutReceipt(receiptNum);
                setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Settled manual payout receipt ${receiptNum} to Host ${payoutVendor.name} totaling ₹${payoutVendor.balance.toLocaleString()}.`, status: "Success" }, ...logs]);
            }
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Manual payout failed for ${payoutVendor.name}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    };

    const closePayoutReceipt = () => {
        setPayoutVendor(null);
        setPayoutReceipt(null);
    };

    const toggleUserStatus = async (userId: string) => {
        try {
            await apiFetch(`/users/${userId}/toggle-status`, { method: "PATCH" });
            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    const nextStatus = u.status === "Active" ? "Blocked" : "Active";
                    const log: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `User ${userId} (${u.name}) has been ${nextStatus.toUpperCase()} by Administrator.`, status: "Success" };
                    setAudits(logs => [log, ...logs]);
                    return { ...u, status: nextStatus };
                }
                return u;
            }));
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `Failed to toggle user ${userId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    };

    const toggleListingStatus = async (listingId: string) => {
        try {
            await apiFetch(`/listings/${listingId}/toggle-status`, { method: "PATCH" });
            setProperties(prev => prev.map(p => {
                if (p.id === listingId) {
                    const nextStatus = p.status === "Active" ? "Suspended" : "Active";
                    const log: AuditLog = { id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `Listing ${listingId} (${p.title}) has been set to ${nextStatus.toUpperCase()} by Administrator.`, status: "Success" };
                    setAudits(logs => [log, ...logs]);
                    return { ...p, status: nextStatus };
                }
                return p;
            }));
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `Failed to toggle listing ${listingId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    };

    const handleAwardCoins = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForCoins) return;
        try {
            await apiFetch(`/users/${selectedUserForCoins.id}/wallet`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: awardAmount, reason: awardReason, type: "credit" }),
            });
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
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Wallet credit failed for ${selectedUserForCoins.name}: ${err.message}`, status: "Failed" }, ...logs]);
        }
        setSelectedUserForCoins(null);
        setAwardAmount(500);
        setAwardReason("Sign-up Promotional Credit");
    };

    const handleCancelAndRefundBooking = async (bookingId: string) => {
        try {
            await apiFetch(`/bookings/${bookingId}/cancel`, { method: "POST" });
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
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to cancel booking ${bookingId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    };

    const handleRefundDispute = async (disputeId: string) => {
        try {
            await apiFetch(`/disputes/${disputeId}/refund`, { method: "POST" });
            setDisputes(prev => prev.map(d => {
                if (d.id === disputeId) {
                    if (d.status !== "Pending") return d;
                    setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute ticket ${disputeId} resolved: Guest refunded for booking ${d.bookingId}.`, status: "Success" }, ...logs]);
                    return { ...d, status: "Resolved-Refunded" as const };
                }
                return d;
            }));
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute refund failed for ${disputeId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
    };

    const handleReleaseDispute = async (disputeId: string) => {
        try {
            await apiFetch(`/disputes/${disputeId}/release`, { method: "POST" });
            setDisputes(prev => prev.map(d => {
                if (d.id === disputeId) {
                    if (d.status !== "Pending") return d;
                    setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute ticket ${disputeId} resolved: Payout funds released to Host (${d.hostName}) for booking ${d.bookingId}.`, status: "Success" }, ...logs]);
                    return { ...d, status: "Resolved-PaidVendor" as const };
                }
                return d;
            }));
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Dispute release failed for ${disputeId}: ${err.message}`, status: "Failed" }, ...logs]);
        }
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

    const handleSaveListing = async (updatedProperty: Property) => {
        try {
            await apiFetch(`/listings/${updatedProperty.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ price: updatedProperty.price, title: updatedProperty.title, status: updatedProperty.status }),
            });
            setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Listing ${updatedProperty.id} details updated by administrator: price ₹${updatedProperty.price.toLocaleString()}.`, status: "Success" }, ...logs]);
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "System", event: `Failed to update listing ${updatedProperty.id}: ${err.message}`, status: "Failed" }, ...logs]);
        }
        setSelectedPropertyForEdit(null);
    };

    const handleSaveUser = async (updatedUser: PlatformUser) => {
        try {
            await apiFetch(`/users/${updatedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, kycStatus: updatedUser.kycStatus }),
            });
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `User ${updatedUser.id} profile configuration modified: KYC status set to ${updatedUser.kycStatus}.`, status: "Success" }, ...logs]);
        } catch (err: any) {
            setAudits(logs => [{ id: `AUD-${Math.floor(Math.random() * 900) + 100}`, timestamp: new Date().toLocaleTimeString(), type: "Security", event: `Failed to update user ${updatedUser.id}: ${err.message}`, status: "Failed" }, ...logs]);
        }
        setSelectedUserForEdit(null);
    };

    // Computed
    const pendingApprovalsCount = applications.filter(app => app.status === "Pending").length;
    const pendingDisputesCount = disputes.filter(d => d.status === "Pending").length;
    const unreadChatsCount = chatRooms.reduce((sum, r) => sum + r.unreadCount, 0);

    const value: AdminContextType = {
        users, setUsers,
        applications, setApplications, properties, setProperties, activities, setActivities, bookings, coupons, campaigns, templates, audits, setAudits, disputes, chatRooms,
        dashboardStats, dashboardLoading, refreshDashboard,
        kycLoading, kycError, kycFilter, setKycFilter, refreshKycApplications,
        usersLoading, refreshUsers,
        propertiesLoading, refreshProperties,
        activitiesLoading, refreshActivities,
        bookingsLoading, refreshBookings,
        couponsLoading, refreshCoupons,
        auditsLoading, refreshAudits,
        disputesLoading, refreshDisputes,
        campaignsLoading, refreshCampaigns,
        templatesLoading, refreshTemplates,
        commissionSummary, hostBreakdown, payouts, financialsLoading, refreshFinancials,
        commissionRate, setCommissionRate, gstRate, setGstRate, platformFeeRate, setPlatformFeeRate,
        payoutMinThreshold, setPayoutMinThreshold, autoPayoutEnabled, setAutoPayoutEnabled,
        rateLimit, setRateLimit, rateLimitAuthMax, setRateLimitAuthMax,
        bookingExpiryMinutes, setBookingExpiryMinutes, maintenanceMode, setMaintenanceMode,
        whatsappNotificationsEnabled, setWhatsappNotificationsEnabled,
        mfaEnforced, setMfaEnforced, globalSiteTitle, setGlobalSiteTitle,
        globalMetaDescription, setGlobalMetaDescription, ipBlocklist, setIpBlocklist,
        cancellationDefaultPolicy, setCancellationDefaultPolicy,
        cancellationVendorOverrideEnabled, setCancellationVendorOverrideEnabled,
        cancellationFlexibleFullRefundHours, setCancellationFlexibleFullRefundHours,
        cancellationModerateFullRefundHours, setCancellationModerateFullRefundHours,
        cancellationModeratePartialRefundHours, setCancellationModeratePartialRefundHours,
        cancellationStrictPartialRefundHours, setCancellationStrictPartialRefundHours,
        configurationsLoading, refreshConfigurations, saveConfiguration,
        sesRegion, setSesRegion, sesFromEmail, setSesFromEmail, sesFromName, setSesFromName, sesConfigurationSet, setSesConfigurationSet,
        whatsappApiUrl, setWhatsappApiUrl, whatsappPhoneNumberId, setWhatsappPhoneNumberId, whatsappAccessToken, setWhatsappAccessToken, whatsappVerifyToken, setWhatsappVerifyToken,
        gatewaySettings, gatewaySettingsLoading, refreshGatewaySettings, saveGatewaySetting,
        testGateway, gatewayTestResult, gatewayTesting,
        searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
        selectedKycApp, setSelectedKycApp, payoutVendor, setPayoutVendor, payoutReceipt, setPayoutReceipt,
        selectedInvoiceBooking, setSelectedInvoiceBooking, selectedPropertyForEdit, setSelectedPropertyForEdit,
        selectedUserForEdit, setSelectedUserForEdit, selectedUserForCoins, setSelectedUserForCoins,
        awardAmount, setAwardAmount, awardReason, setAwardReason,
        newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount,
        newCouponType, setNewCouponType, newCouponTarget, setNewCouponTarget,
        newCouponExpiry, setNewCouponExpiry, newCouponMinOrder, setNewCouponMinOrder,
        newCouponLimit, setNewCouponLimit,
        newCampTitle, setNewCampTitle, newCampGroup, setNewCampGroup, newCampChannel, setNewCampChannel,
        newCampSubject, setNewCampSubject, newCampContent, setNewCampContent, newCampScheduled, setNewCampScheduled, newCampScheduledAt, setNewCampScheduledAt,
        handleApprove, handleReject, handleCreateCoupon, handleDeleteCoupon, handleLaunchCampaign,
        handleExecuteCampaign, handleCancelCampaign, handleDeleteCampaign,
        handleCreateTemplate, handleUpdateTemplate, handleDeleteTemplate,
        triggerPayoutModal, executeManualPayout, closePayoutReceipt, toggleUserStatus, toggleListingStatus, handleAwardCoins,
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