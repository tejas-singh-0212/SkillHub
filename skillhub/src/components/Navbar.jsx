"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { logOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logOut();
    setMenuOpen(false);
    router.push("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">SkillHub</span>
          </Link>

          {!loading && (
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/search"
                    className="text-gray-600 hover:text-blue-600 transition font-medium"
                  >
                    🔍 Explore
                  </Link>
                  <Link
                    href="/bookings"
                    className="text-gray-600 hover:text-blue-600 transition font-medium"
                  >
                    📅 Bookings
                  </Link>
                  <Link
                    href="/messages"
                    className="text-gray-600 hover:text-blue-600 transition font-medium"
                  >
                    💬 Messages
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-blue-600 transition font-medium"
                  >
                    📊 Dashboard
                  </Link>

                  {/* ✅ Notification Bell */}
                  <NotificationBell />

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-3 py-1 hover:bg-gray-200 transition"
                    >
                      <img
                        src={
                          profile?.avatar ||
                          `https://ui-avatars.com/api/?name=U&background=random`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">
                        {profile?.name?.split(" ")[0] || "Profile"}
                      </span>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                        <Link
                          href={`/profile/${user.uid}`}
                          className="block px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => setMenuOpen(false)}
                        >
                          👤 My Profile
                        </Link>
                        <Link
                          href="/profile/edit"
                          className="block px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => setMenuOpen(false)}
                        >
                          ⚙️ Edit Profile
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl p-2"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="space-y-2">
                <Link href="/search" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>🔍 Explore</Link>
                <Link href="/bookings" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>📅 Bookings</Link>
                <Link href="/messages" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>💬 Messages</Link>
                <Link href="/dashboard" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
                <Link href="/notifications" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>🔔 Notifications</Link>
                <Link href={`/profile/${user.uid}`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
                <button onClick={handleLogout} className="block py-2 text-red-600">🚪 Sign Out</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link href="/register" className="block py-2 text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}