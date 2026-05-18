import React from "react";
import { Database, Search } from "lucide-react";
import type { AuditLog } from "../../types";

interface AuditsModuleProps {
  audits: AuditLog[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const AuditsModule: React.FC<AuditsModuleProps> = ({
  audits,
  searchTerm,
  setSearchTerm
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const filteredAudits = audits.filter(log => 
    log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-50">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" /> Operational Queue & Telemetry Logs
          </h3>
          <p className="text-xs text-zinc-400 font-semibold">Developers environment tracking Razorpay webhooks, AWS SQS confirmation email queues, and RBAC logs</p>
        </div>

        <div className="flex items-center gap-2 border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search system logs..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold text-zinc-700 w-full placeholder:text-zinc-400 p-0"
          />
        </div>
      </div>

      {/* Terminal Screen Console layout */}
      <div className="bg-zinc-950 rounded-[28px] p-6 border border-zinc-900 shadow-2xl relative overflow-hidden font-mono text-[11px] leading-relaxed">
        {/* Terminal Header Bar */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-900 text-zinc-500 font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="ml-2 text-zinc-600">triptay-enterprise-console:~ audits --live</span>
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500/80 animate-pulse">
            ● Streaming active
          </span>
        </div>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
          {filteredAudits.map(log => (
            <div key={log.id} className="flex gap-4 items-start py-1.5 hover:bg-zinc-900/40 px-2 rounded-xl transition-all">
              <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
              <span className={cn(
                "font-black tracking-wider text-[10px] uppercase px-1.5 py-0.5 rounded flex-shrink-0 select-none min-w-[75px] text-center",
                log.type === "Webhook" && "bg-purple-950 text-purple-400",
                log.type === "SQS Queue" && "bg-blue-950 text-blue-400",
                log.type === "Security" && "bg-rose-950 text-rose-400",
                log.type === "System" && "bg-zinc-800 text-zinc-300"
              )}>
                {log.type}
              </span>
              <span className="text-zinc-300 flex-1 leading-relaxed">
                {log.event}
              </span>
              <span className={cn(
                "font-bold uppercase tracking-wider text-[9px] flex-shrink-0 select-none",
                log.status === "Success" && "text-emerald-500",
                log.status === "Failed" && "text-rose-500",
                log.status === "Blocked" && "text-rose-500 font-black animate-pulse"
              )}>
                [{log.status}]
              </span>
            </div>
          ))}

          {filteredAudits.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              No matching log records detected in active streaming window.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
