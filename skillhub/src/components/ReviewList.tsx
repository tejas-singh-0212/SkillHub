"use client";

import type { Review } from "@/types";
import Image from "next/image";

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-3xl mb-2">📝</p>
        <p>No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Image
              unoptimized
              src={review.reviewerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewerName || "U")}&background=random`}
              alt=""
              width={40} height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-sm">{review.reviewerName}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-sm">
                    {star <= review.rating ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {review.comment && <p className="text-gray-700 text-sm mt-2">{review.comment}</p>}
          <p className="text-xs text-gray-400 mt-2">
            {review.createdAt && "toDate" in review.createdAt
              ? (review.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
              : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
