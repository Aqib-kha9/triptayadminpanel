import React from "react";
import { Search, MapPin, FileText } from "lucide-react";
import type { HostApplication } from "../../types";

interface ApprovalsModuleProps {
  applications: HostApplication[];
  setSelectedKycApp: (app: HostApplication) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const ApprovalsModule: React.FC<ApprovalsModuleProps> = ({
  applications,
  setSelectedKycApp,
  searchTerm,
  setSearchTerm
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-50">
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Host KYC Applications board</h3>
          <p className="text-xs text-zinc-400 font-semibold">Moderate new vendor requests, verify PAN documents, and gstin registries</p>
        </div>
        <div className="flex items-center gap-2 border border-zinc-100 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/10 transition-all bg-zinc-50 rounded-2xl px-4 py-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search host apps..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold text-zinc-700 w-full placeholder:text-zinc-400 p-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredApps.map(app => (
          <div 
            key={app.id} 
            className="p-6 rounded-[32px] border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-primary/5 bg-white transition-all space-y-4 relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className={cn(
                "text-[8px] font-black tracking-tight px-2.5 py-1 rounded-full border",
                app.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-100",
                app.status === "Approved" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                app.status === "Rejected" && "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                {app.status}
              </span>
            </div>

            <div className="space-y-1 pr-16">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-zinc-900 truncate">{app.name}</h4>
                <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">{app.id}</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold">{app.email} • {app.phone}</p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-zinc-400 tracking-wider uppercase">{app.type} listing name</span>
                <p className="text-xs font-black text-zinc-950 truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" /> {app.property}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 text-[10px]">
                <div>
                  <span className="text-zinc-400 font-semibold">Location:</span>
                  <p className="text-zinc-950 font-bold">{app.location}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold">PAN Number:</span>
                  <p className="text-zinc-950 font-bold font-mono">{app.panNumber}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedKycApp(app)}
                className="w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover hover:scale-[1.01] transition-all text-xs font-black text-white text-center flex items-center justify-center gap-1.5 shadow-md shadow-primary/15"
              >
                <FileText className="w-4 h-4 text-white" /> Review Application
              </button>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-400 text-xs font-bold">
            No matching KYC applications found.
          </div>
        )}
      </div>
    </div>
  );
};
