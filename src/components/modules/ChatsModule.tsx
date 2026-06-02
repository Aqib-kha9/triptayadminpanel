import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  User,
  Home,
  ShieldAlert,
  Radio,
  CornerDownRight,
  ArrowLeft
} from "lucide-react";
import type { ChatRoom } from "../../types";

interface ChatsModuleProps {
  chatRooms: ChatRoom[];
  onSendMessage: (roomId: string, text: string, sender: "Guest" | "Host" | "Admin") => void;
  onSimulateIncoming: (roomId: string, text: string, sender: "Guest" | "Host") => void;
}

export const ChatsModule: React.FC<ChatsModuleProps> = ({
  chatRooms,
  onSendMessage,
  onSimulateIncoming
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(chatRooms[0]?.id || "");
  const [inputText, setInputText] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedRoom?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoomId) return;
    onSendMessage(selectedRoomId, inputText, "Admin");
    setInputText("");
  };

  const triggerQuickReply = (text: string) => {
    if (!selectedRoomId) return;
    onSendMessage(selectedRoomId, text, "Admin");
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  const handleSimulateReply = (sender: "Guest" | "Host") => {
    if (!selectedRoomId) return;
    const phrases = [
      "Let me check the booking calendar again.",
      "Yes, that works for me. Thanks for intervening.",
      "Can we resolve this with a 50% refund instead?",
      "I have uploaded the bill to the platform portal.",
      "We will follow the guidelines provided by the administrator."
    ];
    const text = `[WS Simulated] ${phrases[Math.floor(Math.random() * phrases.length)]}`;
    onSimulateIncoming(selectedRoomId, text, sender);
  };

  // Quick replies configuration
  const quickReplies = [
    "Hello. I am the Triptay Support Admin. How can I help resolve this issue?",
    "Please cooperate with each other while we verify the transaction ledger details.",
    "This booking has been flagged for violating platform policies. We are reviewing it.",
    "The admin team has initiated the refund process. It will reflect in your wallet.",
    "We have released the payouts for this stay. Please verify your bank accounts."
  ];

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[620px]">
      
      {/* LEFT COLUMN: Channels List */}
      <div className={`w-full lg:w-80 border-r border-zinc-100 flex-col bg-zinc-50/20 ${mobileView === "chat" ? "hidden lg:flex" : "flex"} h-full`}>
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight">Support Channels</h3>
            <p className="text-[10px] text-zinc-400 font-bold">WebSocket Gateway Live</p>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatRooms.map(room => {
            const isSelected = room.id === selectedRoomId;
            return (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={`w-full text-left p-4 rounded-[24px] border transition-all ${
                  isSelected 
                    ? "bg-white border-zinc-200/80 shadow-md shadow-zinc-100/50 scale-[1.01]" 
                    : "bg-transparent border-transparent hover:bg-zinc-100/50 text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span className="text-xs font-black text-zinc-800 truncate">
                      {room.guestName}
                    </span>
                  </div>
                  {room.unreadCount > 0 && !isSelected && (
                    <span className="bg-primary text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center min-w-[16px]">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 mb-2 truncate">
                  <Home className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{room.propertyName}</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-500 truncate italic">
                  {room.lastMessage}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Conversation Stream */}
      {selectedRoom ? (
        <div className={`flex-1 flex-col h-full bg-white justify-between ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
          {/* Active Chat Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={handleBackToList}
                className="lg:hidden p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 flex-shrink-0"
                aria-label="Back to channels"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-zinc-800 truncate">
                    {selectedRoom.guestName} <span className="text-zinc-400 font-bold">and</span> {selectedRoom.hostName}
                  </h4>
                  <span className="bg-zinc-100 text-zinc-500 border border-zinc-200/50 px-2 py-0.5 text-[8px] font-black tracking-tight rounded-md flex-shrink-0">
                    {selectedRoom.id}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5 flex items-center gap-1 truncate">
                  <Home className="w-3 h-3 text-zinc-300 flex-shrink-0" /> {selectedRoom.propertyName}
                </p>
              </div>
            </div>

            {/* Simulated Live WebSockets Trigger Buttons */}
            <div className="hidden sm:flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 flex-shrink-0">
              <span className="text-[9px] font-black text-zinc-400 px-2 flex items-center gap-1 uppercase">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Mock WS
              </span>
              <button
                onClick={() => handleSimulateReply("Guest")}
                className="px-2.5 py-1 text-[9px] font-black tracking-tight rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
              >
                + Guest
              </button>
              <button
                onClick={() => handleSimulateReply("Host")}
                className="px-2.5 py-1 text-[9px] font-black tracking-tight rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
              >
                + Host
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/10">
            <div className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex gap-3 text-[10px] text-rose-500 font-bold leading-normal">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-black uppercase tracking-tight block mb-0.5">Policy compliance monitor</span>
                Admin is active as a third-party arbitrator. Messages dispatched by you will stream immediately to both Guest and Host nodes.
              </div>
            </div>

            {selectedRoom.messages.map((msg, index) => {
              const isAdmin = msg.sender === "Admin";
              const isGuest = msg.sender === "Guest";
              
              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap">
                    <span className="text-[9px] font-black text-zinc-400">
                      {msg.sender === "Admin" ? "System Arbitrator" : msg.sender === "Guest" ? `Guest (${selectedRoom.guestName})` : `Host (${selectedRoom.hostName})`}
                    </span>
                    <span className="text-[8px] text-zinc-300 font-bold hidden sm:inline">•</span>
                    <span className="text-[8px] text-zinc-300 font-bold">{msg.timestamp}</span>
                  </div>
                  
                  <div className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-[22px] text-xs font-bold leading-relaxed ${
                    isAdmin 
                      ? "bg-gradient-to-r from-primary to-rose-500 text-white rounded-tr-none shadow-md shadow-primary/10" 
                      : isGuest 
                        ? "bg-white border border-zinc-100 text-zinc-700 rounded-tl-none shadow-sm"
                        : "bg-blue-50/80 border border-blue-100 text-blue-800 rounded-tl-none shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Panel */}
          <div className="px-4 sm:px-6 py-3 border-t border-zinc-50 bg-zinc-50/30">
            <p className="text-[9px] font-black text-zinc-400 uppercase mb-2 flex items-center gap-1">
              <CornerDownRight className="w-3.5 h-3.5" /> Suggested Quick Replies
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => triggerQuickReply(reply)}
                  className="px-2.5 sm:px-3 py-1.5 text-[9px] font-bold bg-white border border-zinc-100 text-zinc-500 rounded-xl hover:border-primary hover:text-primary transition-colors max-w-[200px] sm:max-w-[280px] truncate text-left"
                  title={reply}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Editor Input */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-zinc-100 flex gap-2 sm:gap-3 items-center bg-white"
          >
            <input
              type="text"
              placeholder="Type message as System Arbitrator..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-w-0 bg-zinc-50 border border-zinc-100 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-r from-primary to-rose-500 text-white flex items-center justify-center hover:brightness-105 active:scale-95 transition-all shadow-md shadow-primary/20 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center">
          <MessageSquare className="w-8 h-8 text-zinc-300 mb-2" />
          <p className="text-xs font-black text-zinc-400">Select a support channel to view messages</p>
        </div>
      )}
    </div>
  );
};
