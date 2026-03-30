import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
 title: "SkillHub — Local Skill Exchange",
 description: "Exchange skills with people in your neighbourhood",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <link
 rel="stylesheet"
 href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
 />
 </head>
 <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 <Toaster position="top-center" />
 <AuthProvider>
 <Navbar />
 <main className="min-h-screen">{children}</main>
 </AuthProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
