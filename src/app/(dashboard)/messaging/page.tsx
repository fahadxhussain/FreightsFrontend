"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PaperPlaneTilt,
  ArrowLeft,
  CircleNotch,
  Package,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

interface Conversation {
  conversationId: string;
  lastMessage: {
    _id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  otherUserId: string;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  read: boolean;
  createdAt: string;
}

export default function MessagingPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(res.data?.data ?? []);
      await api.put(`/messages/conversations/${conversationId}/read`);
    } catch {
      toast.error("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv);
    }
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    setIsSending(true);
    try {
      const conv = conversations.find((c) => c.conversationId === selectedConv);
      if (!conv) return;

      await api.post("/messages/send", {
        conversationId: selectedConv,
        recipientId: conv.otherUserId,
        content: newMessage.trim(),
      });

      setNewMessage("");
      fetchMessages(selectedConv);
      fetchConversations();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to send message";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherName = (conv: Conversation) => {
    return `User ${conv.otherUserId.slice(-6).toUpperCase()}`;
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 border-r border-hairline bg-canvas flex flex-col">
        <div className="p-4 border-b border-hairline">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Messages</h2>
          <div className="relative mt-3">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-xl border border-hairline bg-card pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-ink"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <CircleNotch size={24} weight="bold" className="animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <Package size={40} weight="thin" className="mb-3 opacity-20" />
              <p className="text-xs font-bold ">No conversations</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => setSelectedConv(conv.conversationId)}
                className={cn(
                  "w-full px-4 py-3 border-b border-hairline hover:bg-surface-soft transition-colors text-left",
                  selectedConv === conv.conversationId && "bg-surface-soft border-hairline",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                    {getOtherName(conv).slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink truncate">
                        {getOtherName(conv)}
                      </span>
                      <span className="text-[9px] text-muted shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-muted truncate">
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-white ml-2">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col bg-canvas">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-hairline flex items-center gap-3">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden text-muted hover:text-ink"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                {(() => {
                  const conv = conversations.find((c) => c.conversationId === selectedConv);
                  return conv ? getOtherName(conv).slice(0, 2) : "?";
                })()}
              </div>
              <span className="text-sm font-semibold text-ink">
                {(() => {
                  const conv = conversations.find((c) => c.conversationId === selectedConv);
                  return conv ? getOtherName(conv) : "";
                })()}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg._id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 text-xs",
                        isMine
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-card border border-hairline text-ink rounded-bl-md",
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className={cn("text-[8px] mt-1", isMine ? "text-white/60" : "text-muted")}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-hairline flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-hairline bg-card px-4 py-2.5 text-xs font-medium outline-none focus:border-ink"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !newMessage.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-active disabled:opacity-40 transition-colors"
              >
                {isSending ? (
                  <CircleNotch size={18} weight="bold" className="animate-spin" />
                ) : (
                  <PaperPlaneTilt size={18} weight="bold" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            <div className="text-center">
              <PaperPlaneTilt size={48} weight="thin" className="mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold ">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
