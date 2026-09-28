import { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { 
  ShieldAlert, 
  Search, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { TicketDetailModal } from "../components/modals/TicketDetailModal";
import type { Ticket } from "../types";

export default function HelpCenterPage() {
    const { tickets, ticketsLoading, refreshTickets } = useAdmin();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.ticketRef.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              t.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || t.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[36px] shadow-sm border border-zinc-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black text-zinc-800 tracking-tight flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-primary" /> Help Center & Ticketing
                        </h2>
                        <p className="text-xs text-zinc-500 font-bold mt-1">
                            Manage user support requests, billing issues, and disputes in one unified inbox.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500">Open Tickets</p>
                            <h4 className="text-lg font-black text-zinc-800">{tickets.filter(t => t.status === "OPEN").length}</h4>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500">Disputes</p>
                            <h4 className="text-lg font-black text-zinc-800">{tickets.filter(t => t.type === "DISPUTE").length}</h4>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500">Resolved Today</p>
                            <h4 className="text-lg font-black text-zinc-800">
                                {tickets.filter(t => t.status === "RESOLVED" && new Date(t.updatedAt || "").toDateString() === new Date().toDateString()).length}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by ticket ID, user name, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        {["ALL", "SUPPORT", "DISPUTE", "BILLING"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                                    filterType === type 
                                        ? "bg-zinc-800 text-white shadow-sm" 
                                        : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {ticketsLoading ? (
                        <div className="animate-pulse flex flex-col gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-zinc-50 rounded-2xl border border-zinc-100"></div>
                            ))}
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                            <h3 className="text-sm font-black text-zinc-400">No tickets found</h3>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1">There are no matching tickets in the system.</p>
                        </div>
                    ) : (
                        filteredTickets.map(ticket => (
                            <div key={ticket.id} className="p-4 rounded-2xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                                            {ticket.ticketRef}
                                        </span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                            ticket.type === "DISPUTE" ? "bg-rose-100 text-rose-600" :
                                            ticket.type === "BILLING" ? "bg-amber-100 text-amber-600" :
                                            "bg-blue-100 text-blue-600"
                                        }`}>
                                            {ticket.type}
                                        </span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                            ticket.status === "OPEN" ? "bg-orange-100 text-orange-600" :
                                            ticket.status === "RESOLVED" ? "bg-emerald-100 text-emerald-600" :
                                            "bg-zinc-100 text-zinc-600"
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-zinc-800 truncate mb-1">
                                        {ticket.subject}
                                    </h4>
                                    <p className="text-xs font-bold text-zinc-500 truncate">
                                        From: {ticket.name} ({ticket.email})
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                    <button 
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl transition-all border border-zinc-200"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedTicket && (
                <TicketDetailModal 
                    ticket={selectedTicket} 
                    onClose={() => setSelectedTicket(null)} 
                    onRefresh={refreshTickets}
                />
            )}
        </div>
    );
}
