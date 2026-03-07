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


export async function submitReview(reviewData) {

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
}

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

export async function hasReviewedBooking(bookingId, reviewerId) {
  const q = query(
    collection(db, "reviews"),
    where("bookingId", "==", bookingId),
    where("reviewerId", "==", reviewerId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}