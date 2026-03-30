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
 <body>
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 <Toaster position="top-center" />
 <AuthProvider>
 <Navbar />
 <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">{children}</main>
 </AuthProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
