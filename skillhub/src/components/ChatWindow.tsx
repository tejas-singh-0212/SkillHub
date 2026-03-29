"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { listenToMessages, sendMessage, loadOlderMessages } from "@/lib/messages";
import { useAuth } from "@/components/AuthProvider";
import type { Message } from "@/types";

interface ChatWindowProps {
  conversationId: string | undefined;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setHasOlderMessages(true);
    setInitialLoad(true);

    const unsubscribe = listenToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      if (initialLoad) {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "auto" });
          setInitialLoad(false);
        }, 100);
      } else {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleScroll = useCallback(async () => {
    const container = chatContainerRef.current;
    if (!container || loadingOlder || !hasOlderMessages || messages.length === 0) return;
    if (container.scrollTop < 50) {
      setLoadingOlder(true);
      try {
        const oldestMessage = messages[0];
        const result = await loadOlderMessages(conversationId!, oldestMessage, 30);
        if (result.messages.length > 0) {
          const previousHeight = container.scrollHeight;
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = result.messages.filter((m) => !existingIds.has(m.id));
            return [...newMsgs, ...prev];
          });
          requestAnimationFrame(() => {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - previousHeight;
          });
        }
        setHasOlderMessages(result.hasMore);
      } catch (err) {
        console.error("Error loading older messages:", err);
      } finally {
        setLoadingOlder(false);
      }
    }
  }, [conversationId, loadingOlder, hasOlderMessages, messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(conversationId!, user!.uid, newMsg.trim());
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: Message["createdAt"]) => {
    if (!timestamp || !("toDate" in timestamp)) return "";
    return (timestamp as { toDate: () => Date }).toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: Message["createdAt"]) => {
    if (!timestamp || !("toDate" in timestamp)) return "";
    const date = (timestamp as { toDate: () => Date }).toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getMessageDate = (msg: Message) => {
    if (!msg.createdAt || !("toDate" in msg.createdAt)) return "";
    return (msg.createdAt as { toDate: () => Date }).toDate().toDateString();
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-5xl mb-4">💬</p>
          <p className="text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingOlder && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-400 animate-pulse">Loading older messages...</span>
          </div>
        )}
        {!hasOlderMessages && messages.length > 0 && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-400">📜 Beginning of conversation</span>
          </div>
        )}
        {messages.length === 0 && !loadingOlder && (
          <div className="text-center text-gray-400 mt-20 animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <p className="text-4xl opacity-80 cursor-default">👋</p>
            </div>
            <p className="font-medium">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const showDate = index === 0 || getMessageDate(msg) !== getMessageDate(messages[index - 1]);
          return (
            <div key={msg.id}>
              {showDate && msg.createdAt && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              )}
              <div className={`flex ${msg.senderId === user!.uid ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === user!.uid ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-200 text-gray-800 rounded-bl-sm"}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === user!.uid ? "text-blue-200" : "text-gray-500"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder="Type a message..." className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSend} disabled={!newMsg.trim() || sending} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
