"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listenToMyBookings } from "@/lib/bookings";
import { getSmartMatches } from "@/lib/search";
import { DashboardSkeleton } from "@/components/Skeletons";
import type { Booking, SmartMatch } from "@/types";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [matches, setMatches] = useState<SmartMatch[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && profile && !profile.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToMyBookings(user.uid, (allBookings) => {
      setBookings(allBookings);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !profile) return;
    getSmartMatches(user.uid, profile).then((result) => {
      const matchList = result.matches || result;
      setMatches(Array.isArray(matchList) ? matchList.slice(0, 4) : []);
    });
  }, [user, profile]);

  if (loading || !profile) {
    return <DashboardSkeleton />;
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter((b) => b.status === "accepted");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {profile.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-600">Here&apos;s your SkillHub overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-3xl font-bold text-blue-600">
            {profile.skillsOffered?.length || 0}
          </p>
          <p className="text-gray-600 text-sm mt-1">Skills Offered</p>
        </div>
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-3xl font-bold text-green-600">
            {profile.skillsNeeded?.length || 0}
          </p>
          <p className="text-gray-600 text-sm mt-1">Skills Needed</p>
        </div>
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-3xl font-bold text-purple-600">
            {completedBookings.length}
          </p>
          <p className="text-gray-600 text-sm mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-3xl font-bold text-yellow-600">
            ⭐ {profile.averageRating || "N/A"}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Rating ({profile.totalReviews || 0})
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link
          href="/search"
          className="bg-blue-50 hover:bg-blue-100 rounded-xl p-5 text-center transition border border-blue-200"
        >
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold text-blue-700 text-sm">Find Skills</p>
        </Link>
        <Link
          href={`/profile/${user!.uid}`}
          className="bg-purple-50 hover:bg-purple-100 rounded-xl p-5 text-center transition border border-purple-200"
        >
          <p className="text-3xl mb-2">👤</p>
          <p className="font-semibold text-purple-700 text-sm">My Profile</p>
        </Link>
        <Link
          href="/messages"
          className="bg-green-50 hover:bg-green-100 rounded-xl p-5 text-center transition border border-green-200"
        >
          <p className="text-3xl mb-2">💬</p>
          <p className="font-semibold text-green-700 text-sm">Messages</p>
        </Link>
        <Link
          href="/bookings"
          className="bg-yellow-50 hover:bg-yellow-100 rounded-xl p-5 text-center transition border border-yellow-200"
        >
          <p className="text-3xl mb-2">📅</p>
          <p className="font-semibold text-yellow-700 text-sm">Bookings</p>
        </Link>
      </div>

      {/* Pending Bookings Alert */}
      {pendingBookings.filter((b) => b.role === "provider").length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
          <h3 className="font-bold text-orange-700">
            📩 You have{" "}
            {pendingBookings.filter((b) => b.role === "provider").length} pending
            booking request(s)!
          </h3>
          <Link
            href="/bookings"
            className="text-orange-600 text-sm underline mt-1 inline-block"
          >
            Review them →
          </Link>
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📅 Upcoming Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingBookings.slice(0, 4).map((booking) => (
              <div
                key={booking.id}
                className="bg-white border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="bg-blue-100 rounded-lg p-3 text-center min-w-[60px]">
                  <p className="text-xs text-blue-600 font-medium">
                    {booking.scheduledDate}
                  </p>
                  <p className="text-sm font-bold text-blue-800">
                    {booking.scheduledTime}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">{booking.skillName}</p>
                  <p className="text-sm text-gray-500">
                    {booking.role === "provider"
                      ? `with ${booking.requesterName}`
                      : `with ${booking.providerName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Barter Matches */}
      {matches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🔄 Barter Matches For You</h2>
          <p className="text-gray-600 text-sm mb-4">
            These people offer what you need AND need what you offer!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/profile/${match.id}`}
                className="bg-white border rounded-xl p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      match.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        match.name || "U"
                      )}&background=random`
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{match.name}</p>
                    {match.matchType === "perfect_barter" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        🔄 Perfect Match
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.skillsOffered?.slice(0, 2).map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Skills */}
      <h2 className="text-xl font-bold mb-4">My Skills Offered</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {profile.skillsOffered?.map((skill, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border">
            <h3 className="font-bold">{skill.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {skill.category} • {skill.level}
            </p>
            {skill.description && (
              <p className="text-sm text-gray-500 mt-2 italic line-clamp-2">
                "{skill.description}"
              </p>
            )}
            <p className="text-sm mt-2">
              {skill.priceType === "free"
                ? "🆓 Free"
                : skill.priceType === "barter"
                ? "🔄 Barter"
                : `💰 ₹${skill.price} ${skill.perUnit === "hour" ? "per hour" : skill.perUnit === "session" ? "per session" : skill.perUnit === "day" ? "per day" : skill.perUnit}`}
            </p>
          </div>
        ))}

        {(!profile.skillsOffered || profile.skillsOffered.length === 0) && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No skills added yet.{" "}
            <Link href="/profile/edit" className="text-blue-600 underline">
              Add some!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}