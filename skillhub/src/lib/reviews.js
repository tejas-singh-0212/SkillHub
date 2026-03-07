import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";

// Submit a review + NOTIFY reviewee
export async function submitReview(reviewData) {
  // Create review
  await addDoc(collection(db, "reviews"), {
    bookingId: reviewData.bookingId,
    reviewerId: reviewData.reviewerId,
    reviewerName: reviewData.reviewerName,
    reviewerAvatar: reviewData.reviewerAvatar || "",
    revieweeId: reviewData.revieweeId,
    rating: reviewData.rating,
    comment: reviewData.comment || "",
    createdAt: serverTimestamp(),
  });

  // Recalculate average rating
  const reviewsSnap = await getDocs(
    query(
      collection(db, "reviews"),
      where("revieweeId", "==", reviewData.revieweeId)
    )
  );

  let totalRating = 0;
  reviewsSnap.forEach((doc) => {
    totalRating += doc.data().rating;
  });

  const avgRating = totalRating / reviewsSnap.size;

  await updateDoc(doc(db, "users", reviewData.revieweeId), {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviewsSnap.size,
  });

  // notify: User about new review
  await createNotification(reviewData.revieweeId, {
    type: "new_review",
    title: "New Review Received! ⭐",
    message: `${reviewData.reviewerName} left you a ${reviewData.rating}-star review`,
    fromUserId: reviewData.reviewerId,
    bookingId: reviewData.bookingId,
  });
}

// Get reviews for a user
export async function getReviewsForUser(userId) {
  const q = query(
    collection(db, "reviews"),
    where("revieweeId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
}

// Check if user already reviewed a booking
export async function hasReviewedBooking(bookingId, reviewerId) {
  const q = query(
    collection(db, "reviews"),
    where("bookingId", "==", bookingId),
    where("reviewerId", "==", reviewerId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}