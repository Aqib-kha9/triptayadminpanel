import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Search,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { TouristAttraction, AuditLog } from "../../types";

// ──────────────────────── Types ────────────────────────

interface AttractionsModuleProps {
  setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

interface DestinationFormData {
  name: string;
  state: string;
  city: string;
  image: string;
  category: "Nature" | "Adventure" | "Historical" | "Spiritual";
  lat: string;
  lng: string;
  description: string;
}

interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
}

const emptyForm: DestinationFormData = {
  name: "",
  state: "",
  city: "",
  image: "",
  category: "Nature",
  lat: "",
  lng: "",
  description: "",
};

// ──────────────────────── Constants ────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "";
const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  { value: "Nature", label: "Nature & Scenic Scapes", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "Adventure", label: "Thrills & Adventure", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "Historical", label: "Heritage & History", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "Spiritual", label: "Peaceful & Spiritual", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
] as const;

function getCategoryBadge(category: string) {
  const opt = CATEGORY_OPTIONS.find((c) => c.value === category);
  return opt?.color || "bg-zinc-50 text-zinc-700 border-zinc-200";
}

// ──────────────────────── API Helper ────────────────────────

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

// ──────────────────────── Component ────────────────────────

export const AttractionsModule: React.FC<AttractionsModuleProps> = ({ setAudits }) => {
  // Data
  const [destinations, setDestinations] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, total: 0 });

  // Form
  const [form, setForm] = useState<DestinationFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<TouristAttraction | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ────────── Fetch ──────────

  const fetchDestinations = useCallback(async (page = 1, search = searchTerm, cat = categoryFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      params.set("includeInactive", "true");
      if (search) params.set("search", search);
      if (cat) params.set("category", cat);

      const res = await apiFetch<{
        status: string;
        data: { destinations: any[]; pagination: PaginationMeta };
      }>(`/destinations?${params.toString()}`);

      const mapped: TouristAttraction[] = res.data.destinations.map((d: any) => ({
        _id: d._id,
        id: d._id,
        name: d.name,
        slug: d.slug,
        state: d.state,
        city: d.city,
        image: d.image,
        coordinates: `${d.coordinates?.lat?.toFixed(4) ?? "—"}° N, ${d.coordinates?.lng?.toFixed(4) ?? "—"}° E`,
        lat: d.coordinates?.lat ?? 0,
        lng: d.coordinates?.lng ?? 0,
        category: d.category,
        description: d.description || "",
        isActive: d.isActive,
        popularityScore: d.popularityScore ?? 0,
        nearbyStaysCount: 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      setDestinations(mapped);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load destinations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations(1, searchTerm, categoryFilter);
  }, [categoryFilter]);

  // ────────── Search with debounce ──────────

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchDestinations(1, val, categoryFilter);
    }, 400);
  };

  // ────────── Form Handlers ──────────

  const handleEdit = (dest: TouristAttraction) => {
    setEditingId(dest._id);
    setForm({
      name: dest.name,
      state: dest.state,
      city: dest.city,
      image: dest.image,
      category: dest.category,
      lat: String(dest.lat),
      lng: String(dest.lng),
      description: dest.description || "",
    });
    setImagePreview(dest.image || null);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, state, city, image, category, lat, lng } = form;

    if (!name || !state || !city || !image || !lat || !lng) {
      setFormError("Please fill in all required fields (name, state, city, image, lat, lng).");
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setFormError("Latitude and Longitude must be valid numbers.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingId) {
        // Update
        const res = await apiFetch<{ status: string; data: { destination: any } }>(
          `/destinations/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              state: state.trim(),
              city: city.trim(),
              image: image.trim(),
              category,
              coordinates: { lat: latNum, lng: lngNum },
              description: form.description.trim(),
            }),
          }
        );
        setDestinations((prev) =>
          prev.map((d) =>
            d._id === editingId
              ? { ...d, ...res.data.destination, coordinates: `${latNum.toFixed(4)}° N, ${lngNum.toFixed(4)}° E`, id: d._id }
              : d
          )
        );
        setAudits((logs) => [
          {
            id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
            timestamp: new Date().toLocaleTimeString(),
            type: "System",
            event: `Destination "${name}" updated successfully.`,
            status: "Success",
          },
          ...logs,
        ]);
        cancelEdit();
      } else {
        // Create
        await apiFetch<{ status: string; data: { destination: any } }>(
          "/destinations",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              state: state.trim(),
              city: city.trim(),
              image: image.trim(),
              category,
              coordinates: { lat: latNum, lng: lngNum },
              description: form.description.trim(),
            }),
          }
        );
        setAudits((logs) => [
          {
            id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
            timestamp: new Date().toLocaleTimeString(),
            type: "System",
            event: `New destination "${name}" created successfully.`,
            status: "Success",
          },
          ...logs,
        ]);
        setForm(emptyForm);
        setImagePreview(null);
        fetchDestinations(1);
      }
    } catch (err: any) {
      setFormError(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ────────── Toggle Active ──────────

  const handleToggleActive = async (dest: TouristAttraction) => {
    try {
      await apiFetch(`/destinations/${dest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !dest.isActive }),
      });
      setDestinations((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isActive: !d.isActive } : d))
      );
      setAudits((logs) => [
        {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "System",
          event: `Destination "${dest.name}" ${dest.isActive ? "deactivated" : "activated"}.`,
          status: "Success",
        },
        ...logs,
      ]);
    } catch (err: any) {
      setAudits((logs) => [
        {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "System",
          event: `Failed to toggle "${dest.name}": ${err.message}`,
          status: "Failed",
        },
        ...logs,
      ]);
    }
  };

  // ────────── Delete ──────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/destinations/${deleteTarget._id}`, { method: "DELETE" });
      setDestinations((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      setAudits((logs) => [
        {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "System",
          event: `Destination "${deleteTarget.name}" deleted permanently.`,
          status: "Success",
        },
        ...logs,
      ]);
      setDeleteTarget(null);
    } catch (err: any) {
      setAudits((logs) => [
        {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "System",
          event: `Failed to delete "${deleteTarget.name}": ${err.message}`,
          status: "Failed",
        },
        ...logs,
      ]);
    } finally {
      setDeleting(false);
    }
  };

  // ────────── Render Helpers ──────────

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    const pages: number[] = [];
    for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1 py-4">
        <button
          onClick={() => fetchDestinations(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 rounded-xl hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => fetchDestinations(p)}
            className={`w-9 h-9 rounded-xl text-xs font-black transition ${p === pagination.page
              ? "bg-zinc-950 text-white shadow-sm"
              : "hover:bg-zinc-100 text-zinc-500"
              }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => fetchDestinations(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 rounded-xl hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // ────────── Main Render ──────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Destinations</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-1">
            Manage tourist hotspots displayed across the platform
          </p>
        </div>
        <button
          onClick={() => fetchDestinations(1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-xs font-bold outline-none focus:border-zinc-400 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-zinc-200 bg-white text-xs font-bold outline-none focus:border-zinc-400 transition"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Add / Edit Form ── */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">
            {editingId ? "Edit Destination" : "Add New Destination"}
          </h3>
          <p className="text-xs text-zinc-400 font-semibold">
            {editingId
              ? "Update destination details and coordinates"
              : "Add a new tourist hotspot to the platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Destination Name *</label>
              <input
                type="text"
                placeholder="e.g. Solang Valley"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">State *</label>
              <input
                type="text"
                placeholder="e.g. Himachal Pradesh"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">City / District *</label>
              <input
                type="text"
                placeholder="e.g. Manali"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Destination Image *</label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-zinc-200 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-400 cursor-pointer hover:border-zinc-950 hover:text-zinc-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  {imageUploading ? "Uploading..." : "Choose Image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={imageUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageUploading(true);
                      setFormError(null);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const uploadRes = await apiFetch<{ status: string; data: { url: string; public_id: string } }>(
                          "/destinations/upload-image",
                          { method: "POST", body: formData }
                        );
                        setForm((f) => ({ ...f, image: uploadRes.data.url }));
                        setImagePreview(uploadRes.data.url);
                      } catch (err: any) {
                        setFormError(err.message || "Image upload failed.");
                      } finally {
                        setImageUploading(false);
                      }
                    }}
                  />
                </label>
                {/* URL manual input fallback */}
                <input
                  type="text"
                  placeholder="Or paste image URL..."
                  value={form.image}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, image: e.target.value }));
                    setImagePreview(e.target.value || null);
                  }}
                  className="flex-1 border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
                />
              </div>
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-zinc-100 aspect-video bg-zinc-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, image: "" }));
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-950/60 text-white flex items-center justify-center hover:bg-zinc-950 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Latitude */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Latitude *</label>
              <input
                type="text"
                placeholder="e.g. 32.3167"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-zinc-950"
              />
            </div>

            {/* Longitude */}
            <div className="space-y-1">
              <label className="text-[10px] font-black tracking-normal text-zinc-400">Longitude *</label>
              <input
                type="text"
                placeholder="e.g. 77.1500"
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-normal text-zinc-400">Description</label>
            <textarea
              placeholder="Brief description of the destination..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950 resize-none"
            />
          </div>

          {/* Form Error */}
          {formError && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 rounded-2xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold tracking-tight shadow-md shadow-zinc-950/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editingId ? "Update Destination" : "Add Destination"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Destinations Table ── */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] overflow-hidden">
        {loading && destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
            <p className="text-xs font-bold text-zinc-400">Loading destinations...</p>
          </div>
        ) : error && destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-300" />
            <p className="text-xs font-bold text-red-500">{error}</p>
            <button
              onClick={() => fetchDestinations(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-8 text-center">
            <MapPin className="w-8 h-8 text-zinc-200" />
            <p className="text-xs font-bold text-zinc-400">No destinations found. Add your first one above.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400 uppercase">
                    <th className="py-5 px-5">Destination</th>
                    <th className="py-5 px-5">Location</th>
                    <th className="py-5 px-5">Category</th>
                    <th className="py-5 px-5">Coordinates</th>
                    <th className="py-5 px-5">Status</th>
                    <th className="py-5 px-5">Popularity</th>
                    <th className="py-5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                  <AnimatePresence mode="popLayout">
                    {destinations.map((dest) => (
                      <motion.tr
                        key={dest._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        {/* Destination */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {dest.image ? (
                              <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-10 h-10 rounded-xl object-cover bg-zinc-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center ${dest.image ? "hidden" : ""}`}
                            >
                              <ImageIcon className="w-4 h-4 text-zinc-300" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-950 font-extrabold">{dest.name}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">{dest.slug}</p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                            <span>
                              {dest.city}, {dest.state}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-block text-[9px] font-black tracking-wider px-2.5 py-1 rounded-lg border ${getCategoryBadge(dest.category)}`}
                          >
                            {dest.category}
                          </span>
                        </td>

                        {/* Coordinates */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-[10px] text-zinc-500">{dest.coordinates}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-black tracking-wider px-2.5 py-1 rounded-lg border ${dest.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-400 border-zinc-200"
                              }`}
                          >
                            {dest.isActive ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {dest.isActive ? "Active" : "Hidden"}
                          </span>
                        </td>

                        {/* Popularity */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-black">{dest.popularityScore}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(dest)}
                              className="p-2 rounded-xl hover:bg-zinc-100 transition"
                              title={dest.isActive ? "Deactivate" : "Activate"}
                            >
                              {dest.isActive ? (
                                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(dest)}
                              className="p-2 rounded-xl hover:bg-zinc-100 transition"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(dest)}
                              className="p-2 rounded-xl hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-zinc-950">Delete Destination</h3>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-extrabold text-zinc-800">"{deleteTarget.name}"</span>?
                  This action cannot be undone and the destination will be removed from the platform.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-tight shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
