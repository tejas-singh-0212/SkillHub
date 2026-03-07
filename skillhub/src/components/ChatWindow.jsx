"use client";

import { useState, useEffect, useRef } from "react";
import { listenToMessages, sendMessage } from "@/lib/messages";
import { useAuth } from "@/components/AuthProvider";

export default function ChatWindow({ conversationId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = listenToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, user.uid, newMsg.trim());
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-4xl mb-2">👋</p>
            <p>Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.senderId === user.uid
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.senderId === user.uid
                    ? "text-blue-200"
                    : "text-gray-500"
                }`}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}