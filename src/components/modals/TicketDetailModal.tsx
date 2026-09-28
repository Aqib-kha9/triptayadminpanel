import React, { useState } from "react";
import { X, AlertTriangle, MessageSquare, CreditCard, Clock, CheckCircle2, User, Hash, FileText } from "lucide-react";
import type { Ticket } from "../../types";

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onRefresh: () => void;
}

export function TicketDetailModal({ ticket, onClose, onRefresh }: TicketDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [resolution, setResolution] = useState(ticket.resolution || "");
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      const res = await fetch(`${API_BASE}/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, resolution })
      });
      
      const data = await res.json();
      if (res.ok && data.status === "success") {
        onRefresh();
        onClose();
      } else {
        setError(data.message || "Failed to update ticket.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "OPEN": return "bg-orange-100 text-orange-600 border-orange-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-600 border-blue-200";
      case "RESOLVED": return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "REJECTED": return "bg-rose-100 text-rose-600 border-rose-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-black text-zinc-900">{ticket.ticketRef}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-zinc-200 text-zinc-700">
                {ticket.type}
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-500">Submitted on {new Date(ticket.createdAt || "").toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors border border-zinc-200 text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">User Details</p>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 mb-1">
                <User className="w-4 h-4 text-zinc-400" /> {ticket.name}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-600">
                {ticket.email}
              </div>
            </div>
            {(ticket.bookingId || ticket.againstUserId) && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">References</p>
                {ticket.bookingId && (
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-1">
                    <Hash className="w-4 h-4 text-blue-500" /> Booking: {ticket.bookingId}
                  </div>
                )}
                {ticket.againstUserId && (
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                    <User className="w-4 h-4 text-blue-500" /> Against: {ticket.againstUserId}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-zinc-900">Subject</h4>
            <p className="text-sm font-bold text-zinc-700 bg-zinc-50 p-4 rounded-xl border border-zinc-100">{ticket.subject}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-zinc-900">Description</h4>
            <div className="text-sm font-medium text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-100 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Admin Actions */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-zinc-900">Arbitration Actions</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500">Update Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-800 focus:outline-none focus:border-primary"
                >
                  <option value="OPEN">OPEN (Pending)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Under Review)</option>
                  <option value="RESOLVED">RESOLVED (Closed)</option>
                  <option value="REJECTED">REJECTED (Invalid)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">Resolution Note (Internal / Shared with user upon request)</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Document the resolution, refund details, or steps taken..."
                className="w-full h-24 p-4 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 focus:outline-none focus:border-primary resize-none custom-scrollbar"
              />
            </div>
          </div>
          
          {error && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-zinc-900 hover:bg-black transition-colors shadow-lg shadow-zinc-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Saving..." : "Save Changes"}
            {!loading && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
