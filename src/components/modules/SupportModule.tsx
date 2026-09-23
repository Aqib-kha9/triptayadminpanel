import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquare, X } from "lucide-react";

export default function SupportModule() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/support`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setTickets(data.data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/support/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Resolved" })
      });
      
      if (res.ok) {
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "Resolved" } : t));
        if (selectedTicket?.id === id) {
          setSelectedTicket({ ...selectedTicket, status: "Resolved" });
        }
      }
    } catch (error) {
      console.error("An error occurred resolving ticket", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading tickets...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-6 overflow-hidden">
        <h3 className="text-sm font-black text-zinc-900 tracking-tight mb-6">Recent Tickets</h3>
        
        {tickets.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <MessageSquare className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-sm font-medium">No support tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  <th className="pb-3 px-4 font-black">Date</th>
                  <th className="pb-3 px-4 font-black">User</th>
                  <th className="pb-3 px-4 font-black">Subject</th>
                  <th className="pb-3 px-4 font-black">Status</th>
                  <th className="pb-3 px-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-zinc-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-900">{ticket.name}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{ticket.email}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-700">{ticket.subject}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${
                        ticket.status === "Resolved" ? "bg-emerald-100 text-emerald-700" :
                        ticket.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors uppercase"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900">Ticket Details</h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">From</label>
                  <p className="font-bold text-zinc-900 mt-1">{selectedTicket.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">{selectedTicket.email}</p>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</label>
                  <p className="font-bold text-zinc-900 mt-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-1 block">Subject</label>
                <div className="bg-zinc-50 px-4 py-3 rounded-2xl border border-zinc-100 font-bold text-zinc-800 text-sm">
                  {selectedTicket.subject}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-1 block">Message</label>
                <div className="bg-zinc-50 px-4 py-4 rounded-3xl border border-zinc-100 whitespace-pre-wrap text-sm text-zinc-600 font-medium leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Close
              </button>
              {selectedTicket.status !== "Resolved" && (
                <button 
                  onClick={() => handleResolve(selectedTicket.id)} 
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
