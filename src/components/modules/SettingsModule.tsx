import React, { useState } from "react";
import { 
  Coins, 
  ShieldCheck, 
  Lock, 
  AlertOctagon, 
  Sliders, 
  Globe, 
  Plus, 
  X
} from "lucide-react";

interface SettingsModuleProps {
  commissionRate: number;
  setCommissionRate: (rate: number) => void;
  gstRate: number;
  setGstRate: (rate: number) => void;
  autoPayoutEnabled: boolean;
  setAutoPayoutEnabled: (enabled: boolean) => void;
  rateLimit: number;
  setRateLimit: (limit: number) => void;
  ipBlocklist: string[];
  setIpBlocklist: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  commissionRate,
  setCommissionRate,
  gstRate,
  setGstRate,
  autoPayoutEnabled,
  setAutoPayoutEnabled,
  rateLimit,
  setRateLimit,
  ipBlocklist,
  setIpBlocklist
}) => {
  const [newIp, setNewIp] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    // Simple IP validation
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
    <div className="space-y-8">
      {/* Save Toast Notification */}
      {saveStatus && (
        <div className="fixed bottom-8 right-8 z-50 bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black tracking-tight">{saveStatus}</span>
        </div>
      )}

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Financial Policy Controls & Security API Limits */}
        <div className="space-y-8">
          
          {/* Card 1: Financial & Payout Policies */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">Financial & Fee Splits</h3>
                <p className="text-[10px] text-zinc-400 font-bold">Commission rate, GST levels and automatic settlements</p>
              </div>
            </div>

            <div className="space-y-5 mt-4">
              {/* Commission Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Platform Commission Fee</span>
                  <span className="text-primary font-black bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-lg">
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
                <p className="text-[9px] text-zinc-400 font-bold">Standard rate cut deducted from homestay & experiences base values.</p>
              </div>

              {/* GST rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>GST Rate (Goods & Services Tax)</span>
                  <span className="text-rose-500 font-black bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
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
                <p className="text-[9px] text-zinc-400 font-bold">Mandatory Indian hospitality GST surcharge applied during billing checkout.</p>
              </div>

              {/* Automated Payout Toggle Switch */}
              <div className="border-t border-zinc-50 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">Automated Payout Settlement</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Auto-transfer host balance via Razorpay route API upon booking completion</p>
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
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                    autoPayoutEnabled ? "bg-primary" : "bg-zinc-200"
                  }`}
                >
                  <span className={`h-4.5 w-4.5 rounded-full bg-white shadow absolute transition-all ${
                    autoPayoutEnabled ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Security Thresholds & Rate Limiting */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">API Security Limits</h3>
                <p className="text-[10px] text-zinc-400 font-bold">Configure client rate-limiting parameters</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>API Request Rate Limit</span>
                  <span className="text-zinc-950 font-black">{rateLimit} req / min</span>
                </div>
                <input 
                  type="number"
                  value={rateLimit}
                  onChange={(e) => {
                    setRateLimit(parseInt(e.target.value) || 60);
                    triggerSaveAlert("API throttling thresholds revised.");
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <p className="text-[9px] text-zinc-400 font-bold">Max API request allotment per unique client IP address before HTTP 429 too-many-requests is served.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: IP Firewalls & Access Controls */}
        <div className="space-y-8">
          
          {/* Card 3: IP Address Blocklist */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">IP Address Firewall Blocklist</h3>
                <p className="text-[10px] text-zinc-400 font-bold">Throttled and permanently banned network nodes</p>
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

          {/* Card 4: RBAC (Role Based Access Control) Matrix */}
          <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">IAM Permissions Matrix</h3>
                <p className="text-[10px] text-zinc-400 font-bold">Standard Role Based Access Control allocations</p>
              </div>
            </div>

            <div className="space-y-4 mt-4 text-xs font-bold text-zinc-700">
              
              {/* Guest RBAC block */}
              <div className="p-3 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-primary/10 text-primary text-[8px] font-black tracking-tight px-2 py-0.5 rounded-full uppercase">Guest Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Browse stays & experiences, execute online wallet bookings, cancel reservations, submit dispute tickets, switch active profiles to Vendor.
                </p>
              </div>

              {/* Vendor RBAC block */}
              <div className="p-3 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-blue-50 text-blue-600 text-[8px] font-black tracking-tight px-2 py-0.5 rounded-full uppercase">Vendor Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Publish stays & activities listings, configure availability calendar, receive booking notifications, claim settlements, chat with booked guests.
                </p>
              </div>

              {/* Admin RBAC block */}
              <div className="p-3 bg-zinc-50 border border-zinc-100/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-zinc-900 text-white text-[8px] font-black tracking-tight px-2 py-0.5 rounded-full uppercase">Admin Role</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  Modify system configurations, approve/reject listing applications, moderate disputes & refunds, award promotional coins, inspect API system audit queues.
                </p>
              </div>

              {/* Security Warning Alert */}
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-[10px] text-rose-500 font-bold leading-normal">
                <AlertOctagon className="w-5.5 h-5.5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-black uppercase tracking-tight block mb-0.5">System Security Directive</span>
                  Modifying core access levels requires superadmin verification keys. Changing permissions in live production alters OAuth and JWT authorization tokens across clusters.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
