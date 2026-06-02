import React, { useState, useEffect } from "react";
import { X, Building2, Save } from "lucide-react";
import type { Property } from "../../types";

interface EditListingModalProps {
  property: Property | null;
  onClose: () => void;
  onSave: (updatedProperty: Property) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  property,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<"Active" | "Suspended">("Active");
  
  // Stays fields
  const [breakfastPrice, setBreakfastPrice] = useState(0);
  const [dinnerPrice, setDinnerPrice] = useState(0);
  const [parkingAvailable, setParkingAvailable] = useState(false);

  // Activities fields
  const [category, setCategory] = useState("General");

  // Sync state with selected property
  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setLocation(property.location);
      setPrice(property.price);
      setStatus(property.status);
      setBreakfastPrice(property.breakfastPrice || 0);
      setDinnerPrice(property.dinnerPrice || 0);
      setParkingAvailable(property.parkingAvailable || false);
      setCategory(property.category || "General");
    }
  }, [property]);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Property = {
      ...property,
      title,
      location,
      price,
      status,
      ...(property.type === "Stay" ? {
        breakfastPrice: Number(breakfastPrice),
        dinnerPrice: Number(dinnerPrice),
        parkingAvailable
      } : {
        category
      })
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-zinc-100 shadow-2xl rounded-[36px] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">
              Edit {property.type} Listing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Location & Base Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Geographic Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Base Price (₹ / Night or Tour)</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Listing Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Moderation Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Active">Active / Publicly Visible</option>
              <option value="Suspended">Suspended / Hidden from Search</option>
            </select>
          </div>

          {/* Type-Specific Fields */}
          {property.type === "Stay" ? (
            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Add-on Amenities & Meal Pricing</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 tracking-tight">Breakfast Rate (₹ per guest)</label>
                  <input
                    type="number"
                    min="0"
                    value={breakfastPrice}
                    onChange={(e) => setBreakfastPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 tracking-tight">Dinner Rate (₹ per guest)</label>
                  <input
                    type="number"
                    min="0"
                    value={dinnerPrice}
                    onChange={(e) => setDinnerPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Parking availability toggle */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                <div>
                  <h5 className="text-xs font-black text-zinc-800">On-site Parking</h5>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">Indicates if secure vehicle parking is included in base stay booking</p>
                </div>
                <button
                  type="button"
                  onClick={() => setParkingAvailable(!parkingAvailable)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                    parkingAvailable ? "bg-primary" : "bg-zinc-200"
                  }`}
                >
                  <span className={`h-4.5 w-4.5 rounded-full bg-white shadow absolute transition-all ${
                    parkingAvailable ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tight font-sans">Activity Configurations</h4>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 tracking-tight">Experience Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Adventure">Adventure (Rafting, Paragliding, Trekking)</option>
                  <option value="Farming">Farming & Agriculture Experiences</option>
                  <option value="Historical">Historical Tours & Heritage Walks</option>
                  <option value="Spiritual">Spiritual / Yoga Retreats</option>
                  <option value="Nature">Nature Exploration & Camping</option>
                  <option value="General">General / Other Activities</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Save & Cancel Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-primary to-rose-500 text-white rounded-xl text-xs font-black tracking-tight hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              <Save className="w-4 h-4" /> Save Listing Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-zinc-500 rounded-xl text-xs font-black tracking-tight transition-all"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
