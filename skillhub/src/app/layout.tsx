import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SkillHub — Local Skill Exchange",
  description: "Exchange skills with people in your neighbourhood",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>
        <Toaster position="top-center" />
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
