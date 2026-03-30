"use client";

interface SkeletonProps {
 className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
 return <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />;
}

export function DashboardSkeleton() {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
 <div className="mb-8">
 <Skeleton className="h-9 w-72 mb-2" />
 <Skeleton className="h-5 w-48" />
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border dark:border-gray-700">
 <Skeleton className="h-9 w-16 mb-2" />
 <Skeleton className="h-4 w-24" />
 </div>
 ))}
 </div>
 <Skeleton className="h-6 w-32 mb-4" />
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border dark:border-gray-700">
 <Skeleton className="h-10 w-10 rounded-full mx-auto mb-2" />
 <Skeleton className="h-4 w-20 mx-auto" />
 </div>
 ))}
 </div>
 <Skeleton className="h-6 w-40 mb-4" />
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border dark:border-gray-700">
 <Skeleton className="h-5 w-32 mb-2" />
 <Skeleton className="h-4 w-48 mb-3" />
 <Skeleton className="h-4 w-20" />
 </div>
 ))}
 </div>
 </div>
 );
}

export function ProfileSkeleton() {
 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 sm:p-8 mb-6">
 <div className="flex flex-col sm:flex-row items-start gap-6">
 <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
 <div className="flex-1 w-full">
 <Skeleton className="h-8 w-48 mb-3" />
 <Skeleton className="h-4 w-full max-w-md mb-4" />
 <div className="flex gap-4 mb-4">
 <Skeleton className="h-4 w-28" />
 <Skeleton className="h-4 w-24" />
 <Skeleton className="h-4 w-20" />
 </div>
 <Skeleton className="h-10 w-32 rounded-lg" />
 </div>
 </div>
 </div>
 <Skeleton className="h-7 w-36 mb-4" />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
 {[...Array(2)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
 <Skeleton className="h-6 w-40 mb-2" />
 <Skeleton className="h-4 w-56 mb-2" />
 <Skeleton className="h-4 w-full mb-3" />
 <div className="flex justify-between">
 <Skeleton className="h-4 w-16" />
 <Skeleton className="h-8 w-24 rounded-lg" />
 </div>
 </div>
 ))}
 </div>
 <Skeleton className="h-7 w-36 mb-4" />
 <div className="flex flex-wrap gap-3 mb-6">
 {[...Array(3)].map((_, i) => (
 <Skeleton key={i} className="h-10 w-32 rounded-lg" />
 ))}
 </div>
 <Skeleton className="h-7 w-28 mb-4" />
 <div className="space-y-4">
 {[...Array(2)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
 <div className="flex items-center gap-3 mb-2">
 <Skeleton className="w-10 h-10 rounded-full" />
 <div>
 <Skeleton className="h-4 w-28 mb-1" />
 <Skeleton className="h-3 w-20" />
 </div>
 </div>
 <Skeleton className="h-4 w-full" />
 </div>
 ))}
 </div>
 </div>
 );
}

export function SearchSkeleton() {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
 <Skeleton className="h-9 w-64 mb-6" />
 <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
 <div className="flex flex-wrap gap-3">
 <Skeleton className="h-10 flex-1 min-w-[200px] rounded-lg" />
 <Skeleton className="h-10 w-40 rounded-lg" />
 <Skeleton className="h-10 w-36 rounded-lg" />
 <Skeleton className="h-10 w-32 rounded-lg" />
 <Skeleton className="h-10 w-24 rounded-lg" />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[...Array(6)].map((_, i) => (
 <UserCardSkeleton key={i} />
 ))}
 </div>
 </div>
 );
}

export function UserCardSkeleton() {
 return (
 <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
 <div className="flex items-center gap-3 mb-3">
 <Skeleton className="w-12 h-12 rounded-full" />
 <div>
 <Skeleton className="h-5 w-28 mb-1" />
 <Skeleton className="h-3 w-36" />
 </div>
 </div>
 <div className="flex gap-1 mb-3">
 <Skeleton className="h-6 w-20 rounded-full" />
 <Skeleton className="h-6 w-24 rounded-full" />
 <Skeleton className="h-6 w-16 rounded-full" />
 </div>
 <div className="flex justify-between">
 <Skeleton className="h-4 w-16" />
 <Skeleton className="h-4 w-24" />
 </div>
 </div>
 );
}

export function MessagesSkeleton() {
 return (
 <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-8">
 <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl border-0 sm:border dark:border-gray-700 overflow-hidden">
 <div className="flex h-[calc(100vh-64px)] sm:h-[600px]">
 <div className="w-full sm:w-80 border-r">
 <div className="p-4 border-b dark:border-gray-700">
 <Skeleton className="h-7 w-32" />
 </div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
 <Skeleton className="w-12 h-12 rounded-full" />
 <div className="flex-1">
 <Skeleton className="h-4 w-28 mb-1" />
 <Skeleton className="h-3 w-40" />
 </div>
 </div>
 ))}
 </div>
 <div className="hidden sm:flex flex-1 items-center justify-center">
 <div className="text-center">
 <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
 <Skeleton className="h-5 w-48 mx-auto" />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export function BookingsSkeleton() {
 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
 <Skeleton className="h-9 w-40 mb-6" />
 <div className="flex gap-2 mb-6">
 <Skeleton className="h-10 w-36 rounded-lg" />
 <Skeleton className="h-10 w-28 rounded-lg" />
 </div>
 <div className="space-y-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
 <div className="flex items-center gap-4">
 <Skeleton className="w-12 h-12 rounded-full" />
 <div className="flex-1">
 <Skeleton className="h-5 w-40 mb-2" />
 <Skeleton className="h-4 w-32 mb-1" />
 <div className="flex gap-2 mt-1">
 <Skeleton className="h-5 w-16 rounded-full" />
 <Skeleton className="h-5 w-28 rounded-full" />
 <Skeleton className="h-5 w-20 rounded-full" />
 </div>
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-9 w-20 rounded-lg" />
 <Skeleton className="h-9 w-20 rounded-lg" />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

export function ProfileEditSkeleton() {
 return (
 <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
 <Skeleton className="h-9 w-40 mb-8" />
 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 mb-6">
 <Skeleton className="h-6 w-40 mb-4" />
 <div className="space-y-4">
 <Skeleton className="h-12 w-full rounded-xl" />
 <Skeleton className="h-24 w-full rounded-xl" />
 <Skeleton className="h-12 w-full rounded-xl" />
 </div>
 </div>
 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 mb-6">
 <Skeleton className="h-6 w-28 mb-4" />
 <Skeleton className="h-12 w-full rounded-xl mb-4" />
 <Skeleton className="h-[300px] w-full rounded-xl" />
 </div>
 <Skeleton className="h-12 w-full rounded-xl mb-8" />
 <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 mb-6">
 <Skeleton className="h-6 w-36 mb-4" />
 {[...Array(2)].map((_, i) => (
 <div key={i} className="bg-blue-50 rounded-xl p-4 mb-3">
 <Skeleton className="h-5 w-36 mb-2" />
 <Skeleton className="h-4 w-56" />
 </div>
 ))}
 </div>
 </div>
 );
}

export function NotificationsSkeleton() {
 return (
 <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
 <Skeleton className="h-9 w-44 mb-2" />
 <Skeleton className="h-5 w-56 mb-6" />
 <div className="space-y-3">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
 <div className="flex items-start gap-4">
 <Skeleton className="w-10 h-10 rounded-lg" />
 <div className="flex-1">
 <Skeleton className="h-5 w-48 mb-2" />
 <Skeleton className="h-4 w-full mb-2" />
 <Skeleton className="h-3 w-24" />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

export function OnboardingSkeleton() {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
 <div className="max-w-2xl mx-auto">
 <Skeleton className="h-9 w-52 mx-auto mb-2" />
 <Skeleton className="h-5 w-24 mx-auto mb-8" />
 <div className="flex items-center justify-center gap-2 mb-10">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="flex items-center gap-2">
 <Skeleton className="w-10 h-10 rounded-full" />
 {i < 3 && <Skeleton className="w-8 sm:w-12 h-1" />}
 </div>
 ))}
 </div>
 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none p-6 sm:p-8">
 <Skeleton className="h-7 w-44 mb-5" />
 <div className="space-y-4">
 <Skeleton className="h-12 w-full rounded-xl" />
 <Skeleton className="h-24 w-full rounded-xl" />
 <Skeleton className="h-12 w-full rounded-xl" />
 <Skeleton className="h-12 w-full rounded-xl" />
 </div>
 </div>
 </div>
 </div>
 );
}

export default Skeleton;
