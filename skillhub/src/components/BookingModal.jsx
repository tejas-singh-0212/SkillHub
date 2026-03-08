"use client";

import { useState } from "react";
import { createBooking, checkBookingConflict  } from "@/lib/bookings";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast"; 

export default function BookingModal({ skill, provider, onClose }) {
  const { user, profile } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [paymentType, setPaymentType] = useState(skill?.priceType || "free");
  const [barterOffer, setBarterOffer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!date || !time) return;

  setLoading(true);
  try {
    // 1. Check for conflicts first
    const hasConflict = await checkBookingConflict(provider.id, date, time);
    
    if (hasConflict) {
      toast.error("This time slot is already booked or pending. Please choose another time.");
      setLoading(false);
      return; // Stop the execution here!
    }

    // 2. If no conflict, create the booking
    await createBooking({
      requesterId: user.uid,
      requesterName: profile?.name || "",
      requesterAvatar: profile?.avatar || "",
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar || "",
      skillName: skill.name,
      date,
      time,
      duration,
      paymentType,
      amount: paymentType === "paid" ? skill.price : 0,
      barterExchange: barterOffer,
      message,
    });
    
    setSuccess(true);
    toast.success("Booking request sent! 📨"); 
    
    setTimeout(() => onClose(), 2000);
  } catch (err) {
    toast.error("Error creating booking: " + err.message); 
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Booking Sent!</h2>
          <p className="text-gray-600">
            {provider.name} will receive your request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📅 Book Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="font-medium">{skill.name}</p>
          <p className="text-sm text-gray-600">with {provider.name}</p>
          
          {/* Pricing Info Display */}
          {skill.priceType === "paid" && (
            <p className="text-sm font-semibold text-orange-600 mt-1">
              💰 ₹{skill.price} {skill.perUnit === "hour" ? "per hour" : skill.perUnit === "session" ? "per session" : skill.perUnit === "day" ? "per day" : skill.perUnit}
            </p>
          )}
          {skill.priceType === "free" && (
            <p className="text-sm font-semibold text-green-600 mt-1">🆓 Free</p>
          )}
          {skill.priceType === "barter" && (
            <p className="text-sm font-semibold text-blue-600 mt-1">🔄 Barter Exchange</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["free", "paid", "barter"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
                    paymentType === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {type === "free"
                    ? "🆓 Free"
                    : type === "paid"
                    ? `💰 ₹${skill.price}/${skill.perUnit === "hour" ? "hr" : skill.perUnit === "session" ? "sess" : skill.perUnit === "day" ? "day" : skill.perUnit}`
                    : "🔄 Barter"}
                </button>
              ))}
            </div>
          </div>

          {paymentType === "barter" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                What will you offer in return?
              </label>
              <input
                type="text"
                value={barterOffer}
                onChange={(e) => setBarterOffer(e.target.value)}
                placeholder="e.g., I'll teach you cooking"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd love to learn from you..."
              rows={2}
              className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !date || !time}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}