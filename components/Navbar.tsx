"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, chain } from "@/lib/thirdweb";
import { Sparkles, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide navbar on admin routes
  if (pathname.startsWith("/admin")) return null;

  // Pure Web3 wallets only - no social logins
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("walletConnect"),
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Sparkles className="w-8 h-8 text-purple-400 relative z-10" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              I&E Hub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-purple-400 ${
                  pathname === link.href
                    ? "text-purple-400"
                    : "text-gray-300"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden md:block connect-button-wrapper">
            <ConnectButton
              client={client}
              chain={chain}
              wallets={wallets}
              theme="dark"
              connectButton={{
                label: "Connect Wallet",
                style: {
                  background: "linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  transition: "all 0.3s ease",
                },
              }}
            />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative p-2 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-white/5 transition-all duration-300"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block transition-all duration-300 ${
                isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            >
              <Menu className="w-6 h-6" />
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`}
            >
              <X className="w-6 h-6" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-white/10 glass">
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-purple-400 bg-purple-500/10 border border-purple-500/20"
                    : "text-gray-300 hover:text-purple-400 hover:bg-white/5"
                }`}
              >
                {pathname === link.href && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-500 to-cyan-500" />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Connect Wallet */}
          <div className="mt-4 pt-4 border-t border-white/10 connect-button-wrapper">
            <ConnectButton
              client={client}
              chain={chain}
              wallets={wallets}
              theme="dark"
              connectButton={{
                label: "Connect Wallet",
                style: {
                  background: "linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  transition: "all 0.3s ease",
                  width: "100%",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
