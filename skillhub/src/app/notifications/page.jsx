"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  listenToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";
import { listenToTotalUnreadMessages } from "@/lib/messages";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

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

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsRead(user.uid);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationRead(user.uid, notif.id);
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
        router.push(`/profile/${user.uid}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    const icons = {
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

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🔔 Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 || unreadMessages > 0
              ? `${unreadCount} notification${unreadCount !== 1 ? "s" : ""}, ${unreadMessages} message${unreadMessages !== 1 ? "s" : ""} unread`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Unread Messages Card */}
      {unreadMessages > 0 && (
        <div
          onClick={() => router.push("/messages")}
          className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5 cursor-pointer hover:bg-blue-100 transition"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">💬</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800">
                {unreadMessages} Unread Message{unreadMessages > 1 ? "s" : ""}
              </h3>
              <p className="text-blue-600">
                You have conversations waiting for your reply
              </p>
            </div>
            <div className="text-blue-400 text-2xl">→</div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔔</p>
          <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
          <p className="text-gray-600">
            When you receive bookings, messages, or reviews, they'll appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition ${
                !notif.isRead ? "border-blue-300 bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-semibold ${
                        !notif.isRead ? "text-blue-800" : "text-gray-800"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}