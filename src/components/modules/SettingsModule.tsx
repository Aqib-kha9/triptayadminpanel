import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import {
  Coins,
  ShieldCheck,
  Lock,
  AlertOctagon,
  Sliders,
  Globe,
  Plus,
  X,
  Link2,
  Mail,
  Layout,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Zap,
  Loader2,
  Building2,
  Banknote,
  CalendarX,
  Clock,
  RotateCcw,
} from "lucide-react";

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

interface SettingsModuleProps {
  commissionRate: number;
  setCommissionRate: (rate: number) => void;
  gstRate: number;
  setGstRate: (rate: number) => void;
  platformFeeRate: number;
  setPlatformFeeRate: (rate: number) => void;
  payoutMinThreshold: number;
  setPayoutMinThreshold: (v: number) => void;
  autoPayoutEnabled: boolean;
  setAutoPayoutEnabled: (enabled: boolean) => void;
  rateLimit: number;
  setRateLimit: (limit: number) => void;
  rateLimitAuthMax: number;
  setRateLimitAuthMax: (limit: number) => void;
  bookingExpiryMinutes: number;
  setBookingExpiryMinutes: (minutes: number) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  whatsappNotificationsEnabled: boolean;
  setWhatsappNotificationsEnabled: (enabled: boolean) => void;
  mfaEnforced: boolean;
  setMfaEnforced: (enabled: boolean) => void;
  globalSiteTitle: string;
  setGlobalSiteTitle: (title: string) => void;
  globalMetaDescription: string;
  setGlobalMetaDescription: (desc: string) => void;
  ipBlocklist: string[];
  setIpBlocklist: React.Dispatch<React.SetStateAction<string[]>>;
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
  saveGatewaySetting: (key: string, value: unknown) => void;
  testGateway: (gateway: "razorpay" | "payu") => Promise<GatewayTestResult>;
  gatewayTestResult: GatewayTestResult | null;
  gatewayTesting: boolean;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  commissionRate,
  setCommissionRate,
  gstRate,
  setGstRate,
  platformFeeRate,
  setPlatformFeeRate,
  payoutMinThreshold,
  setPayoutMinThreshold,
  autoPayoutEnabled,
  setAutoPayoutEnabled,
  rateLimit,
  setRateLimit,
  rateLimitAuthMax,
  setRateLimitAuthMax,
  bookingExpiryMinutes,
  setBookingExpiryMinutes,
  maintenanceMode,
  setMaintenanceMode,
  whatsappNotificationsEnabled,
  setWhatsappNotificationsEnabled,
  mfaEnforced,
  setMfaEnforced,
  globalSiteTitle,
  setGlobalSiteTitle,
  globalMetaDescription,
  setGlobalMetaDescription,
  ipBlocklist,
  setIpBlocklist,
  cancellationDefaultPolicy,
  setCancellationDefaultPolicy,
  cancellationVendorOverrideEnabled,
  setCancellationVendorOverrideEnabled,
  cancellationFlexibleFullRefundHours,
  setCancellationFlexibleFullRefundHours,
  cancellationModerateFullRefundHours,
  setCancellationModerateFullRefundHours,
  cancellationModeratePartialRefundHours,
  setCancellationModeratePartialRefundHours,
  cancellationStrictPartialRefundHours,
  setCancellationStrictPartialRefundHours,
  gatewaySettings,
  gatewaySettingsLoading,
  saveGatewaySetting,
  testGateway,
  gatewayTestResult,
  gatewayTesting,
}) => {
  const {
    sesRegion, setSesRegion, sesFromEmail, setSesFromEmail, sesFromName, setSesFromName, sesConfigurationSet, setSesConfigurationSet,
    whatsappApiUrl, setWhatsappApiUrl, whatsappPhoneNumberId, setWhatsappPhoneNumberId, whatsappAccessToken, setWhatsappAccessToken, whatsappVerifyToken, setWhatsappVerifyToken,
  } = useAdmin();

  const [newIp, setNewIp] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeGatewayTab, setActiveGatewayTab] = useState<"razorpay" | "payu">("razorpay");

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestGateway = async (gateway: "razorpay" | "payu") => {
    triggerSaveAlert(`Testing ${gateway} gateway connection...`);
    const result = await testGateway(gateway);
    triggerSaveAlert(result.success ? `${gateway} connection successful!` : `${gateway} test failed: ${result.message}`);
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(newIp.trim())) {
      alert("Please enter a valid IP address");
      return;
    }
    if (ipBlocklist.includes(newIp.trim())) return;
    setIpBlocklist(prev => [...prev, newIp.trim()]);
    setNewIp("");
    triggerSaveAlert("IP blocked successfully.");
  };

  const handleRemoveIp = (ip: string) => {
    setIpBlocklist(prev => prev.filter(item => item !== ip));
    triggerSaveAlert("IP removed from blocklist.");
  };

  const triggerSaveAlert = (message: string) => {
    setSaveStatus(message);
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Save Toast Notification */}
      {saveStatus && (
        <div className="fixed bottom-8 right-8 z-50 bg-zinc-950 border border-zinc-800 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight block">Configuration Synced</span>
            <span className="text-[10px] text-zinc-400 font-medium">{saveStatus}</span>
          </div>
        </div>
      )}

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Side: Financials & Integrations */}
        <div className="space-y-8">

          {/* Card 1: Financial & Payout Policies */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">Financial & Revenue Splits</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fee rates, payouts & automatic settlements</p>
              </div>
            </div>

            <div className="space-y-6 mt-4">
              {/* Commission Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Host Commission Fee</span>
                  <span className="text-primary font-black bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-xl">
                    {commissionRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={commissionRate}
                  onChange={(e) => {
                    setCommissionRate(parseInt(e.target.value));
                    triggerSaveAlert("Commission split updated successfully.");
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Rate cut deducted from host homestays and experience bookings.</p>
              </div>

              {/* GST rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>GST Rate (Goods & Services Tax)</span>
                  <span className="text-rose-500 font-black bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-xl">
                    {gstRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  value={gstRate}
                  onChange={(e) => {
                    setGstRate(parseInt(e.target.value));
                    triggerSaveAlert("GST tax config updated successfully.");
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Standard Indian hospitality GST surcharge applied during checkout.</p>
              </div>

              {/* Guest Platform Fee rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Guest Platform Service Fee</span>
                  <span className="text-indigo-600 font-black bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl">
                    {platformFeeRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={platformFeeRate}
                  onChange={(e) => {
                    setPlatformFeeRate(parseInt(e.target.value));
                    triggerSaveAlert("Platform service fee updated successfully.");
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Platform service surcharge charged to guest customers upon booking checkout.</p>
              </div>

              {/* Minimum Host Payout Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Min Host Payout Threshold</span>
                  <span className="text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                    ₹{payoutMinThreshold}
                  </span>
                </div>
                <input
                  type="number"
                  value={payoutMinThreshold}
                  onChange={(e) => {
                    setPayoutMinThreshold(Number(e.target.value) || 0);
                    triggerSaveAlert("Host payout minimum threshold updated.");
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Minimum accrued host balance required before payout trigger settles.</p>
              </div>

              {/* Automated Payout Toggle Switch */}
              <div className="border-t border-zinc-50 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Automated Payout Settlement</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Auto-transfer host balance via Razorpay Route API on booking check-out completion.</p>
                </div>
                <button
                  onClick={() => {
                    setAutoPayoutEnabled(!autoPayoutEnabled);
                    triggerSaveAlert(
                      !autoPayoutEnabled
                        ? "Automated payouts enabled. Live API active."
                        : "Switched to manual audit payout approval."
                    );
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${autoPayoutEnabled ? "bg-primary" : "bg-zinc-200"
                    }`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${autoPayoutEnabled ? "right-1" : "left-1"
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Enterprise API & Third-party Gateway Settings */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">Gateway & Third-Party Integrations</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SMS, Email, Payment Modes & Worker Queues</p>
              </div>
            </div>

            <div className="space-y-5 mt-4">
              {/* Meta WhatsApp */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-800 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      Meta WhatsApp API (Native)
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Send booking confirmations and status changes natively via Meta WhatsApp Cloud API.</p>
                  </div>
                  <button
                    onClick={() => {
                      setWhatsappNotificationsEnabled(!whatsappNotificationsEnabled);
                      triggerSaveAlert(
                        !whatsappNotificationsEnabled ? "WhatsApp notifications enabled." : "WhatsApp notifications muted."
                      );
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center ${whatsappNotificationsEnabled ? "bg-emerald-500" : "bg-zinc-200"
                      }`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${whatsappNotificationsEnabled ? "right-1" : "left-1"
                      }`} />
                  </button>
                </div>

                {whatsappNotificationsEnabled && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3 mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase">API Version URL</label>
                        <input
                          type="text"
                          value={whatsappApiUrl}
                          onChange={(e) => setWhatsappApiUrl(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                          placeholder="https://graph.facebook.com/v18.0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase">Phone Number ID</label>
                        <input
                          type="text"
                          value={whatsappPhoneNumberId}
                          onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                          placeholder="e.g. 1029837482"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase">Verify Handshake Token</label>
                        <input
                          type="text"
                          value={whatsappVerifyToken}
                          onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                          placeholder="triptay_verify"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase">System User Token</label>
                        <div className="relative">
                          <input
                            type={showSecrets.wa_access_token ? "text" : "password"}
                            value={whatsappAccessToken}
                            onChange={(e) => setWhatsappAccessToken(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 pr-10 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                            placeholder="Meta Access Token"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility("wa_access_token")}
                            className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600"
                          >
                            {showSecrets.wa_access_token ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AWS SES */}
              <div className="border-t border-zinc-50 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-800 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      AWS SES Transactional Emails
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Route system and booking invoice PDF generation through AWS Simple Email Service.</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black border border-emerald-100 uppercase tracking-widest">
                    Always Active
                  </span>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400 uppercase">SES Region</label>
                      <input
                        type="text"
                        value={sesRegion}
                        onChange={(e) => setSesRegion(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        placeholder="ap-south-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Sender Email</label>
                      <input
                        type="email"
                        value={sesFromEmail}
                        onChange={(e) => setSesFromEmail(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        placeholder="no-reply@triptay.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Sender Name</label>
                      <input
                        type="text"
                        value={sesFromName}
                        onChange={(e) => setSesFromName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        placeholder="Triptay"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Configuration Set</label>
                      <input
                        type="text"
                        value={sesConfigurationSet}
                        onChange={(e) => setSesConfigurationSet(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                        placeholder="triptay-tracking-set"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Security, Firewall & Metadata */}
        <div className="space-y-8">

          {/* Card 3: API Security Limits */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">API Security Limits</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Configure client rate-limiting parameters</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Global Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                    <span>Global Limit</span>
                    <span className="text-zinc-950 font-black">{rateLimit} req/m</span>
                  </div>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => {
                      setRateLimit(parseInt(e.target.value) || 60);
                      triggerSaveAlert("API global rate limit revised.");
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Auth Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                    <span>Auth Limit</span>
                    <span className="text-zinc-950 font-black">{rateLimitAuthMax} req/m</span>
                  </div>
                  <input
                    type="number"
                    value={rateLimitAuthMax}
                    onChange={(e) => {
                      setRateLimitAuthMax(parseInt(e.target.value) || 10);
                      triggerSaveAlert("Auth endpoints rate limit revised.");
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Booking Expiry */}
              <div className="space-y-2 border-t border-zinc-50 pt-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Instant Booking Expiry (Minutes)</span>
                  <span className="text-zinc-950 font-black">{bookingExpiryMinutes} mins</span>
                </div>
                <input
                  type="number"
                  value={bookingExpiryMinutes}
                  onChange={(e) => {
                    setBookingExpiryMinutes(parseInt(e.target.value) || 15);
                    triggerSaveAlert("Instant booking expiry timer updated.");
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Unpaid instant bookings are auto-released after this period.</p>
              </div>

              {/* MFA Toggle */}
              <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Enforce Multi-Factor Auth (MFA)</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Mandate OTP verification via SMS/Email for all Admin & Vendor logins.</p>
                </div>
                <button
                  onClick={() => {
                    setMfaEnforced(!mfaEnforced);
                    triggerSaveAlert(
                      !mfaEnforced ? "MFA enforcement activated." : "MFA settings set to optional."
                    );
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${mfaEnforced ? "bg-rose-500" : "bg-zinc-200"
                    }`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${mfaEnforced ? "right-1" : "left-1"
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: IP Address Blocklist */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-950 text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">IP Address Firewall Blocklist</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Throttled and permanently banned network nodes</p>
              </div>
            </div>

            {/* Blocklist form */}
            <form onSubmit={handleAddIp} className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Enter IP (e.g. 192.168.1.1)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-tight px-4 py-2 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Block
              </button>
            </form>

            {/* Blocked IP badges list */}
            <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
              {ipBlocklist.length === 0 ? (
                <p className="text-[10px] text-zinc-400 font-bold italic py-4 text-center">No active IP bans or throttling logs.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ipBlocklist.map(ip => (
                    <span
                      key={ip}
                      className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg px-2.5 py-1 text-[10px] font-black"
                    >
                      {ip}
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 5: SEO Configurations & Metadata */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">SEO & Global Portal Settings</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Metadata, titles, indexing & site status</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {/* Site Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Global Website Title</label>
                <input
                  type="text"
                  value={globalSiteTitle}
                  onChange={(e) => {
                    setGlobalSiteTitle(e.target.value);
                    triggerSaveAlert("Meta site title updated.");
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Global Meta Description</label>
                <textarea
                  rows={2}
                  value={globalMetaDescription}
                  onChange={(e) => {
                    setGlobalMetaDescription(e.target.value);
                    triggerSaveAlert("Global description SEO tag updated.");
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                <div>
                  <h4 className="text-xs font-black text-rose-600">Portal Maintenance Mode</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Restrict client traffic with a 503 Service Unavailable screen.</p>
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    triggerSaveAlert(
                      !maintenanceMode ? "Maintenance mode activated. Public access restricted." : "Portal live operations restored."
                    );
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${maintenanceMode ? "bg-rose-600 animate-pulse" : "bg-zinc-200"
                    }`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${maintenanceMode ? "right-1" : "left-1"
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 6: IAM Permissions Matrix */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">IAM Permissions Matrix</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Standard Role Based Access Control allocations</p>
              </div>
            </div>

            <div className="space-y-4 mt-4 text-xs font-bold text-zinc-700">

              {/* Guest RBAC block */}
              <div className="p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-primary/10 text-primary text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">Guest Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Browse stays & experiences, execute online wallet bookings, cancel reservations, submit dispute tickets, switch active profiles to Vendor.
                </p>
              </div>

              {/* Vendor RBAC block */}
              <div className="p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-blue-50 text-blue-600 text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">Vendor Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Publish stays & activities listings, configure availability calendar, receive booking notifications, claim settlements, chat with booked guests.
                </p>
              </div>

              {/* Admin RBAC block */}
              <div className="p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-zinc-900 text-white text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">Admin Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Modify system configurations, approve/reject listing applications, moderate disputes & refunds, award promotional coins, inspect API system audit queues.
                </p>
              </div>

              {/* Security Warning Alert */}
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-[10px] text-rose-500 font-bold leading-normal">
                <AlertOctagon className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-black uppercase tracking-tight block mb-0.5">System Security Directive</span>
                  Modifying core access levels requires superadmin verification keys. Changing permissions in live production alters OAuth and JWT authorization tokens across clusters.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────── Payment Gateway Settings (Full Width) ─────────────── */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 tracking-tight">Payment Gateway Configuration</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Razorpay & PayU — Live/Test credentials, webhooks & routing</p>
            </div>
          </div>
          {gatewaySettingsLoading && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading gateway settings...
            </div>
          )}
        </div>

        {/* Default Gateway & Fallback Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Default Payment Gateway
            </label>
            <select
              value={gatewaySettings?.defaultGateway || "razorpay"}
              onChange={(e) => {
                saveGatewaySetting("default_payment_gateway", e.target.value);
                triggerSaveAlert(`Default gateway set to ${e.target.value}.`);
              }}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="razorpay">Razorpay</option>
              <option value="payu">PayU</option>
            </select>
            <p className="text-[9px] text-zinc-400 font-bold">Primary gateway used for new checkout transactions.</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-zinc-800">Gateway Fallback Enabled</h4>
              <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Auto-retry failed payments on the next configured gateway.</p>
            </div>
            <button
              onClick={() => {
                const newVal = !(gatewaySettings?.fallbackEnabled ?? true);
                saveGatewaySetting("payment_gateway_fallback_enabled", String(newVal));
                triggerSaveAlert(newVal ? "Gateway fallback enabled." : "Gateway fallback disabled.");
              }}
              className={`w-12 h-6 rounded-full transition-all relative flex items-center ${gatewaySettings?.fallbackEnabled ? "bg-primary" : "bg-zinc-200"}`}
            >
              <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${gatewaySettings?.fallbackEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
        </div>

        {/* Gateway Tabs */}
        <div className="flex gap-2 border-b border-zinc-100 pb-3">
          {(["razorpay", "payu"] as const).map((gw) => (
            <button
              key={gw}
              onClick={() => setActiveGatewayTab(gw)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all capitalize flex items-center gap-2 ${activeGatewayTab === gw
                ? "bg-zinc-900 text-white shadow-lg"
                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
            >
              {gw === "razorpay" && <Banknote className="w-3.5 h-3.5" />}
              {gw === "payu" && <Building2 className="w-3.5 h-3.5" />}
              {gw}
              {gatewaySettings && (
                <span className={`w-1.5 h-1.5 rounded-full ${gatewaySettings[gw].enabled ? "bg-emerald-400" : "bg-zinc-400"}`} />
              )}
            </button>
          ))}
        </div>

        {/* ─────────── Razorpay Section ─────────── */}
        {activeGatewayTab === "razorpay" && gatewaySettings && (
          <div className="space-y-5">
            {/* Enable & Live Mode Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Enable Razorpay</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Activate Razorpay as a payment option.</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !gatewaySettings.razorpay.enabled;
                    saveGatewaySetting("razorpay_enabled", String(newVal));
                    triggerSaveAlert(newVal ? "Razorpay gateway enabled." : "Razorpay gateway disabled.");
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${gatewaySettings.razorpay.enabled ? "bg-emerald-500" : "bg-zinc-200"}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${gatewaySettings.razorpay.enabled ? "right-1" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Live Mode</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Use production keys. Disable for test/sandbox.</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !gatewaySettings.razorpay.liveMode;
                    saveGatewaySetting("razorpay_live_mode", String(newVal));
                    triggerSaveAlert(newVal ? "Razorpay LIVE mode activated." : "Razorpay TEST mode activated.");
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${gatewaySettings.razorpay.liveMode ? "bg-amber-500" : "bg-zinc-200"}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${gatewaySettings.razorpay.liveMode ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Live Credentials */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Live Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Key ID</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.razorpay.keyId}
                    onBlur={(e) => { saveGatewaySetting("razorpay_key_id", e.target.value); triggerSaveAlert("Razorpay Key ID saved."); }}
                    placeholder="rzp_live_XXXXXXXX"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Key Secret
                    {gatewaySettings.razorpay.keySecretConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["rzp_key_secret"] ? "text" : "password"}
                      defaultValue={gatewaySettings.razorpay.keySecret}
                      onBlur={(e) => { saveGatewaySetting("razorpay_key_secret", e.target.value); triggerSaveAlert("Razorpay Key Secret saved."); }}
                      placeholder="Enter secret key"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("rzp_key_secret")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["rzp_key_secret"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Webhook Secret
                    {gatewaySettings.razorpay.webhookSecretConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["rzp_webhook"] ? "text" : "password"}
                      defaultValue={gatewaySettings.razorpay.webhookSecret}
                      onBlur={(e) => { saveGatewaySetting("razorpay_webhook_secret", e.target.value); triggerSaveAlert("Razorpay Webhook Secret saved."); }}
                      placeholder="Webhook signing secret"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("rzp_webhook")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["rzp_webhook"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Account / Linked ID</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.razorpay.accountId}
                    onBlur={(e) => { saveGatewaySetting("razorpay_account_id", e.target.value); triggerSaveAlert("Razorpay Account ID saved."); }}
                    placeholder="acc_XXXXXXXX (for Route/payouts)"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600">Webhook URL</label>
                <input
                  type="text"
                  defaultValue={gatewaySettings.razorpay.webhookUrl}
                  onBlur={(e) => { saveGatewaySetting("razorpay_webhook_url", e.target.value); triggerSaveAlert("Razorpay Webhook URL saved."); }}
                  placeholder="https://api.yourdomain.com/api/payments/webhook/razorpay"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Test Credentials */}
            <div className="space-y-3 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Test / Sandbox Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Test Key ID</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.razorpay.testKeyId}
                    onBlur={(e) => { saveGatewaySetting("razorpay_test_key_id", e.target.value); triggerSaveAlert("Razorpay Test Key ID saved."); }}
                    placeholder="rzp_test_XXXXXXXX"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Test Key Secret
                    {gatewaySettings.razorpay.testKeySecretConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["rzp_test_secret"] ? "text" : "password"}
                      defaultValue={gatewaySettings.razorpay.testKeySecret}
                      onBlur={(e) => { saveGatewaySetting("razorpay_test_key_secret", e.target.value); triggerSaveAlert("Razorpay Test Key Secret saved."); }}
                      placeholder="Enter test secret key"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("rzp_test_secret")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["rzp_test_secret"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <button
                onClick={() => handleTestGateway("razorpay")}
                disabled={gatewayTesting}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-tight px-5 py-2.5 flex items-center gap-2 transition-all"
              >
                {gatewayTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Test Connection
              </button>
              {gatewayTestResult && gatewayTestResult.gateway === "razorpay" && (
                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${gatewayTestResult.success ? "text-emerald-600" : "text-rose-500"}`}>
                  {gatewayTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {gatewayTestResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────── PayU Section ─────────── */}
        {activeGatewayTab === "payu" && gatewaySettings && (
          <div className="space-y-5">
            {/* Enable & Live Mode Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Enable PayU</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Activate PayU as a payment option.</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !gatewaySettings.payu.enabled;
                    saveGatewaySetting("payu_enabled", String(newVal));
                    triggerSaveAlert(newVal ? "PayU gateway enabled." : "PayU gateway disabled.");
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${gatewaySettings.payu.enabled ? "bg-emerald-500" : "bg-zinc-200"}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${gatewaySettings.payu.enabled ? "right-1" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Live Mode</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Use production credentials. Disable for test mode.</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !gatewaySettings.payu.liveMode;
                    saveGatewaySetting("payu_live_mode", String(newVal));
                    triggerSaveAlert(newVal ? "PayU LIVE mode activated." : "PayU TEST mode activated.");
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center ${gatewaySettings.payu.liveMode ? "bg-amber-500" : "bg-zinc-200"}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all ${gatewaySettings.payu.liveMode ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Live Credentials */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Live Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Merchant ID (MID)</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.merchantId}
                    onBlur={(e) => { saveGatewaySetting("payu_merchant_id", e.target.value); triggerSaveAlert("PayU Merchant ID saved."); }}
                    placeholder="13315558"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Merchant Key</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.key}
                    onBlur={(e) => { saveGatewaySetting("payu_key", e.target.value); triggerSaveAlert("PayU Merchant Key saved."); }}
                    placeholder="Merchant key"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Merchant Salt
                    {gatewaySettings.payu.saltConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["payu_salt"] ? "text" : "password"}
                      defaultValue={gatewaySettings.payu.salt}
                      onBlur={(e) => { saveGatewaySetting("payu_salt", e.target.value); triggerSaveAlert("PayU Salt saved."); }}
                      placeholder="Merchant salt"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("payu_salt")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["payu_salt"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Webhook Salt
                    {gatewaySettings.payu.webhookSaltConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["payu_webhook_salt"] ? "text" : "password"}
                      defaultValue={gatewaySettings.payu.webhookSalt}
                      onBlur={(e) => { saveGatewaySetting("payu_webhook_salt", e.target.value); triggerSaveAlert("PayU Webhook Salt saved."); }}
                      placeholder="Webhook verification salt"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("payu_webhook_salt")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["payu_webhook_salt"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* URLs Configuration */}
            <div className="space-y-3 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">URLs & Endpoints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Base URL (API)</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.baseUrl}
                    onBlur={(e) => { saveGatewaySetting("payu_base_url", e.target.value); triggerSaveAlert("PayU Base URL saved."); }}
                    placeholder="https://secure.payu.in"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Payment Handle URL</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.paymentHandleUrl}
                    onBlur={(e) => { saveGatewaySetting("payu_payment_handle_url", e.target.value); triggerSaveAlert("PayU Payment Handle URL saved."); }}
                    placeholder="https://u.payu.in/..."
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Success URL</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.successUrl}
                    onBlur={(e) => { saveGatewaySetting("payu_success_url", e.target.value); triggerSaveAlert("PayU Success URL saved."); }}
                    placeholder="https://yoursite.com/checkout/payu/success"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Failure URL</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.failureUrl}
                    onBlur={(e) => { saveGatewaySetting("payu_failure_url", e.target.value); triggerSaveAlert("PayU Failure URL saved."); }}
                    placeholder="https://yoursite.com/checkout/payu/failure"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Test Credentials */}
            <div className="space-y-3 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Test / Sandbox Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Test Merchant ID</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.testMerchantId}
                    onBlur={(e) => { saveGatewaySetting("payu_test_merchant_id", e.target.value); triggerSaveAlert("PayU Test MID saved."); }}
                    placeholder="Test MID"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600">Test Key</label>
                  <input
                    type="text"
                    defaultValue={gatewaySettings.payu.testKey}
                    onBlur={(e) => { saveGatewaySetting("payu_test_key", e.target.value); triggerSaveAlert("PayU Test Key saved."); }}
                    placeholder="Test key"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5">
                    Test Salt
                    {gatewaySettings.payu.testSaltConfigured ? (
                      <span className="flex items-center gap-0.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Configured</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-rose-400"><XCircle className="w-3 h-3" /> Not set</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets["payu_test_salt"] ? "text" : "password"}
                      defaultValue={gatewaySettings.payu.testSalt}
                      onBlur={(e) => { saveGatewaySetting("payu_test_salt", e.target.value); triggerSaveAlert("PayU Test Salt saved."); }}
                      placeholder="Test salt"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="button" onClick={() => toggleSecretVisibility("payu_test_salt")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showSecrets["payu_test_salt"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <button
                onClick={() => handleTestGateway("payu")}
                disabled={gatewayTesting}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-tight px-5 py-2.5 flex items-center gap-2 transition-all"
              >
                {gatewayTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Test Connection
              </button>
              {gatewayTestResult && gatewayTestResult.gateway === "payu" && (
                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${gatewayTestResult.success ? "text-emerald-600" : "text-rose-500"}`}>
                  {gatewayTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {gatewayTestResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading / Empty State */}
        {!gatewaySettings && !gatewaySettingsLoading && (
          <div className="text-center py-8 text-[10px] text-zinc-400 font-bold">
            Unable to load gateway settings. Please refresh the page.
          </div>
        )}
      </div>

      {/* ─────────────── Cancellation Policy Settings (Full Width) ─────────────── */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <CalendarX className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Cancellation Policy Configuration</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Global defaults, vendor override permission & refund time windows</p>
          </div>
        </div>

        {/* Global Default Policy + Vendor Override Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Policy Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 flex items-center gap-1.5 uppercase tracking-wider">
              <RotateCcw className="w-3 h-3" />
              Global Default Policy
            </label>
            <select
              value={cancellationDefaultPolicy}
              onChange={(e) => {
                setCancellationDefaultPolicy(e.target.value);
                triggerSaveAlert("Default cancellation policy updated");
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
            >
              <option value="Flexible">Flexible — Full refund up to 24h before check-in</option>
              <option value="Moderate">Moderate — Full refund 5 days, 50% refund 2 days before</option>
              <option value="Strict">Strict — 50% refund up to 7 days before check-in</option>
              <option value="Non-Refundable">Non-Refundable — No refund on cancellation</option>
            </select>
            <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">
              Applied to all listings & activities when vendor override is disabled or no vendor policy is set.
            </p>
          </div>

          {/* Vendor Override Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Allow Vendor Override
            </label>
            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-black text-zinc-900">
                  {cancellationVendorOverrideEnabled ? "Vendors can set own policy" : "Vendors use global default only"}
                </p>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                  {cancellationVendorOverrideEnabled
                    ? "Each vendor can choose Flexible / Moderate / Strict / Non-Refundable per listing."
                    : "All listings & activities forced to use the global default policy above."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCancellationVendorOverrideEnabled(!cancellationVendorOverrideEnabled);
                  triggerSaveAlert(cancellationVendorOverrideEnabled ? "Vendor override disabled" : "Vendor override enabled");
                }}
                className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${cancellationVendorOverrideEnabled ? "bg-emerald-500" : "bg-zinc-300"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white shadow absolute transition-all top-1 ${cancellationVendorOverrideEnabled ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Configurable Time Windows */}
        <div className="border-t border-zinc-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h4 className="text-xs font-black text-zinc-900 tracking-tight">Refund Time Windows (in hours before check-in)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Flexible Full Refund Hours */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Flexible — Full Refund Before</label>
              <input
                type="number"
                min={1}
                max={720}
                value={cancellationFlexibleFullRefundHours}
                onChange={(e) => {
                  setCancellationFlexibleFullRefundHours(Number(e.target.value));
                  triggerSaveAlert("Flexible policy window updated");
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
              />
              <p className="text-[10px] text-zinc-400 font-bold">Default: 24h. Within this window = 50% refund.</p>
            </div>

            {/* Moderate Full Refund Hours */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Moderate — Full Refund Before</label>
              <input
                type="number"
                min={1}
                max={720}
                value={cancellationModerateFullRefundHours}
                onChange={(e) => {
                  setCancellationModerateFullRefundHours(Number(e.target.value));
                  triggerSaveAlert("Moderate full refund window updated");
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
              <p className="text-[10px] text-zinc-400 font-bold">Default: 120h (5 days). After this = 50% refund.</p>
            </div>

            {/* Moderate Partial Refund Hours */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Moderate — 50% Refund Before</label>
              <input
                type="number"
                min={1}
                max={720}
                value={cancellationModeratePartialRefundHours}
                onChange={(e) => {
                  setCancellationModeratePartialRefundHours(Number(e.target.value));
                  triggerSaveAlert("Moderate partial refund window updated");
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
              />
              <p className="text-[10px] text-zinc-400 font-bold">Default: 48h (2 days). Within this = no refund.</p>
            </div>

            {/* Strict Partial Refund Hours */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Strict — 50% Refund Before</label>
              <input
                type="number"
                min={1}
                max={720}
                value={cancellationStrictPartialRefundHours}
                onChange={(e) => {
                  setCancellationStrictPartialRefundHours(Number(e.target.value));
                  triggerSaveAlert("Strict policy window updated");
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
              />
              <p className="text-[10px] text-zinc-400 font-bold">Default: 168h (7 days). Within this = no refund.</p>
            </div>
          </div>
        </div>

        {/* Policy Summary Preview */}
        <div className="border-t border-zinc-100 pt-6">
          <div className="p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Active Policy Summary</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-bold text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Flexible: Full refund if cancelled before {cancellationFlexibleFullRefundHours}h, else 50%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Moderate: Full refund before {cancellationModerateFullRefundHours}h, 50% before {cancellationModeratePartialRefundHours}h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Strict: 50% refund before {cancellationStrictPartialRefundHours}h, else 0%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>Non-Refundable: 0% refund always</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 mt-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${cancellationVendorOverrideEnabled ? "text-emerald-500" : "text-zinc-400"}`} />
              <span className="text-[10px] font-bold text-zinc-500">
                Vendor Override: {cancellationVendorOverrideEnabled ? "Enabled — vendors can customize per listing" : "Disabled — all listings use global default"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
