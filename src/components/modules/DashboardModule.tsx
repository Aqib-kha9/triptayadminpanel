import React from "react";
import {
  Building2,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  MapPin,
  FileText,
  Users,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";
import type { SystemBooking, HostApplication, PlatformUser, Property } from "../../types";

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
    id: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    userName?: string;
    userEmail?: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

interface DashboardModuleProps {
  bookings: SystemBooking[];
  applications: HostApplication[];
  users: PlatformUser[];
  properties: Property[];
  commissionRate: number;
  gstRate: number;
  setSelectedKycApp: (app: HostApplication) => void;
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  bookings,
  applications,
  users,
  properties,
  commissionRate,
  gstRate,
  setSelectedKycApp,
  dashboardStats,
  dashboardLoading,
}) => {
  // Use real dashboard stats if available, otherwise fall back to computed values
  const stats = dashboardStats;
  const totalFinancialVolume = stats ? stats.revenue : bookings.filter(b => b.status !== "Cancelled").reduce((sum, b) => sum + b.amount, 0);
  const platformRevenueCalculated = stats ? Math.round(stats.revenue * (commissionRate / 100)) : bookings.filter(b => b.status !== "Cancelled").reduce((sum, b) => sum + (b.amount * (commissionRate / 100)), 0);
  const pendingApprovalsCount = stats ? stats.counts.pendingKyc : applications.filter(app => app.status === "Pending").length;
  const totalUsers = stats ? stats.counts.users : users.length;
  const totalListings = stats ? stats.counts.listings : properties.length;
  const totalActivities = stats ? stats.counts.activities : 0;
  const totalBookings = stats ? stats.counts.bookings : bookings.length;
  const pendingPayouts = stats ? stats.counts.pendingPayouts : 0;
  const activeCoupons = stats ? stats.counts.activeCoupons : 0;

  return (
    <div className="space-y-8">
      {/* Loading indicator */}
      {dashboardLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="ml-2 text-xs font-bold text-zinc-400">Syncing live dashboard data…</span>
        </div>
      )}

      {/* Financial & Approvals Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Gross booking Volume (GMV)</p>
            <h3 className="text-3xl font-black text-zinc-900">₹{totalFinancialVolume.toLocaleString()}</h3>
            <p className="text-[9px] text-emerald-600 font-bold tracking-normal flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stats ? "Live from database" : "+12.4% vs last week"}
            </p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Platform gross margin ({commissionRate}%)</p>
            <h3 className="text-3xl font-black text-zinc-900">₹{platformRevenueCalculated.toLocaleString()}</h3>
            <p className="text-[9px] text-secondary font-bold tracking-normal flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> GST buffer of {gstRate}% excluded
            </p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">KYC applications pending</p>
            <h3 className="text-3xl font-black text-zinc-900">{pendingApprovalsCount} Hosts</h3>
            <p className="text-[9px] text-rose-500 font-bold tracking-normal">Needs action within 24 hours</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Active properties & tours</p>
            <h3 className="text-3xl font-black text-zinc-900">{stats ? stats.counts.publishedListings + stats.counts.publishedActivities : properties.filter(p => p.status === "Active").length} Listings</h3>
            <p className="text-[9px] text-purple-600 font-bold tracking-normal">Dual stays & activity packs live</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Live Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Total Users</p>
              <p className="text-lg font-black text-zinc-900">{totalUsers}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Listings</p>
              <p className="text-lg font-black text-zinc-900">{totalListings}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Activities</p>
              <p className="text-lg font-black text-zinc-900">{totalActivities}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Bookings</p>
              <p className="text-lg font-black text-zinc-900">{totalBookings}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Pending Payouts</p>
              <p className="text-lg font-black text-zinc-900">{pendingPayouts}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase">Active Coupons</p>
              <p className="text-lg font-black text-zinc-900">{activeCoupons}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Core section: Recent host registrations & details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Pending approvals queue list */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-50">
            <div>
              <h3 className="text-sm font-black text-zinc-900 tracking-tight">Pending Host Registrations</h3>
              <p className="text-xs text-zinc-400 font-semibold">Review physical KYC identities, gstin registrations, bank mandates</p>
            </div>
            <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl">
              Urgent Queue
            </span>
          </div>

          <div className="divide-y divide-zinc-50">
            {applications.filter(app => app.status === "Pending").map(app => {
              const appKey = app._id || app.id;
              return (
                <div key={appKey} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-950 truncate">{app.name}</span>
                      <span className="text-[8px] font-black tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        {app.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-bold tracking-normal flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" /> {app.email} • PAN: {app.panNumber || "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedKycApp(app)}
                    className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all text-[10px] font-black tracking-tight flex items-center gap-1.5 shadow-md shadow-primary/15 flex-shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" /> Review
                  </button>
                </div>
              );
            })}

            {pendingApprovalsCount === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-bold text-zinc-400">All caught up! Zero pending host operations applications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Operations Quick Actions</h3>
            <p className="text-xs text-zinc-400 font-semibold">One-click administrative telemetry adjustments</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-zinc-900">Platform base commission</p>
                <p className="text-[10px] text-zinc-400 font-bold">Configured globally</p>
              </div>
              <span className="text-sm font-black text-primary bg-primary-light border border-primary/10 px-3 py-1 rounded-xl">
                {commissionRate}%
              </span>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-zinc-900">Total User Base size</p>
                <p className="text-[10px] text-zinc-400 font-bold">Dual mode profiles mapped</p>
              </div>
              <span className="text-sm font-black text-secondary bg-teal-50 border border-secondary/10 px-3 py-1 rounded-xl">
                {totalUsers} Users
              </span>
            </div>

            {stats && stats.recentBookings.length > 0 && (
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
                <p className="text-xs font-black text-zinc-900">Recent Bookings</p>
                <div className="space-y-1.5">
                  {stats.recentBookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-600 truncate">{b.bookingRef || b.id}</span>
                      <span className="font-black text-zinc-900">₹{b.totalAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
