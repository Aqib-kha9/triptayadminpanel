import React from "react";
import { Plus, MapPin } from "lucide-react";
import type { TouristAttraction } from "../../types";

interface AttractionsModuleProps {
  attractions: TouristAttraction[];
  newAttractionName: string;
  setNewAttractionName: (name: string) => void;
  newAttractionLoc: string;
  setNewAttractionLoc: (loc: string) => void;
  newAttractionCoords: string;
  setNewAttractionCoords: (coords: string) => void;
  newAttractionCat: "Nature" | "Adventure" | "Historical" | "Spiritual";
  setNewAttractionCat: (cat: any) => void;
  handleAddAttraction: (e: React.FormEvent) => void;
}

export const AttractionsModule: React.FC<AttractionsModuleProps> = ({
  attractions,
  newAttractionName,
  setNewAttractionName,
  newAttractionLoc,
  setNewAttractionLoc,
  newAttractionCoords,
  setNewAttractionCoords,
  newAttractionCat,
  setNewAttractionCat,
  handleAddAttraction
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Attraction Form */}
      <div className="lg:col-span-1 bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Add Tourist Hotspot</h3>
          <p className="text-xs text-zinc-400 font-semibold">Map coordinates of high-density traveler hubs</p>
        </div>

        <form onSubmit={handleAddAttraction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-normal text-zinc-400">Destination Name</label>
            <input 
              type="text"
              placeholder="e.g. Solang Valley"
              value={newAttractionName}
              onChange={e => setNewAttractionName(e.target.value)}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-normal text-zinc-400">Regional District</label>
            <input 
              type="text"
              placeholder="e.g. Manali, HP"
              value={newAttractionLoc}
              onChange={e => setNewAttractionLoc(e.target.value)}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-normal text-zinc-400">Latitude & Longitude Coordinates</label>
            <input 
              type="text"
              placeholder="e.g. 32.2210° N, 77.0123° E"
              value={newAttractionCoords}
              onChange={e => setNewAttractionCoords(e.target.value)}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-normal text-zinc-400">Vibe / Category</label>
            <select
              value={newAttractionCat}
              onChange={e => setNewAttractionCat(e.target.value as any)}
              className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-950"
            >
              <option value="Nature">Nature & Scenic Scapes</option>
              <option value="Adventure">Thrills & Adventure</option>
              <option value="Historical">Heritage & History</option>
              <option value="Spiritual">Peaceful & Spiritual</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold tracking-tight shadow-md shadow-zinc-950/10 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </form>
      </div>

      {/* Attractions Map / Directory */}
      <div className="lg:col-span-2 bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Active Mapped Hotspots</h3>
          <p className="text-xs text-zinc-400 font-semibold">Registered destinations showing mapped coordinate data and nearby stay integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attractions.map(attr => (
            <div 
              key={attr.id}
              className="p-5 rounded-3xl border border-zinc-100 bg-zinc-50/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-zinc-950">{attr.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {attr.location}
                  </p>
                </div>
                <span className="bg-zinc-950/5 text-zinc-950 text-[8px] font-black tracking-wider px-2 py-0.5 rounded uppercase">
                  {attr.category}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-2 border-t border-zinc-100/50">
                <div className="space-y-0.5">
                  <span className="text-zinc-400 font-semibold">Coordinates:</span>
                  <p className="font-mono text-zinc-950 font-bold">{attr.coordinates}</p>
                </div>
                <div className="text-right">
                  <span className="text-zinc-950 font-black text-xs">{attr.nearbyStaysCount} stays</span>
                  <p className="text-[8px] font-semibold text-zinc-400">Within 15km</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
