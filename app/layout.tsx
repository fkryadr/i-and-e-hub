import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I&E Hub - Web3 Event Ticketing & NFT Certificates",
  description: "Experience the future of event ticketing with blockchain technology. Secure, transparent, and truly yours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThirdwebProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
