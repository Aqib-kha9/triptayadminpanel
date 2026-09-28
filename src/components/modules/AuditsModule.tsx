import React, { useState } from "react";
import { Database, Search, ChevronDown, ChevronRight, User, ShieldAlert, Activity, CreditCard, LayoutDashboard, Settings } from "lucide-react";
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
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const filteredAudits = audits.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actorEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch(category?.toLowerCase()) {
      case "auth": return <User className="w-4 h-4 text-blue-500" />;
      case "security": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case "payment": return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "system": return <Settings className="w-4 h-4 text-zinc-500" />;
      case "booking": return <Activity className="w-4 h-4 text-purple-500" />;
      default: return <LayoutDashboard className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusBadge = (statusCode?: number) => {
    if (!statusCode) return <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-bold">INFO</span>;
    if (statusCode >= 200 && statusCode < 300) return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">SUCCESS</span>;
    if (statusCode >= 400 && statusCode < 500) return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">WARNING</span>;
    return <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">FAILED</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/50">
          <div className="space-y-1">
            <h3 className="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-zinc-500" /> System Audit & Telemetry Logs
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Enterprise compliance logs tracking all administrative and system operations.</p>
          </div>

          <div className="flex items-center gap-2 border border-zinc-200 bg-white rounded-xl px-4 py-2.5 w-full md:w-80 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by action, category, or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-zinc-700 w-full placeholder:text-zinc-400 p-0"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredAudits.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: !prev[log.id] }))}
                    className="hover:bg-zinc-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 font-medium">
                      {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                          {log.actorEmail ? log.actorEmail.charAt(0).toUpperCase() : "-"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{log.actorEmail || "System"}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{log.actorRole || "Automated Process"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category || "")}
                        <span className="text-xs font-bold text-zinc-800">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-600 font-medium">
                      {log.resource ? `${log.resource} ${log.resourceId ? `(#${log.resourceId.slice(-6)})` : ""}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 font-mono">
                      {log.ip || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.statusCode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        {expandedLogs[log.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Payload Row */}
                  {expandedLogs[log.id] && (
                    <tr className="bg-zinc-50/50">
                      <td colSpan={7} className="px-6 py-4 border-b border-zinc-100">
                        <div className="bg-zinc-900 rounded-xl p-4 shadow-inner">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Payload & Telemetry Details</span>
                            {log.method && log.path && (
                              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                                {log.method} {log.path}
                              </span>
                            )}
                          </div>
                          <pre className="text-zinc-300 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {log.details ? JSON.stringify(log.details, null, 2) : "No additional payload details provided."}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredAudits.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <Database className="w-8 h-8 text-zinc-200 mb-3" />
              <h4 className="text-sm font-bold text-zinc-900">No Audit Logs Found</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">There are no operational logs matching your current search filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
