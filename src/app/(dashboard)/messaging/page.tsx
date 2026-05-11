"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Paperclip,
  MapPin,
  Microphone,
  Phone,
  MagnifyingGlass,
  Package,
  Check,
  Checks,
  ArrowLeft,
  ArrowRight,
  DotsThreeVertical,
  CaretDown,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Alpha Logistics",
    avatar: "AL",
    lastMsg: "I'm about 20 miles out, should arrive by 3pm",
    time: "2m ago",
    unread: 2,
    loadId: "FL-20042",
    active: true,
  },
  {
    id: 2,
    name: "TransRoute LLC",
    avatar: "TR",
    lastMsg: "BOL has been uploaded to the vault",
    time: "1h ago",
    unread: 0,
    loadId: "FL-20041",
  },
  {
    id: 3,
    name: "Mike's Carriers",
    avatar: "MC",
    lastMsg: "Voice note",
    time: "Yesterday",
    unread: 0,
    loadId: "FL-20039",
  },
];

const MESSAGES = [
  {
    id: 1,
    type: "sent",
    content:
      "Hi Mike, load is confirmed. Please dispatch driver by 7:30 AM tomorrow.",
    time: "Apr 1, 4:30 PM",
    status: "read",
  },
  {
    id: 2,
    type: "received",
    content:
      "Confirmed. Mike Thompson will be driving FB-2847. He'll call 30 min before arrival.",
    time: "Apr 1, 4:45 PM",
  },
  {
    id: 3,
    type: "sent",
    content: "Perfect. All docs are in the vault — rate con and BOL ready.",
    time: "Apr 1, 5:00 PM",
    status: "read",
  },
  {
    id: 4,
    type: "received",
    content: "I'm about 20 miles out, should arrive by 3pm",
    time: "Apr 2, 2:30 PM",
    isVoice: true,
    duration: "0:34",
  },
  {
    id: 5,
    type: "received",
    content: "I-55 South, Springfield, MO",
    time: "Apr 2, 2:32 PM",
    isLocation: true,
  },
];

export default function MessagingPage() {
  const router = useRouter();
  const [activeConv, setActiveConv] = useState(1);
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar - Conversation List */}
      <div className="w-[360px] border-r border-border bg-background flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Messages
            </h2>
            <span className="badge badge-blue px-2.5 h-6">4 Unread</span>
          </div>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              className="w-full rounded-xl border border-border bg-input px-10 py-2.5 text-[13px] font-bold outline-none focus:border-accent transition-all"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {CONVERSATIONS.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={cn(
                "p-5 border-b border-border cursor-pointer transition-all relative group",
                activeConv === conv.id
                  ? "bg-accent-light"
                  : "hover:bg-card-hover",
              )}
            >
              {conv.active && activeConv !== conv.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
              )}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-white font-black text-sm shadow-lg shadow-accent/10">
                    {conv.avatar}
                  </div>
                  <strong className="text-[13px] font-black text-foreground">
                    {conv.name}
                  </strong>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase">
                  {conv.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-muted truncate max-w-[180px]">
                  {conv.lastMsg}
                </p>
                {conv.unread > 0 && (
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-accent text-[10px] font-black text-white shadow-lg shadow-accent/20">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="badge badge-blue h-5 px-2 text-[9px] font-black">
                  {conv.loadId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-accent text-white font-black text-lg shadow-xl shadow-accent/20">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-foreground">
                  Alpha Logistics
                </h4>
                <span className="badge badge-gray h-5 px-2 text-[9px] font-black">
                  CARRIER
                </span>
              </div>
              <div className="badge badge-blue h-5 px-2 text-[9px] font-black mt-1">
                FL-20042
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/loads/1")}
              className="btn btn-secondary h-10 px-4 text-[10px] font-black uppercase tracking-widest"
            >
              View Load
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-foreground transition-all">
              <Phone size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Context Banner */}
        <div className="px-6 py-2 bg-input/50 border-b border-border flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
            <Package size={14} weight="bold" className="text-accent" />
            Load #FL-20042 · Chicago → Dallas · $1,500
          </div>
          <span className="badge badge-amber h-5 px-2 text-[8px] font-black uppercase">
            In Transit
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[70%] space-y-1",
                msg.type === "sent" ? "ml-auto items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-2xl shadow-xl",
                  msg.type === "sent"
                    ? "bg-accent text-white rounded-tr-none"
                    : "bg-input border border-border text-foreground rounded-tl-none",
                )}
              >
                {msg.isVoice ? (
                  <div className="w-[200px] space-y-3">
                    <div className="flex items-center gap-3">
                      <Microphone
                        size={20}
                        weight="bold"
                        className={
                          msg.type === "sent" ? "text-white" : "text-accent"
                        }
                      />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Voice Note · {msg.duration}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-white/40" />
                    </div>
                    <p className="text-[11px] font-bold italic opacity-70">
                      [Transcription: I&apos;m about 20 miles out, should arrive
                      by 3pm]
                    </p>
                  </div>
                ) : msg.isLocation ? (
                  <div className="w-[200px] space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={20}
                        weight="bold"
                        className="text-success"
                      />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Shared Location
                      </span>
                    </div>
                    <div className="h-24 rounded-xl bg-black/5 border border-border/50 flex items-center justify-center">
                      <MapPin
                        size={32}
                        weight="duotone"
                        className="text-success/50"
                      />
                    </div>
                    <p className="text-xs font-bold">{msg.content}</p>
                  </div>
                ) : (
                  <p className="text-[13px] font-bold leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                  {msg.time}
                </span>
                {msg.type === "sent" && (
                  <Checks size={14} weight="bold" className="text-accent" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border">
          <div className="flex items-center gap-3 bg-input rounded-[2rem] border border-border p-2 shadow-inner focus-within:border-accent transition-all">
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-muted hover:bg-card hover:text-accent transition-all">
              <Paperclip size={20} weight="bold" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-muted hover:bg-card hover:text-accent transition-all">
              <MapPin size={20} weight="bold" />
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-foreground px-2"
            />
            <button
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full transition-all",
                message.trim()
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-muted hover:bg-card hover:text-accent",
              )}
            >
              {message.trim() ? (
                <ArrowRight size={20} weight="bold" />
              ) : (
                <Microphone size={20} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
