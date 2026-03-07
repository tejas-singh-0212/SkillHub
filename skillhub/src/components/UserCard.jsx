"use client";

import { useRouter } from "next/navigation";

export default function UserCard({ user }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/profile/${user.id}`)}
      className="bg-white border rounded-xl p-5 hover:shadow-lg cursor-pointer transition"
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || "U"
            )}&background=random`
          }
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-sm text-gray-500">
            {user.distance !== undefined
              ? `📍 ${user.distance} km away`
              : user.location?.city
              ? `📍 ${user.location.area ? user.location.area + ", " : ""}${user.location.city}`
              : "📍 Location not set"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {user.skillsOffered?.slice(0, 3).map((skill, i) => (
          <span
            key={i}
            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
          >
            {skill.name}
          </span>
        ))}
        {user.skillsOffered?.length > 3 && (
          <span className="text-xs text-gray-500 py-1">
            +{user.skillsOffered.length - 3} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm">
          ⭐ {user.averageRating || "New"}{" "}
          {user.totalReviews > 0 && (
            <span className="text-gray-400">({user.totalReviews})</span>
          )}
        </span>
        <span className="text-xs text-blue-600 font-medium">
          View Profile →
        </span>
      </div>
    </div>
  );
}