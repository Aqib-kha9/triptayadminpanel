import React, { useState } from "react";
import { Database, Search, Terminal, Play, AlertCircle } from "lucide-react";
import type { AuditLog } from "../../types";

interface AuditsModuleProps {
  audits: AuditLog[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSimulateLog: (type: "Webhook" | "SQS Queue" | "Security" | "System", event: string, status: "Success" | "Failed" | "Blocked") => void;
}

export const AuditsModule: React.FC<AuditsModuleProps> = ({
  audits,
  searchTerm,
  setSearchTerm,
  onSimulateLog
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const filteredAudits = audits.filter(log => 
    log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulate = (eventKey: "razorpay" | "sqs" | "whatsapp" | "ratelimit") => {
    const randomHex = Math.random().toString(36).substring(7).toUpperCase();
    const randomIp = `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
    
    switch (eventKey) {
      case "razorpay":
        onSimulateLog(
          "Webhook", 
          `Razorpay payment capture webhook success: pay_RZP${randomHex} for transaction amount ₹${(Math.floor(Math.random() * 25000) + 1500).toLocaleString()}`, 
          "Success"
        );
        break;
      case "sqs":
        onSimulateLog(
          "SQS Queue",
          `AWS SQS Job: Invoice PDF generation completed & pushed to S3 bucket /triptay-invoices/INV-BOK-${randomHex}.pdf`,
          "Success"
        );
        break;
      case "whatsapp":
        onSimulateLog(
          "Webhook",
          `Twilio WhatsApp Gateway: Delivery failed (Recipient node offline) for dispatch template code MSG_KYC_${randomHex}`,
          "Failed"
        );
        break;
      case "ratelimit":
        onSimulateLog(
          "Security",
          `Blocked rogue API access attempt: Rate limits exceeded (HTTP 429 served) on route /api/admin/configs from client node ${randomIp}`,
          "Blocked"
        );
        break;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Developer Simulator Control Panel */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-4">
        <div>
          <h4 className="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1.5 uppercase">
            <Terminal className="w-4 h-4 text-primary" /> Developer Webhook & SQS Queue Simulator
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Simulate background event streams and gateway callbacks directly to the operations audit queues</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleSimulate("razorpay")}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 rounded-2xl text-[10px] font-black tracking-tight transition-all active:scale-[0.97] flex items-center justify-between"
          >
            <span>Razorpay Webhook (Success)</span>
            <Play className="w-3.5 h-3.5 fill-purple-600/10" />
          </button>
          
          <button
            onClick={() => handleSimulate("sqs")}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-2xl text-[10px] font-black tracking-tight transition-all active:scale-[0.97] flex items-center justify-between"
          >
            <span>AWS SQS Job (PDF Generated)</span>
            <Play className="w-3.5 h-3.5 fill-blue-600/10" />
          </button>

          <button
            onClick={() => handleSimulate("whatsapp")}
            className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 rounded-2xl text-[10px] font-black tracking-tight transition-all active:scale-[0.97] flex items-center justify-between"
          >
            <span>Twilio WhatsApp (Failed Bounce)</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleSimulate("ratelimit")}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-2xl text-[10px] font-black tracking-tight transition-all active:scale-[0.97] flex items-center justify-between"
          >
            <span>Intruder Rate-Limit (Blocked)</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>

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
            <div key={log.id} className="border-b border-zinc-900/30 pb-2 last:border-0">
              <div 
                onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: !prev[log.id] }))}
                className="flex gap-4 items-start py-1.5 hover:bg-zinc-900/40 px-2 rounded-xl transition-all cursor-pointer select-none"
              >
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
              {expandedLogs[log.id] && (log as any).details && (
                <div className="pl-6 pr-4 py-2 border-t border-zinc-900/60 mt-1 bg-zinc-950/80 rounded-lg">
                  <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Payload Telemetry Details:</span>
                  <pre className="text-zinc-400 text-[10px] whitespace-pre-wrap overflow-x-auto select-text font-mono leading-normal">
                    {JSON.stringify((log as any).details, null, 2)}
                  </pre>
                </div>
              )}
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
  </div>
  );
};
