import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  MapPin,
  Star,
  BedDouble,
  Bath,
  Users,
  IndianRupee,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  XCircle,
  CheckCircle,
  Clock,
  Wifi,
  Car,
  Utensils,
  Waves,
  Tv,
  Wind,
  Dog,
  UtensilsCrossed,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
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

interface MealOption {
  mealType: string;
  included: boolean;
  extraPrice: number;
  description?: string;
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

interface ListingDetail {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  host: HostInfo;
  propertyType: string;
  isEntirePlace: boolean;
  floorNumber?: number;
  totalFloors?: number;
  propertySizeSqFt?: number;
  yearBuilt?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  landmark?: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  extraMattresses: number;
  basePrice: number;
  weekendPrice?: number;
  cleaningFee: number;
  securityDeposit: number;
  extraGuestPrice: number;
  taxes: number;
  minStay: number;
  maxStay: number;
  checkInTime: string;
  checkOutTime: string;
  flexibleCheckIn: boolean;
  flexibleCheckOut: boolean;
  amenities: string[];
  meals: MealOption[];
  hasKitchen: boolean;
  kitchenDetails?: string;
  houseRules: HouseRule[];
  cancellationPolicy: string;
  cancellationDetails?: string;
  isPetFriendly: boolean;
  petRules?: string;
  isSmokingAllowed: boolean;
  isPartyAllowed: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
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

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  "air conditioning": <Wind className="w-3.5 h-3.5" />,
  "tv/cable": <Tv className="w-3.5 h-3.5" />,
  parking: <Car className="w-3.5 h-3.5" />,
  "swimming pool": <Waves className="w-3.5 h-3.5" />,
  kitchen: <UtensilsCrossed className="w-3.5 h-3.5" />,
  "pet friendly": <Dog className="w-3.5 h-3.5" />,
};

// ──────────────────────── Props ────────────────────────

interface StayDetailModuleProps {
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

function getCoverUrl(listing: ListingDetail): string | null {
  const cover = listing.media.find((m) => m.isCover);
  if (cover) return cover.url;
  if (listing.media.length > 0) return listing.media[0].url;
  return null;
}

function getAmenityIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <CheckCircle className="w-3.5 h-3.5" />;
}

// ──────────────────────── Component ────────────────────────

export const StayDetailModule: React.FC<StayDetailModuleProps> = ({ setAudits }) => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // ── Fetch detail ──

  const fetchDetail = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/admin/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || json.status === "fail") {
        throw new Error(json.message || "Failed to load listing.");
      }
      const data = json.data.listing as ListingDetail;
      setListing(data);
      setAdminNotes(data.adminNotes || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ── Change status (publish / draft / reject) ──

  const handleChangeStatus = async (newStatus: "published" | "draft" | "rejected") => {
    if (!listing) return;
    setActionLoading(newStatus);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/admin/listings/${listing._id}/change-status`, {
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

      setListing((prev) =>
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
          event: `Listing "${listing.name}" status changed to ${statusLabels[newStatus]}`,
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
          event: `Failed to change listing "${listing.name}" status: ${err.message}`,
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
    if (!listing) return;
    const action = listing.isActive ? "suspend" : "activate";
    setActionLoading(action);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/admin/listings/${listing._id}/toggle-status`, {
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

      setListing((prev) =>
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
          event: `Listing "${listing.name}" ${action === "suspend" ? "suspended" : "activated"}`,
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
          event: `Failed to ${action} listing "${listing.name}": ${err.message}`,
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
        <p className="text-xs font-bold text-zinc-400">Loading listing details…</p>
      </div>
    );
  }

  // ── Error State ──

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-bold text-zinc-600">{error || "Listing not found."}</p>
        <button
          onClick={() => navigate("/stays")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-black hover:bg-zinc-700 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Stays
        </button>
      </div>
    );
  }

  const coverUrl = getCoverUrl(listing);
  const statusCfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.draft;
  const allMedia = listing.media.sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* ── Back Button ── */}
      <button
        onClick={() => navigate("/stays")}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Stays List
      </button>

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {/* Cover Image */}
        {coverUrl && (
          <div className="relative h-64 sm:h-80 bg-zinc-100">
            <img
              src={coverUrl}
              alt={listing.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div className="text-white">
                <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">{listing.name}</h1>
                <p className="text-sm font-bold text-white/80 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.city}, {listing.state}, {listing.country}
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
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">{listing.name}</h1>
                <p className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.city}, {listing.state}, {listing.country}
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
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Property</p>
            <p className="text-sm font-black text-zinc-900 mt-0.5">{listing.propertyType}</p>
            <p className="text-[10px] text-zinc-400">{listing.isEntirePlace ? "Entire Place" : "Private Room"}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Base Price</p>
            <p className="text-sm font-black text-zinc-900 mt-0.5">{formatPrice(listing.basePrice)}</p>
            <p className="text-[10px] text-zinc-400">per night</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Rating</p>
            <p className="text-sm font-black text-zinc-900 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-[10px] text-zinc-400">{listing.totalReviews} reviews</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Created</p>
            <p className="text-sm font-black text-zinc-900 mt-0.5">{formatDate(listing.createdAt)}</p>
            <p className="text-[10px] text-zinc-400">Updated {formatDate(listing.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* ── Two-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary + Description */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">About this Stay</h2>
            <p className="text-sm font-bold text-zinc-700 leading-relaxed">{listing.summary}</p>
            <div className="border-t border-zinc-50 pt-4">
              <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5">
                <BedDouble className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Bedrooms</p>
                  <p className="text-sm font-black text-zinc-900">{listing.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Bath className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Bathrooms</p>
                  <p className="text-sm font-black text-zinc-900">{listing.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Max Guests</p>
                  <p className="text-sm font-black text-zinc-900">{listing.maxGuests}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <BedDouble className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Beds</p>
                  <p className="text-sm font-black text-zinc-900">{listing.beds}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Size</p>
                  <p className="text-sm font-black text-zinc-900">{listing.propertySizeSqFt ? `${listing.propertySizeSqFt} sqft` : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Year Built</p>
                  <p className="text-sm font-black text-zinc-900">{listing.yearBuilt || "—"}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-t border-zinc-50 pt-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Full Address</p>
              <p className="text-xs font-bold text-zinc-600">
                {listing.address}, {listing.city}, {listing.state}, {listing.zipCode}, {listing.country}
              </p>
              {listing.landmark && (
                <p className="text-[10px] text-zinc-400 mt-1">Landmark: {listing.landmark}</p>
              )}
            </div>

            {/* Check-in/out */}
            <div className="border-t border-zinc-50 pt-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase mb-1.5">Check-in / Check-out</p>
              <div className="flex items-center gap-6 text-xs font-bold text-zinc-700">
                <span>Check-in: {listing.checkInTime} {listing.flexibleCheckIn && "(Flexible)"}</span>
                <span>Check-out: {listing.checkOutTime} {listing.flexibleCheckOut && "(Flexible)"}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Min {listing.minStay} night{listing.minStay > 1 ? "s" : ""}
                {listing.maxStay > 0 && ` · Max ${listing.maxStay} nights`}
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Pricing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Base Price</p>
                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {listing.basePrice.toLocaleString("en-IN")}
                </p>
              </div>
              {listing.weekendPrice && (
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Weekend Price</p>
                  <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {listing.weekendPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Cleaning Fee</p>
                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {listing.cleaningFee.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Security Deposit</p>
                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {listing.securityDeposit.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Extra Guest</p>
                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {listing.extraGuestPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Taxes</p>
                <p className="text-sm font-black text-zinc-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {listing.taxes.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600"
                  >
                    {getAmenityIcon(a)}
                    {a}
                  </span>
                ))}
              </div>
              {listing.hasKitchen && (
                <div className="border-t border-zinc-50 pt-3">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Kitchen</p>
                  <p className="text-xs font-bold text-zinc-600 mt-1">{listing.kitchenDetails || "Available"}</p>
                </div>
              )}
            </div>
          )}

          {/* House Rules */}
          {listing.houseRules.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">House Rules</h2>
              <div className="space-y-2">
                {listing.houseRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    {r.rule}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 pt-2 border-t border-zinc-50">
                <span>Pets: {listing.isPetFriendly ? "Allowed" : "Not Allowed"}</span>
                <span>Smoking: {listing.isSmokingAllowed ? "Allowed" : "Not Allowed"}</span>
                <span>Parties: {listing.isPartyAllowed ? "Allowed" : "Not Allowed"}</span>
                {listing.quietHoursStart && (
                  <span>Quiet Hours: {listing.quietHoursStart} – {listing.quietHoursEnd}</span>
                )}
              </div>
              <p className="text-[10px] font-bold text-zinc-500">
                Cancellation: <span className="text-zinc-700">{listing.cancellationPolicy}</span>
                {listing.cancellationDetails && ` — ${listing.cancellationDetails}`}
              </p>
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
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentMediaIndex ? "border-primary ring-2 ring-primary/20" : "border-zinc-100 opacity-60 hover:opacity-100"
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
          {listing.nearbyPlaces.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Nearby Places</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.nearbyPlaces.map((np, i) => (
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
                {listing.host?.avatar ? (
                  <img src={listing.host.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  listing.host?.name?.charAt(0)?.toUpperCase() || "H"
                )}
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900">{listing.host?.name || "Unknown Host"}</p>
                <p className="text-[10px] font-bold text-zinc-400">{listing.host?.email || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">Role</span>
                <p className="text-zinc-700">{listing.host?.role || "—"}</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">KYC</span>
                <p className={`${listing.host?.kycStatus === "Approved" ? "text-emerald-600" : "text-amber-600"}`}>
                  {listing.host?.kycStatus || "—"}
                </p>
              </div>
              <div className="col-span-2 p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">Phone</span>
                <p className="text-zinc-700">{listing.host?.phone || "—"}</p>
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
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${
                  listing.isActive
                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                } disabled:opacity-50`}
              >
                {actionLoading === "suspend" || actionLoading === "activate" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : listing.isActive ? (
                  <ShieldOff className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {listing.isActive ? "Suspend Listing" : "Activate Listing"}
              </button>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase">Change Publication Status</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleChangeStatus("published")}
                  disabled={listing.status === "published" || actionLoading === "published"}
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
                  disabled={listing.status === "draft" || actionLoading === "draft"}
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
                  disabled={listing.status === "rejected" || actionLoading === "rejected"}
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
                placeholder="Add internal notes about this listing…"
                rows={3}
                className="w-full text-xs font-bold text-zinc-700 placeholder:text-zinc-300 border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <button
                onClick={() => handleChangeStatus(listing.status as "published" | "draft" | "rejected")}
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
                <p className="text-zinc-700">{listing.instantBook ? "Yes" : "No"}</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">Advance Notice</span>
                <p className="text-zinc-700">{listing.advanceNoticeHours}h</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">Max Per Booking</span>
                <p className="text-zinc-700">{listing.maxGuestsPerBooking} guests</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50">
                <span className="text-zinc-400">Languages</span>
                <p className="text-zinc-700">{listing.languagesSpoken.length > 0 ? listing.languagesSpoken.join(", ") : "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};