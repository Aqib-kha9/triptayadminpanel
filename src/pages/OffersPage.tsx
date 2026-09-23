import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Offer {
  id: string;
  title: string;
  discount: string;
  desc: string;
  image: string;
  bgClass: string;
  tag: string;
  couponCode?: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Offer>>({});
  const [isCreating, setIsCreating] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("triptay_admin_token");
      const res = await fetch(`${API_URL}/offers/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("triptay_admin_token");
    const method = isCreating ? "POST" : "PUT";
    const url = isCreating ? `${API_URL}/offers` : `${API_URL}/offers/${editingId}`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingId(null);
        setIsCreating(false);
        setEditForm({});
        fetchOffers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    const token = localStorage.getItem("triptay_admin_token");
    try {
      await fetch(`${API_URL}/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOffers();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setEditForm(offer);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId("new");
    setEditForm({
      title: "", discount: "", desc: "", image: "", bgClass: "bg-zinc-50", tag: "Hot", order: 0, isActive: true
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Promotional Offers</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage banners shown on the landing page</p>
        </div>
        <button 
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Offer
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex gap-4 overflow-hidden">
           {[1, 2, 3].map(i => <div key={i} className="w-[340px] h-[280px] bg-zinc-200 rounded-3xl shrink-0" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map(offer => (
            <div key={offer.id} className={`flex flex-col justify-between border border-zinc-200 rounded-[2rem] p-2 bg-white shadow-sm`}>
              <div className="w-full h-40 rounded-[1.5rem] overflow-hidden relative bg-zinc-100">
                <img src={offer.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => startEdit(offer)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-zinc-700 hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(offer.id)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 pt-5 pb-3">
                 <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{offer.title}</h3>
                 <p className="text-xl font-black text-zinc-900 leading-tight italic">{offer.discount}</p>
                 <p className="text-[10px] text-zinc-500 font-medium">{offer.desc}</p>
                 <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold">
                    <span className={offer.isActive ? "text-emerald-500" : "text-zinc-400"}>{offer.isActive ? "Active" : "Inactive"}</span>
                    <span className="text-zinc-400">Order: {offer.order}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {(editingId || isCreating) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setEditingId(null); setIsCreating(false); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black text-zinc-900">{isCreating ? "Create Offer" : "Edit Offer"}</h2>
                <button onClick={() => { setEditingId(null); setIsCreating(false); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Title</label>
                    <input type="text" value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. Domestic Stays" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Discount Text</label>
                    <input type="text" value={editForm.discount || ""} onChange={e => setEditForm({...editForm, discount: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. Flat 25% OFF" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                  <input type="text" value={editForm.desc || ""} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. Valid on all villa bookings" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={editForm.image || ""} onChange={e => setEditForm({...editForm, image: e.target.value})} className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Tag</label>
                    <input type="text" value={editForm.tag || ""} onChange={e => setEditForm({...editForm, tag: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. Limited" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Background Class</label>
                    <input type="text" value={editForm.bgClass || ""} onChange={e => setEditForm({...editForm, bgClass: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. bg-blue-50/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Linked Coupon Code (Optional)</label>
                    <input type="text" value={editForm.couponCode || ""} onChange={e => setEditForm({...editForm, couponCode: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. FLAT25" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Link URL (Optional)</label>
                    <input type="text" value={editForm.linkUrl || ""} onChange={e => setEditForm({...editForm, linkUrl: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" placeholder="e.g. /stays?coupon=FLAT25" />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.isActive ?? true} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="w-4 h-4 rounded text-primary border-zinc-300 focus:ring-primary" />
                    <span className="text-sm font-bold text-zinc-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Display Order</span>
                    <input type="number" value={editForm.order || 0} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value) || 0})} className="w-20 h-10 px-3 rounded-xl border border-zinc-200 text-sm font-medium focus:border-primary outline-none" />
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-zinc-50">
                <button onClick={() => { setEditingId(null); setIsCreating(false); }} className="px-6 h-11 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 h-11 rounded-xl bg-zinc-900 text-white text-sm font-bold shadow-md hover:bg-zinc-800 transition-colors">
                  <Save className="w-4 h-4" /> Save Offer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
