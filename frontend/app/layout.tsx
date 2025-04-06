import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/navbar";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <html lang="en" suppressHydrationWarning className="dark:bg-gray-900 bg-white">
      <body className="transition-colors duration-300">
      <Navbar />
        {children}
      </body>
    </html>
    </AuthProvider>
  );
}
