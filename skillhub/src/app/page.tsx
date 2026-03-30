"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { SKILL_CATEGORIES } from "@/lib/users";

export default function HomePage() {
 const { user, loading } = useAuth();

 return (
 <div>
 <section className="bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
 <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
 <div className="max-w-3xl">
 <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
 Exchange Skills,<br />
 <span className="text-yellow-300">Build Community</span>
 </h1>
 <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
 Offer your talents. Learn something new. Barter, pay, or share for free, all within your local neighbourhood.
 </p>
 <div className="flex flex-wrap gap-4">
 {!loading && !user ? (
 <>
 <Link href="/register" className="bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition shadow-lg dark:shadow-none">Get Started for Free</Link>
 <Link href="/search" className="bg-white dark:bg-gray-800/10 backdrop-blur text-black dark:text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800/20 transition border dark:border-gray-700 border-white/30">Explore Skills</Link>
 </>
 ) : !loading && user ? (
 <>
 <Link href="/search" className="bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition shadow-lg dark:shadow-none">Find Skills Near You</Link>
 <Link href="/dashboard" className="bg-white dark:bg-gray-800/10 text-black dark:text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800/20 transition border dark:border-gray-700 border-white/30">My Dashboard</Link>
 </>
 ) : null}
 </div>
 </div>
 </div>
 </section>
 <section className="py-20 bg-white dark:bg-gray-800">
 <div className="max-w-7xl mx-auto px-6">
 <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
 <div className="grid md:grid-cols-3 gap-10">
 {[
 { icon: "👤", title: "Create Your Profile", desc: "List skills you can offer and skills you want to learn. Set your location." },
 { icon: "🔍", title: "Discover Nearby", desc: "Find skilled people in your neighborhood using our interactive map." },
 { icon: "🤝", title: "Connect & Exchange", desc: "Book sessions, chat directly, barter or pay, your choice." },
 ].map((item, i) => (
 <div key={i} className="text-center">
 <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5">{item.icon}</div>
 <h3 className="text-xl font-bold mb-3">{item.title}</h3>
 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 <section className="py-20 bg-gray-50 dark:bg-gray-900">
 <div className="max-w-7xl mx-auto px-6">
 <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Skills You Can Exchange</h2>
 <p className="text-gray-600 dark:text-gray-300 text-center mb-12 text-lg">From tutoring to home repairs, find everything nearby</p>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
 {SKILL_CATEGORIES.map((cat) => (
 <Link key={cat.id} href={`/search?category=${cat.id}`} className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center hover:shadow-lg dark:shadow-none transition border dark:border-gray-700 hover:border-blue-300 group">
 <div className="text-3xl mb-2">{cat.icon}</div>
 <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600">{cat.label}</p>
 </Link>
 ))}
 </div>
 </div>
 </section>
 <section className="py-20 bg-white dark:bg-gray-800">
 <div className="max-w-7xl mx-auto px-6">
 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Three Ways to Exchange</h2>
 <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
 {[
 { icon: "🆓", title: "Free", desc: "Share your skills with the community for free", color: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" },
 { icon: "🔄", title: "Barter", desc: "Trade your skills with others without any money involved", color: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" },
 { icon: "💰", title: "Paid", desc: "Set your own rates and earn from your skills", color: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800" },
 ].map((item, i) => (
 <div key={i} className={`${item.color} border-2 rounded-2xl p-8 text-center`}>
 <div className="text-5xl mb-4">{item.icon}</div>
 <h3 className="text-xl font-bold mb-2">{item.title}</h3>
 <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 <section className="py-16 bg-linear-to-r from-blue-600 to-purple-600 text-white">
 <div className="max-w-7xl mx-auto px-6">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
 {[
 { number: "12", label: "Skill Categories" },
 { number: "3", label: "Exchange Modes" },
 { number: "₹0", label: "Platform Fee" },
 { number: "∞", label: "Possibilities" },
 ].map((stat, i) => (
 <div key={i}>
 <p className="text-3xl md:text-4xl font-bold">{stat.number}</p>
 <p className="text-blue-200 mt-1">{stat.label}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 <section className="py-20 bg-gray-50 dark:bg-gray-900 text-center">
 <div className="max-w-3xl mx-auto px-6">
 <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Skills?</h2>
 <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Join your local skill exchange community today.</p>
 {!loading && !user && (
 <Link href="/register" className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition inline-block shadow-lg dark:shadow-none">Create Free Account →</Link>
 )}
 </div>
 </section>
 <footer className="bg-gray-900 text-gray-400 py-10">
 <div className="max-w-7xl mx-auto px-6 text-center">
 <p className="text-lg"><span className="text-white font-bold">SkillHub</span> : Local Skill Exchange Platform</p>
 <p className="mt-2 text-sm">Built by Bit Benders with 💙</p>
 </div>
 </footer>
 </div>
 );
}
