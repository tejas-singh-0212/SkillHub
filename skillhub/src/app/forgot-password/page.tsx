"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [sent, setSent] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setLoading(true);

 try {
 await resetPassword(email);
 setSent(true);
 } catch (err: unknown) {
 const error = err as { code?: string; message?: string };
 if (error.code === "auth/user-not-found") {
 setError("No account found with this email address.");
 } else if (error.code === "auth/invalid-email") {
 setError("Please enter a valid email address.");
 } else if (error.code === "auth/too-many-requests") {
 setError("Too many requests. Please try again later.");
 } else {
 setError(error.message || "Unknown error");
 }
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center px-4 py-12">
 <div className="w-full max-w-md">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-bold">🔑 Reset Password</h1>
 <p className="text-gray-600 dark:text-gray-300 mt-2">
 {sent
 ? "Check your email for reset instructions"
 : "Enter your email and we&apos;ll send you a reset link"}
 </p>
 </div>

 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none p-8">
 {sent ? (
 // Success State
 <div className="text-center">
 <div className="text-6xl mb-4">📧</div>
 <h2 className="text-xl font-bold text-green-700 mb-2">
 Email Sent!
 </h2>
 <p className="text-gray-600 dark:text-gray-300 mb-2">
 We&apos;ve sent a password reset link to:
 </p>
 <p className="font-semibold text-gray-800 dark:text-gray-100 mb-6">{email}</p>

 <div className="bg-yellow-50 border dark:border-gray-700 border-yellow-200 rounded-xl p-4 mb-6 text-left">
 <p className="text-yellow-800 text-sm font-medium mb-2">
 📌 What to do next:
 </p>
 <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
 <li>Check your email inbox (and spam folder)</li>
 <li>Click the reset link in the email</li>
 <li>Set your new password</li>
 <li>Come back and sign in</li>
 </ol>
 </div>

 <div className="space-y-3">
 <button
 onClick={() => {
 setSent(false);
 setEmail("");
 }}
 className="w-full border dark:border-gray-700 border-gray-300 dark:border-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 dark:bg-gray-900 transition"
 >
 Send to a different email
 </button>

 <Link
 href="/login"
 className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-center"
 >
 ← Back to Sign In
 </Link>
 </div>
 </div>
 ) : (
 // Email Form
 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
 Email Address
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 placeholder="you@example.com"
 className="w-full border dark:border-gray-700 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
 />
 </div>

 {error && (
 <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
 ❌ {error}
 </div>
 )}

 <button
 type="submit"
 disabled={loading || !email.trim()}
 className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
 >
 {loading ? "Sending..." : "Send Reset Link"}
 </button>

 <div className="text-center">
 <Link
 href="/login"
 className="text-sm text-blue-600 font-medium hover:underline"
 >
 ← Back to Sign In
 </Link>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}