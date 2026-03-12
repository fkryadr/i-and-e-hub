"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, chain } from "@/lib/thirdweb";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Award,
  LogOut,
  Menu,
  X,
  Sparkles,
  Wallet,
  Palette,
  LayoutDashboard,
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pure Web3 wallets only for admin - no social logins
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("walletConnect"),
  ];

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      description: "Overview & Analytics",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/dashboard/events",
      label: "Listing Event",
      description: "Manage Events",
      icon: Calendar,
    },
    {
      href: "/admin/dashboard/certificates",
      label: "Terbitkan Sertifikat",
      description: "Issue Certificates",
      icon: Award,
    },
    {
      href: "/admin/dashboard/design",
      label: "Design Certificate",
      description: "Build & Style Templates",
      icon: Palette,
    },
  ];

  const handleLogout = () => {
    router.push("/admin/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className="hidden lg:flex lg:sticky top-0 left-0 h-screen w-72 glass border-r border-purple-500/30 z-50 flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/30">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Sparkles className="w-8 h-8 text-purple-400 relative z-10" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent block">
                I&E Hub
              </span>
              <span className="text-xs text-gray-500">Admin Portal</span>
            </div>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`block relative group ${
                  isActive ? "pointer-events-none" : ""
                }`}
              >
                <motion.div
                  whileHover={!isActive ? { x: 4 } : {}}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-white/20"
                        : "bg-purple-500/20 group-hover:bg-purple-500/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div
                      className={`text-xs ${
                        isActive ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-purple-500/30">
          <div className="glass rounded-lg p-3 border border-cyan-500/30">
            <p className="text-xs text-gray-400 text-center">
              Logged in as <strong className="text-cyan-400">Admin</strong>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:hidden top-0 left-0 h-screen w-72 glass border-r border-purple-500/30 z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/30">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Sparkles className="w-8 h-8 text-purple-400 relative z-10" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent block">
                I&E Hub
              </span>
              <span className="text-xs text-gray-500">Admin Portal</span>
            </div>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`block relative group ${
                  isActive ? "pointer-events-none" : ""
                }`}
              >
                <motion.div
                  whileHover={!isActive ? { x: 4 } : {}}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-white/20"
                        : "bg-purple-500/20 group-hover:bg-purple-500/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div
                      className={`text-xs ${
                        isActive ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-purple-500/30">
          <div className="glass rounded-lg p-3 border border-cyan-500/30">
            <p className="text-xs text-gray-400 text-center">
              Logged in as <strong className="text-cyan-400">Admin</strong>
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-purple-500/30 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent lg:block hidden">
              Admin Dashboard
            </h1>

            {/* Mobile Title */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent lg:hidden">
              Admin
            </h1>

            {/* Admin Actions */}
            <div className="flex items-center gap-3">
              {/* Admin Wallet Connection */}
              <div className="admin-wallet-button">
                <ConnectButton
                  client={client}
                  chain={chain}
                  wallets={wallets}
                  theme="dark"
                  connectButton={{
                    label: "Admin Wallet",
                    style: {
                      background: "rgba(130, 71, 229, 0.15)",
                      color: "#a855f7",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: "1px solid rgba(130, 71, 229, 0.3)",
                      transition: "all 0.3s ease",
                      minWidth: "140px",
                    },
                  }}
                  connectModal={{
                    title: "Connect Admin Wallet",
                    showThirdwebBranding: false,
                  }}
                />
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 hover:bg-red-500/10 text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
