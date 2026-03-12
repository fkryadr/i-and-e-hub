"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname.startsWith("/admin")) return null;

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/profile", label: "Profile" },
  ];

  const aboutLinks = [
    { href: "#", label: "About Us" },
    { href: "#", label: "How It Works" },
    { href: "#", label: "FAQ" },
    { href: "#", label: "Terms of Service" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="relative border-t border-white/10 mt-20">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8247E5]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#8247E5] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <Sparkles className="w-8 h-8 text-[#8247E5] relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#8247E5] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                I&E Hub
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the future of event ticketing with blockchain technology.
              Secure, transparent, and truly yours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#8247E5] to-purple-600 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#8247E5] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-purple-600 to-cyan-500 rounded-full" />
              About
            </h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#8247E5] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Community */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
              Community
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 glass glass-hover rounded-lg flex items-center justify-center text-gray-400 hover:text-[#8247E5] border border-purple-500/20 hover:border-[#8247E5]/50 transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Join our community and stay updated with the latest Web3 events.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} I&E Hub.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Powered by Polygon Amoy</span>
            
            {/* Conditional Admin Portal Link - Only on Home Page */}
            {pathname === "/" && (
              <>
                <div className="w-px h-4 bg-gray-700" />
                <Link
                  href="/admin/login"
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors opacity-40 hover:opacity-100"
                >
                  Admin Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
