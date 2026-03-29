"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import {
  listenToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";
import { listenToTotalUnreadMessages } from "@/lib/messages";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types";

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToTotalUnreadMessages(user.uid, (count) => {
      setUnreadMessages(count);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const totalBadgeCount = unreadNotifications + unreadMessages;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationRead(user!.uid, notif.id);
    }

    switch (notif.type) {
      case "new_booking":
      case "booking_accepted":
      case "booking_declined":
      case "booking_completed":
      case "booking_cancelled":
        router.push("/bookings");
        break;
      case "new_message":
        if (notif.conversationId) {
          router.push(`/messages?convo=${notif.conversationId}`);
        } else {
          router.push("/messages");
        }
        break;
      case "new_review":
        router.push(`/profile/${user!.uid}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (unreadNotifications === 0) return;
    setLoading(true);
    try {
      await markAllNotificationsRead(user!.uid);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string): string => {
    const icons: Record<string, string> = {
      new_booking: "📅",
      booking_accepted: "✅",
      booking_declined: "❌",
      booking_completed: "🎉",
      booking_cancelled: "🚫",
      new_message: "💬",
      new_review: "⭐",
    };
    return icons[type] || "🔔";
  };

  const formatTimeAgo = (timestamp: AppNotification["createdAt"]): string => {
    if (!timestamp || !("toDate" in timestamp)) return "";
    const now = new Date();
    const date = (timestamp as { toDate: () => Date }).toDate();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalBadgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalBadgeCount > 9 ? "9+" : totalBadgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {unreadMessages > 0 && (
                <p className="text-xs text-blue-600">
                  💬 {unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}
                </p>
              )}
            </div>
            {unreadNotifications > 0 && (
              <button onClick={handleMarkAllRead} disabled={loading} className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50">
                {loading ? "..." : "Mark all read"}
              </button>
            )}
          </div>

          {unreadMessages > 0 && (
            <div onClick={() => { router.push("/messages"); setIsOpen(false); }} className="flex items-center gap-3 p-4 border-b cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
              <div className="text-2xl">💬</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-800">{unreadMessages} Unread Message{unreadMessages > 1 ? "s" : ""}</p>
                <p className="text-sm text-blue-600">Tap to view your messages</p>
              </div>
              <div className="text-blue-400">→</div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && unreadMessages === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-4xl mb-2">🔔</p>
                <p>No notifications yet</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No other notifications</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => (
                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`flex items-start gap-3 p-4 border-b cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? "bg-blue-50" : ""}`}>
                  <div className="text-2xl flex-shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold" : "text-gray-700"}`}>{notif.title}</p>
                    <p className="text-sm text-gray-500 truncate">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>

          {(notifications.length > 0 || unreadMessages > 0) && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <button onClick={() => { router.push("/notifications"); setIsOpen(false); }} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
