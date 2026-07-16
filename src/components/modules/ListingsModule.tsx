import React from "react";
import { MapPin, Star } from "lucide-react";
import type { Property, AuditLog } from "../../types";

interface ListingsModuleProps {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  setAudits: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  setSelectedPropertyForEdit: (property: Property) => void;
  toggleListingStatus: (listingId: string) => void;
}

export const ListingsModule: React.FC<ListingsModuleProps> = ({
  properties,
  categoryFilter,
  setCategoryFilter,
  setSelectedPropertyForEdit,
  toggleListingStatus
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const handleToggleStatus = (id: string) => {
    toggleListingStatus(id);
  };

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-50">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Active Listings Directory</h3>
          <p className="text-xs text-zinc-400 font-semibold">Suspend listings or configure custom add-on rates</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-tight text-zinc-400">Category Filter:</span>
          {["all", "Stay", "Activity"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg border transition-all",
                categoryFilter === cat
                  ? "bg-gradient-to-r from-primary to-rose-500 text-white border-none shadow-md shadow-primary/10"
                  : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200"
              )}
            >
              {cat === "all" ? "All" : cat + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400">
              <th className="py-4 px-4">Item ID</th>
              <th className="py-4 px-4">Property / Activity Details</th>
              <th className="py-4 px-4">Type</th>
              <th className="py-4 px-4">Food Add-ons (Pricing)</th>
              <th className="py-4 px-4">Parking Facility</th>
              <th className="py-4 px-4">Base Pricing</th>
              <th className="py-4 px-4">Rating</th>
              <th className="py-4 px-4 text-right">Moderation Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
            {properties.filter(prop =>
              categoryFilter === "all" || prop.type === categoryFilter
            ).map(prop => (
              <tr key={prop.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4"><span className="font-mono text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">{prop.id}</span></td>
                <td className="py-4 px-4 space-y-1">
                  <p className="text-zinc-950 font-extrabold">{prop.title}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300" /> {prop.location} • Host: {prop.hostName}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span className={cn(
                    "text-[8px] font-black tracking-wider px-2 py-0.5 rounded border uppercase",
                    prop.type === "Stay" ? "bg-primary/5 text-primary border-primary/10" : "bg-secondary/5 text-secondary border-secondary/10"
                  )}>
                    {prop.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-zinc-400">
                  {prop.type === "Stay" ? (
                    <div className="space-y-0.5 text-[10px]">
                      <p>Breakfast: <span className="text-zinc-950 font-bold">₹{prop.breakfastPrice}</span></p>
                      <p>Dinner: <span className="text-zinc-950 font-bold">₹{prop.dinnerPrice}</span></p>
                    </div>
                  ) : (
                    <span className="italic text-zinc-300">N/A (Tours package)</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {prop.type === "Stay" ? (
                    <span className={cn(
                      "text-[9px] font-extrabold",
                      prop.parkingAvailable ? "text-emerald-600" : "text-rose-500"
                    )}>
                      {prop.parkingAvailable ? "Available" : "Not Mapped"}
                    </span>
                  ) : (
                    <span className="italic text-zinc-300">N/A</span>
                  )}
                </td>
                <td className="py-4 px-4 text-zinc-900 font-black">
                  ₹{prop.price.toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-extrabold text-zinc-950">{prop.rating}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    onClick={() => setSelectedPropertyForEdit(prop)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 text-zinc-600 transition-all text-[10px] font-black tracking-tight"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleToggleStatus(prop.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight border transition-all",
                      prop.status === "Active"
                        ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white"
                        : "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                    )}
                  >
                    {prop.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
