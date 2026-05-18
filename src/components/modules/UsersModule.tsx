import React from "react";
import { Users, Coins, AlertCircle, Search } from "lucide-react";
import type { PlatformUser } from "../../types";

interface UsersModuleProps {
  users: PlatformUser[];
  toggleUserStatus: (id: string) => void;
  setSelectedUserForCoins: (user: PlatformUser) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const UsersModule: React.FC<UsersModuleProps> = ({
  users,
  toggleUserStatus,
  setSelectedUserForCoins,
  searchTerm,
  setSearchTerm
}) => {
  // Helper for conditional classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Total Registered Users</p>
            <h3 className="text-3xl font-black text-zinc-900">{users.length} Users</h3>
            <p className="text-[9px] text-blue-600 font-bold tracking-normal">Dual Mode integrations enabled</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-primary/5 transition-all">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Total Coins & Wallet Credits Issued</p>
            <h3 className="text-3xl font-black text-zinc-900">₹{users.reduce((sum, u) => sum + u.walletBalance, 0).toLocaleString()}</h3>
            <p className="text-[9px] text-primary font-bold tracking-normal">Redeemable in bookings</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 tracking-normal uppercase">Suspended Accounts</p>
            <h3 className="text-3xl font-black text-zinc-900">{users.filter(u => u.status === "Blocked").length}</h3>
            <p className="text-[9px] text-rose-500 font-bold tracking-normal">Terminated policy violators</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-50">
          <div>
            <h3 className="text-sm font-black text-zinc-900">Registered Users Directory</h3>
            <p className="text-xs text-zinc-400 font-semibold">Award loyalty coins, block policy violators, and manage wallet credits</p>
          </div>
          <div className="flex items-center gap-2 border border-zinc-100 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/10 transition-all bg-zinc-50 rounded-2xl px-4 py-2 w-full md:w-auto">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-zinc-700 w-full placeholder:text-zinc-400 p-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-black text-zinc-400">
                <th className="py-4 px-4">User ID</th>
                <th className="py-4 px-4">Personal Details</th>
                <th className="py-4 px-4">Account Role</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Wallet Balance</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
              {users.filter(u => 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(u => (
                <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-[10px] text-zinc-400">{u.id}</td>
                  <td className="py-4 px-4 space-y-1">
                    <p className="text-zinc-950 font-extrabold">{u.name}</p>
                    <p className="text-[10px] text-zinc-400 font-semibold">{u.email} • {u.phone}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[8px] font-black tracking-tight px-2 py-0.5 rounded",
                      u.role === "Dual Mode" && "bg-purple-50 text-purple-600 border border-purple-100",
                      u.role === "Vendor" && "bg-zinc-100 text-zinc-950",
                      u.role === "Guest" && "bg-zinc-100 text-zinc-500"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-400">{u.joinedDate}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[8px] font-black px-2 py-0.5 rounded-full border",
                      u.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-900 font-black">
                    ₹{u.walletBalance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUserForCoins(u)}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-black tracking-tight shadow-sm shadow-primary/5"
                    >
                      Award Coins
                    </button>
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all border",
                        u.status === "Active" 
                          ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white" 
                          : "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                      )}
                    >
                      {u.status === "Active" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
