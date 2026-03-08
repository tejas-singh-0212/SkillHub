"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  listenToReceivedBookings,
  listenToSentBookings,
  updateBookingStatus,
} from "@/lib/bookings";
import { hasReviewedBooking } from "@/lib/reviews";
import { createConversation } from "@/lib/messages";
import ReviewForm from "@/components/ReviewForm";
import { BookingsSkeleton } from "@/components/Skeletons";
import toast from "react-hot-toast";

export default function BookingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("received");
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [sentBookings, setSentBookings] = useState([]);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState({});

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Listen to bookings
  useEffect(() => {
    if (!user) return;

    const unsub1 = listenToReceivedBookings(user.uid, (bookings) => {
      setReceivedBookings(
        bookings.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        )
      );
    });

    const unsub2 = listenToSentBookings(user.uid, (bookings) => {
      setSentBookings(
        bookings.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        )
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  // Check which bookings have been reviewed
  useEffect(() => {
    if (!user) return;

    const checkReviews = async () => {
      const allBookings = [...receivedBookings, ...sentBookings];
      const completed = allBookings.filter((b) => b.status === "completed");

      const reviewStatus = {};
      for (const booking of completed) {
        const reviewed = await hasReviewedBooking(booking.id, user.uid);
        reviewStatus[booking.id] = reviewed;
      }
      setReviewedBookings(reviewStatus);
    };

    checkReviews();
  }, [receivedBookings, sentBookings, user]);

  // Action Handlers (Now with Toasts!)

  const handleAccept = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, "accepted");
      toast.success("Booking accepted! 🎉");
    } catch (err) {
      toast.error("Failed to accept booking: " + err.message);
    }
  };

  const handleDecline = async (bookingId) => {
    if (!confirm("Are you sure you want to decline this request?")) return;
    try {
      await updateBookingStatus(bookingId, "declined");
      toast.success("Booking declined.");
    } catch (err) {
      toast.error("Failed to decline booking: " + err.message);
    }
  };

  const handleComplete = async (bookingId) => {
    if (!confirm("Mark this session as completed?")) return;
    try {
      await updateBookingStatus(bookingId, "completed");
      toast.success("Session completed! ⭐");
    } catch (err) {
      toast.error("Failed to complete booking: " + err.message);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel your request?")) return;
    try {
      await updateBookingStatus(bookingId, "cancelled");
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error("Failed to cancel booking: " + err.message);
    }
  };

  const handleMessage = async (otherUserId, otherUserName, otherUserAvatar) => {
    if (!user || !profile) return;
    try {
      const convoId = await createConversation(
        { id: user.uid, name: profile.name, avatar: profile.avatar },
        { id: otherUserId, name: otherUserName, avatar: otherUserAvatar }
      );
      router.push(`/messages?convo=${convoId}`);
    } catch (err) {
      toast.error("Error starting chat: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      declined: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  if (authLoading) {
    return <BookingsSkeleton />;
  }

  const currentBookings =
    tab === "received" ? receivedBookings : sentBookings;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">📅 My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("received")}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            tab === "received"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📩 Received ({receivedBookings.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            tab === "sent"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📤 Sent ({sentBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {currentBookings.length === 0 ? (
         <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <p className="text-5xl opacity-80 cursor-default">📅</p>
          </div>
          <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">
            {tab === "received"
              ? "When someone books your skills, it will appear here."
              : "Book someone's skills from their profile to get started."}
          </p>
          <button
            onClick={() => router.push("/search")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            🔍 Find Skills
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      tab === "received"
                        ? booking.requesterAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            booking.requesterName || "U"
                          )}&background=random`
                        : booking.providerAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            booking.providerName || "U"
                          )}&background=random`
                    }
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{booking.skillName}</h3>
                    <p className="text-sm text-gray-600">
                      {tab === "received"
                        ? `From: ${booking.requesterName}`
                        : `With: ${booking.providerName}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-gray-500">
                        📅 {booking.scheduledDate} at {booking.scheduledTime}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⏱️ {booking.duration} min
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      {booking.paymentType === "free"
                        ? "🆓 Free"
                        : booking.paymentType === "barter"
                        ? `🔄 Barter: ${booking.barterExchange}`
                        : `💰 ₹${booking.amount} (${booking.duration} min session)`}
                    </p>
                    {booking.message && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        &quot;{booking.message}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Provider actions on pending */}
                  {tab === "received" && booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAccept(booking.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id)}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
                      >
                        ❌ Decline
                      </button>
                    </>
                  )}

                  {/* Requester cancel on pending */}
                  {tab === "sent" && booking.status === "pending" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Mark complete on accepted */}
                  {booking.status === "accepted" && (
                    <button
                      onClick={() => handleComplete(booking.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}

                  {/* Review on completed */}
                  {booking.status === "completed" &&
                    !reviewedBookings[booking.id] && (
                      <button
                        onClick={() => setReviewingBooking(booking)}
                        className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm hover:bg-yellow-200"
                      >
                        ⭐ Review
                      </button>
                    )}

                  {booking.status === "completed" &&
                    reviewedBookings[booking.id] && (
                      <span className="text-green-600 text-sm py-2">
                        Reviewed
                      </span>
                    )}

                  {/* Message button for accepted/completed */}
                  {(booking.status === "accepted" ||
                    booking.status === "completed") && (
                    <button
                      onClick={() =>
                        handleMessage(
                          tab === "received"
                            ? booking.requesterId
                            : booking.providerId,
                          tab === "received"
                            ? booking.requesterName
                            : booking.providerName,
                          tab === "received"
                            ? booking.requesterAvatar
                            : booking.providerAvatar
                        )
                      }
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                    >
                      💬 Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">⭐ Leave a Review</h2>
              <button
                onClick={() => setReviewingBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              How was your session for &quot;{reviewingBooking.skillName}&quot;?
            </p>
            <ReviewForm
              bookingId={reviewingBooking.id}
              revieweeId={
                tab === "received"
                  ? reviewingBooking.requesterId
                  : reviewingBooking.providerId
              }
              onComplete={() => {
                setReviewingBooking(null);
                setReviewedBookings({
                  ...reviewedBookings,
                  [reviewingBooking.id]: true,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}