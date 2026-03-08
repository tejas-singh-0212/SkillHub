"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { getReviewsForUser } from "@/lib/reviews";
import { createConversation } from "@/lib/messages";
import { useAuth } from "@/components/AuthProvider";
import SkillCard from "@/components/SkillCard";
import BookingModal from "@/components/BookingModal";
import ReviewList from "@/components/ReviewList";
import { SKILL_CATEGORIES } from "@/lib/users";
import { formatLocationDisplay } from "@/lib/location";
import { ProfileSkeleton } from "@/components/Skeletons";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile: myProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSkill, setBookingSkill] = useState(null);

  const profileId = params.id;
  const isOwnProfile = user?.uid === profileId;

  // Fetch profile data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getUserProfile(profileId);
        setProfileData(data);

        const reviewsData = await getReviewsForUser(profileId);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profileId) fetchData();
  }, [profileId]);

  const handleMessage = async () => {
    if (!user || !myProfile || !profileData) return;

    try {
      const convoId = await createConversation(
        { id: user.uid, name: myProfile.name, avatar: myProfile.avatar },
        { id: profileData.id, name: profileData.name, avatar: profileData.avatar }
      );
      router.push(`/messages?convo=${convoId}`);
    } catch (err) {
      alert("Error starting conversation: " + err.message);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">
            This user doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={
              profileData.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profileData.name || "U"
              )}&background=random&size=200`
            }
            alt=""
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {profileData.name}
              </h1>
              {profileData.isVerified && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  ✅ Verified
                </span>
              )}
            </div>

            {profileData.bio && (
              <p className="text-gray-600 mb-3">{profileData.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {profileData.location && (
                <span>📍 {formatLocationDisplay(profileData.location)}</span>
              )}
              <span>
                ⭐ {profileData.averageRating || "New"}{" "}
                {profileData.totalReviews > 0 &&
                  `(${profileData.totalReviews} reviews)`}
              </span>
              <span>📅 {profileData.totalBookings || 0} sessions</span>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && user && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleMessage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  💬 Message
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => router.push("/profile/edit")}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                ⚙️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skills Offered */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">🎯 Skills Offered</h2>
        {profileData.skillsOffered?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileData.skillsOffered.map((skill, i) => (
              <SkillCard
                key={i}
                skill={skill}
                onBook={
                  !isOwnProfile && user
                    ? () => setBookingSkill(skill)
                    : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            No skills offered yet
          </div>
        )}
      </div>

      {/* Skills Needed */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">🔍 Skills Needed</h2>
        {profileData.skillsNeeded?.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {profileData.skillsNeeded.map((skill, i) => {
              const cat = SKILL_CATEGORIES.find(
                (c) => c.id === skill.category
              );
              return (
                <div
                  key={i}
                  className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 w-full sm:w-auto"
                >
                  <span className="font-medium">
                    {cat?.icon} {skill.name}
                  </span>
                  {skill.description && (
                    <p className="text-sm text-gray-600 mt-1 italic">
                      "{skill.description}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            No skills needed listed
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          ⭐ Reviews ({reviews.length})
        </h2>
        <ReviewList reviews={reviews} />
      </div>

      {/* Booking Modal */}
      {bookingSkill && (
        <BookingModal
          skill={bookingSkill}
          provider={profileData}
          onClose={() => setBookingSkill(null)}
        />
      )}
    </div>
  );
}