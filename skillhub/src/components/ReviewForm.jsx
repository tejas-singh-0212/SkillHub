"use client";

import { useState } from "react";
import { submitReview } from "@/lib/reviews";
import { useAuth } from "./AuthProvider";

export default function ReviewForm({ bookingId, revieweeId, onComplete }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      await submitReview({
        bookingId,
        reviewerId: user.uid,
        reviewerName: profile?.name || "",
        reviewerAvatar: profile?.avatar || "",
        revieweeId,
        rating,
        comment,
      });
      if (onComplete) onComplete();
    } catch (err) {
      alert("Error submitting review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition"
            >
              {star <= (hoverRating || rating) ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your experience?"
          rows={3}
          className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}