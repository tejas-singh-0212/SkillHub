"use client";

import { useState } from "react";
import { submitReview } from "@/lib/reviews";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";

interface ReviewFormProps {
  bookingId: string;
  revieweeId: string;
  onComplete?: () => void;
}

export default function ReviewForm({ bookingId, revieweeId, onComplete }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating to continue.");
      return;
    }

    setLoading(true);
    try {
      await submitReview({
        bookingId,
        reviewerId: user!.uid,
        reviewerName: profile?.name || "",
        reviewerAvatar: profile?.avatar || "",
        revieweeId,
        rating,
        comment,
      });

      toast.success("Review submitted successfully! ⭐");
      if (onComplete) onComplete();
    } catch (err) {
      toast.error("Error submitting review: " + (err as Error).message);
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
            <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-3xl transition transform hover:scale-110">
              {star <= (hoverRating || rating) ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience?" rows={3} className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm hover:shadow">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">🔄</span> Submitting...
          </span>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
