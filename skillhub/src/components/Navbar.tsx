"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { logOut } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logOut();
    setMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Explore", href: "/search" },
    { label: "Bookings", href: "/bookings" },
    { label: "Messages", href: "/messages" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">SkillHub</span>
          </Link>

          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          pathname === item.href
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="ml-2">
                    <NotificationBell />
                  </div>

                  <div className="relative ml-1" ref={dropdownRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 bg-gray-100 rounded-full pl-1 pr-3 py-1 hover:bg-gray-200 transition"
                    >
                      <Image
                        unoptimized
                        src={
                          profile?.avatar ||
                          `https://ui-avatars.com/api/?name=U&background=random`
                        }
                        alt=""
                        width={32} height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">
                        {profile?.name?.split(" ")[0] || "Profile"}
                      </span>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                        <Link
                          href={`/profile/${user.uid}`}
                          className="block px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => setMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/profile/edit"
                          className="block px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => setMenuOpen(false)}
                        >
                          Edit Profile
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition font-medium px-4 py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          )}

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

        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-3 px-4 rounded-lg font-medium transition ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2" />
                <Link
                  href={`/profile/${user.uid}`}
                  className="block py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 My Profile
                </Link>
                <Link
                  href="/notifications"
                  className="block py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  🔔 Notifications
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="block py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
