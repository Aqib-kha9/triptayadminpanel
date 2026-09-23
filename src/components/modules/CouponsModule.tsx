import React from "react";
import { Plus, Trash2, Calendar, Users, Percent, Tag } from "lucide-react";
import type { Coupon, Property, Activity } from "../../types";

interface CouponsModuleProps {
  coupons: Coupon[];
  properties: Property[];
  activities: Activity[];
  newCouponCode: string;
  setNewCouponCode: (code: string) => void;
  newCouponDiscount: number;
  setNewCouponDiscount: (discount: number) => void;
  newCouponType: "Global" | "Stay-Specific" | "Activity-Specific";
  setNewCouponType: (type: any) => void;
  newCouponTarget: string;
  setNewCouponTarget: (target: string) => void;
  newCouponExpiry: string;
  setNewCouponExpiry: (expiry: string) => void;
  newCouponMinOrder: number;
  setNewCouponMinOrder: (minOrder: number) => void;
  newCouponLimit: number;
  setNewCouponLimit: (limit: number) => void;
  handleCreateCoupon: (e: React.FormEvent) => void;
  handleDeleteCoupon: (couponId: string) => Promise<void>;
}

export const CouponsModule: React.FC<CouponsModuleProps> = ({
  coupons,
  properties,
  activities,
  newCouponCode,
  setNewCouponCode,
  newCouponDiscount,
  setNewCouponDiscount,
  newCouponType,
  setNewCouponType,
  newCouponTarget,
  setNewCouponTarget,
  newCouponExpiry,
  setNewCouponExpiry,
  newCouponMinOrder,
  setNewCouponMinOrder,
  newCouponLimit,
  setNewCouponLimit,
  handleCreateCoupon,
  handleDeleteCoupon
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coupon Creator Form */}
      <div className="space-y-8 lg:col-span-1">
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Tag className="w-5 h-5" />
            </div>
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
                required
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-normal text-zinc-400">Discount Percent (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={newCouponDiscount}
                    onChange={e => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                    required
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl pl-4 pr-8 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  />
                  <Percent className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-normal text-zinc-400">Min Order Value (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={newCouponMinOrder}
                    onChange={e => setNewCouponMinOrder(parseInt(e.target.value) || 0)}
                    required
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl pl-6 pr-3 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-normal text-zinc-400">Expiration Date</label>
                <div className="relative">
                  <input
                    type="date"
                    min={tomorrow}
                    value={newCouponExpiry}
                    onChange={e => setNewCouponExpiry(e.target.value)}
                    required
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-3 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-normal text-zinc-400">Max Usage Limit</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={newCouponLimit}
                    onChange={e => setNewCouponLimit(parseInt(e.target.value) || 0)}
                    required
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl pl-4 pr-8 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  />
                  <Users className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Coupon Scope</label>
              <select
                value={newCouponType}
                onChange={e => setNewCouponType(e.target.value as any)}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
              >
                <option value="Global">Global Platform Offer</option>
                <option value="Stay-Specific">Stay-Specific Offer</option>
                <option value="Activity-Specific">Activity-Specific Offer</option>
              </select>
            </div>

            {newCouponType !== "Global" && (
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-normal text-zinc-400">
                  {newCouponType === "Stay-Specific" ? "Select Stay Property" : "Select Activity Experience"}
                </label>
                <select
                  value={newCouponTarget}
                  onChange={e => setNewCouponTarget(e.target.value)}
                  required
                  className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                >
                  <option value="">-- Select Target --</option>
                  {newCouponType === "Stay-Specific"
                    ? properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                    : activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)
                  }
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-rose-500 hover:opacity-95 text-white text-xs font-bold tracking-tight shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </form>
        </div>
      </div>

      {/* Active Coupons catalog */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Active Coupons Catalog</h3>
            <p className="text-xs text-zinc-400 font-semibold">Active globally redeemable coupon vouchers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map(cpn => (
              <div
                key={cpn.id}
                className="p-5 rounded-3xl border border-zinc-100 bg-zinc-50/50 flex flex-col justify-between relative group hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Visual coupon left border styling */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-primary to-rose-500 text-white text-[10px] font-mono font-black px-2.5 py-1 rounded-xl tracking-wider shadow-sm shadow-primary/10">
                        {cpn.code}
                      </span>
                      <span className="text-[9px] font-black text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg truncate">
                        {cpn.type}
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-zinc-800 truncate">{cpn.targetName}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-primary">{cpn.discountPercent}%</span>
                    <p className="text-[8px] font-black text-emerald-600 tracking-wider">OFF VOUCHER</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100/60 flex items-center justify-between gap-4 text-zinc-400">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-300" />
                      <span className="text-[9px] font-bold">Expires: {cpn.expiryDate}</span>
                    </div>
                    {cpn.usedCount !== undefined && (
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Users className="w-3 h-3 text-zinc-300" />
                        <span className="text-[9px] font-semibold">Redeemed: {cpn.usedCount}{cpn.usageLimit ? ` / ${cpn.usageLimit}` : " (Unlimited)"}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCoupon(cpn.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
