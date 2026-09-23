import React, { useState, useEffect, useCallback } from "react";
import type { Testimonial } from "../../types";
import { Plus, Pencil, Trash2, Image as ImageIcon, Eye, EyeOff, Star, Loader2 } from "lucide-react";

interface TestimonialsModuleProps {
  apiFetch: <T = any>(path: string, options?: RequestInit) => Promise<T>;
}

const API_BASE = (import.meta as any).env.VITE_API_URL || "";

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

export const TestimonialsModule: React.FC<TestimonialsModuleProps> = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formText, setFormText] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ status: string; data: { testimonials: Testimonial[] } }>("/testimonials");
      setTestimonials(res.data.testimonials || []);
    } catch (err: any) {
      setError(err.message || "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const resetForm = () => {
    setFormName("");
    setFormRole("");
    setFormText("");
    setFormImage("");
    setFormOrder(0);
    setFormActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setFormName(t.name);
    setFormRole(t.role);
    setFormText(t.text);
    setFormImage(t.image || "");
    setFormOrder(t.order ?? 0);
    setFormActive(t.isActive);
    setEditingId(t._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formText.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        role: formRole.trim(),
        text: formText.trim(),
        image: formImage.trim(),
        order: formOrder,
        isActive: formActive,
      };
      if (editingId) {
        await apiFetch(`/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      resetForm();
      await fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial by "${name}"?`)) return;
    try {
      await apiFetch(`/testimonials/${id}`, { method: "DELETE" });
      await fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to delete testimonial.");
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    try {
      await apiFetch(`/testimonials/${t._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      await fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to toggle testimonial.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Testimonials</h1>
          <p className="text-xs font-bold text-zinc-400 mt-1">
            Manage customer testimonials displayed on the public website.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-rose-500 text-white text-xs font-black tracking-tight shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-zinc-800">
              {editingId ? "Edit Testimonial" : "New Testimonial"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Jim Corner"
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                Role / Designation *
              </label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="e.g. CEO, Victonary Co."
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
              Testimonial Text *
            </label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Write the testimonial message..."
              rows={3}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              required
              maxLength={1000}
            />
            <p className="text-[9px] text-zinc-400 font-bold text-right">
              {formText.length}/1000
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Image URL
              </label>
              <input
                type="url"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                Display Order
              </label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
                className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-200 text-primary focus:ring-primary/20"
                />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  Active
                </span>
              </label>
            </div>
          </div>

          {formImage && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-100">
              <img
                src={formImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !formName.trim() || !formRole.trim() || !formText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-rose-500 text-white text-xs font-black tracking-tight shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : editingId ? (
              "Update Testimonial"
            ) : (
              "Create Testimonial"
            )}
          </button>
        </form>
      )}

      {/* Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button
            onClick={fetchTestimonials}
            className="mt-3 text-xs font-black text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 text-center">
          <Star className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-zinc-400">No testimonials yet.</p>
          <p className="text-xs text-zinc-300 mt-1 font-medium">
            Add your first testimonial to display on the public website.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
                  <th className="py-4 px-4">#</th>
                  <th className="py-4 px-4">Image</th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Text</th>
                  <th className="py-4 px-4">Order</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                {testimonials.map((t, i) => (
                  <tr key={t._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4 text-zinc-400">{i + 1}</td>
                    <td className="py-4 px-4">
                      {t.image ? (
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-zinc-300" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-black text-zinc-900">{t.name}</td>
                    <td className="py-4 px-4 text-zinc-500">{t.role}</td>
                    <td className="py-4 px-4 max-w-[280px] truncate text-zinc-500">
                      {t.text}
                    </td>
                    <td className="py-4 px-4 text-zinc-400">{t.order ?? 0}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-tight transition-all ${t.isActive ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}
                      >
                        {t.isActive ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {t.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};