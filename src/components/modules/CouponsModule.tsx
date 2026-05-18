import React from "react";
import { Plus, Send } from "lucide-react";
import type { Coupon, Campaign } from "../../types";

interface CouponsModuleProps {
  coupons: Coupon[];
  campaigns: Campaign[];
  newCouponCode: string;
  setNewCouponCode: (code: string) => void;
  newCouponDiscount: number;
  setNewCouponDiscount: (discount: number) => void;
  newCouponType: "Global" | "Stay-Specific" | "Activity-Specific";
  setNewCouponType: (type: any) => void;
  newCouponTarget: string;
  setNewCouponTarget: (target: string) => void;
  handleCreateCoupon: (e: React.FormEvent) => void;
  newCampTitle: string;
  setNewCampTitle: (title: string) => void;
  newCampGroup: "Guests" | "Vendors" | "All Users";
  setNewCampGroup: (group: any) => void;
  newCampChannel: "AWS SES Email" | "Twilio WhatsApp" | "Firebase Push";
  setNewCampChannel: (channel: any) => void;
  handleLaunchCampaign: (e: React.FormEvent) => void;
}

export const CouponsModule: React.FC<CouponsModuleProps> = ({
  coupons,
  campaigns,
  newCouponCode,
  setNewCouponCode,
  newCouponDiscount,
  setNewCouponDiscount,
  newCouponType,
  setNewCouponType,
  newCouponTarget,
  setNewCouponTarget,
  handleCreateCoupon,
  newCampTitle,
  setNewCampTitle,
  newCampGroup,
  setNewCampGroup,
  newCampChannel,
  setNewCampChannel,
  handleLaunchCampaign
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Creator Forms */}
      <div className="space-y-8 lg:col-span-1">
        
        {/* Coupon Creator */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Generate Coupon Code</h3>
            <p className="text-xs text-zinc-400 font-semibold">Create global or property-specific discounts</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Coupon Promo Code</label>
              <input 
                type="text"
                placeholder="e.g. WELCOME200"
                value={newCouponCode}
                onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Discount Percent (%)</label>
              <input 
                type="number"
                min="5"
                max="80"
                value={newCouponDiscount}
                onChange={e => setNewCouponDiscount(parseInt(e.target.value))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Coupon Scope</label>
              <select 
                value={newCouponType}
                onChange={e => setNewCouponType(e.target.value as any)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              >
                <option value="Global">Global Platform Offer</option>
                <option value="Stay-Specific">Stay-Specific Offer</option>
                <option value="Activity-Specific">Activity-Specific Offer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Target Listing Name (if specific)</label>
              <input 
                type="text"
                placeholder="e.g. The Creek Villa"
                value={newCouponTarget}
                onChange={e => setNewCouponTarget(e.target.value)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold tracking-tight shadow-md shadow-zinc-950/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </form>
        </div>

        {/* Promotional Campaign Scheduler */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Dispatch Campaign</h3>
            <p className="text-xs text-zinc-400 font-semibold">Bulk SMS, email, or Firebase push alerts</p>
          </div>

          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Campaign Title</label>
              <input 
                type="text"
                placeholder="e.g. Special Activity Promo"
                value={newCampTitle}
                onChange={e => setNewCampTitle(e.target.value)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Target Audience Group</label>
              <select
                value={newCampGroup}
                onChange={e => setNewCampGroup(e.target.value as any)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              >
                <option value="Guests">Traveler Guests Segment</option>
                <option value="Vendors">Vendor Host Segment</option>
                <option value="All Users">All Registered Users</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Gateway Channel Dispatcher</label>
              <select
                value={newCampChannel}
                onChange={e => setNewCampChannel(e.target.value as any)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              >
                <option value="AWS SES Email">AWS SES Transactional Email</option>
                <option value="Twilio WhatsApp">Twilio WhatsApp business blast</option>
                <option value="Firebase Push">Firebase Cloud Messaging (FCM)</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold tracking-tight shadow-md shadow-zinc-950/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Blast Campaign
            </button>
          </form>
        </div>

      </div>

      {/* Lists display (Coupons lists and Campaigns live status log details) */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Active Coupons list */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Active Coupons catalog</h3>
            <p className="text-xs text-zinc-400 font-semibold">Active globally redeemable coupon vouchers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map(cpn => (
              <div 
                key={cpn.id} 
                className="p-5 rounded-3xl border border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-950 text-white text-[10px] font-mono font-black px-2.5 py-1 rounded-xl tracking-wider">
                      {cpn.code}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400">{cpn.type}</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-900 truncate max-w-[140px]">{cpn.targetName}</p>
                  <p className="text-[9px] text-zinc-400 font-semibold">Expires: {cpn.expiryDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-zinc-950">{cpn.discountPercent}%</span>
                  <p className="text-[8px] font-bold text-emerald-600">OFF VOUCHER</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live campaigns telemetry status log */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Campaign Dispatch Analytics</h3>
            <p className="text-xs text-zinc-400 font-semibold">Track bulk notification queue executions, open and click margins</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                  <th className="py-4 px-4">Campaign Title</th>
                  <th className="py-4 px-4">Audience</th>
                  <th className="py-4 px-4">Gateway</th>
                  <th className="py-4 px-4">Analytics (Sent/Opens/Clicks)</th>
                  <th className="py-4 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                {campaigns.map(cmp => (
                  <tr key={cmp.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4 text-zinc-950 font-extrabold">{cmp.title}</td>
                    <td className="py-4 px-4 text-zinc-500">{cmp.targetGroup}</td>
                    <td className="py-4 px-4 font-mono text-[10px] text-zinc-400">{cmp.channel}</td>
                    <td className="py-4 px-4">
                      {cmp.status === "Sent" ? (
                        <div className="flex gap-2 text-[10px] font-black">
                          <span className="text-zinc-500">S: {cmp.analytics.sent}</span>
                          <span className="text-blue-500">O: {cmp.analytics.opens}</span>
                          <span className="text-emerald-500">C: {cmp.analytics.clicks}</span>
                        </div>
                      ) : (
                        <span className="italic text-zinc-300">Pending Execution</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "text-[8px] font-black tracking-tight px-2.5 py-0.5 rounded",
                        cmp.status === "Sent" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                        cmp.status === "Scheduled" && "bg-blue-50 text-blue-600 border border-blue-100",
                        cmp.status === "Draft" && "bg-zinc-100 text-zinc-400"
                      )}>
                        {cmp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
