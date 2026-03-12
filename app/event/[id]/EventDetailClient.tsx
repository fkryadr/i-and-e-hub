"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useActiveAccount, TransactionButton, MediaRenderer } from "thirdweb/react";
import { getContract, toWei } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc1155";
import { client, chain } from "@/lib/thirdweb";
import confetti from "canvas-confetti";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar, MapPin, Users, Tag, Zap, Check, Loader2,
  Ticket, ArrowLeft, User, Sparkles, AlertCircle,
} from "lucide-react";

// ── Edition Drop contract on Polygon Amoy ─────────────────────────────────────
const CONTRACT_ADDRESS = "0x7dD852BbC49b6Ddde1C9BF8c1D6c56932bc348B2";

interface EventDetailClientProps {
  event: {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    date: string;
    venue: string;
    category: string;
    priceInPOL: string;
    price_pol: number;
    ticket_token_id: number;
    max_per_wallet: number | null;
    totalQuota: number;
    availableQuota: number;
    bannerImage: string;
    organizer: string;
    features: string[];
  };
}

type TxState = "idle" | "confirming" | "success";

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const account = useActiveAccount();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [txState, setTxState] = useState<TxState>("idle");

  const isSoldOut = event.availableQuota === 0;
  const isLowStock = event.availableQuota > 0 && event.availableQuota <= event.totalQuota * 0.2;

  const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });

  // ── Post-purchase DB save + celebration ────────────────────────────────────
  const handleClaimSuccess = async (receipt: any) => {
    console.log("✓ claimTo confirmed:", receipt);

    // Record in database
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          wallet_address: account?.address,
          amount_pol: event.price_pol,
          tx_hash: receipt.transactionHash,
        }),
      });
      const data = await res.json();
      if (!res.ok) console.warn("DB record failed (non-fatal):", data.error);
      else console.log("✓ Transaction recorded:", data.transaction?.id);
    } catch (err) {
      console.warn("DB record error (non-fatal):", err);
    }

    // Celebration
    setTxState("success");

    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.55 },
      colors: ["#8247E5", "#a855f7", "#06b6d4", "#22d3ee", "#f0abfc"],
    });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.6 } }), 300);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 } }), 500);

    toast.success("🎉 Ticket Purchased!", {
      description: "Your NFT ticket has been minted and sent to your wallet!",
      duration: 6000,
    });
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => setTxState("idle"), 300);
    if (txState === "success") router.refresh();
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Button variant="ghost" onClick={() => router.push("/events")}
          className="text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Events
        </Button>
      </div>

      {/* Banner */}
      <div className="relative w-full h-96 mb-8">
        <MediaRenderer
          client={client}
          src={event.bannerImage}
          alt={event.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Availability badge */}
        <div className="absolute top-6 right-6">
          {isSoldOut ? (
            <div className="px-4 py-2 bg-red-500/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-red-400/50">
              Sold Out
            </div>
          ) : isLowStock ? (
            <div className="px-4 py-2 bg-orange-500/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-orange-400/50 animate-pulse">
              Limited Tickets
            </div>
          ) : (
            <div className="px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-green-400/50">
              Available
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: details ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} className="lg:col-span-2 space-y-6">

            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray-300">
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" /><span>{event.date}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-cyan-400" /><span>{event.venue}</span></div>
                <div className="flex items-center gap-2"><Tag className="w-5 h-5 text-pink-400" /><span>{event.category}</span></div>
              </div>
            </div>

            {/* About */}
            <Card className="glass border-purple-500/30">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-3">About This Event</h2>
                <p className="text-gray-300 leading-relaxed mb-4">{event.longDescription}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>Organized by <strong className="text-purple-400">{event.organizer}</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* What's included */}
            <Card className="glass border-purple-500/30">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.features.map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 glass rounded-lg border border-purple-500/20">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quota bar */}
            <Card className="glass border-purple-500/30">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Ticket Availability</h2>
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-300">
                    <strong className="text-white">{event.availableQuota}</strong> / {event.totalQuota} tickets remaining
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.availableQuota / event.totalQuota) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${isSoldOut ? "bg-red-500" : isLowStock ? "bg-orange-500" : "bg-gradient-to-r from-purple-500 to-cyan-500"}`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right: checkout card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="glass border-purple-500/30 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Ticket Price</span>
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{event.priceInPOL} POL</div>
                  <p className="text-sm text-gray-400">≈ ${(event.price_pol * 0.45).toFixed(2)} USD</p>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Event Date</span>
                      <span className="text-white">{event.date.split("•")[0]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Availability</span>
                      <span className={`font-semibold ${isSoldOut ? "text-red-400" : isLowStock ? "text-orange-400" : "text-green-400"}`}>
                        {isSoldOut ? "Sold Out" : `${event.availableQuota} left`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">NFT Certificate</span>
                      <span className="text-cyan-400 flex items-center gap-1"><Check className="w-4 h-4" />Included</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Max Per Wallet</span>
                      <span className="text-white">
                        {event.max_per_wallet ? event.max_per_wallet : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Token ID</span>
                      <span className="text-gray-300 font-mono">#{event.ticket_token_id}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    {!account ? (
                      /* Wallet not connected */
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 glass rounded-lg border border-orange-500/30">
                          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-400">Connect your wallet to purchase a ticket.</p>
                        </div>
                        <Button disabled className="w-full py-6 text-lg font-semibold opacity-50 cursor-not-allowed">
                          <Ticket className="w-5 h-5 mr-2" />Connect Wallet First
                        </Button>
                      </div>
                    ) : isSoldOut ? (
                      <Button disabled className="w-full py-6 text-lg font-semibold bg-gray-700 text-gray-400 cursor-not-allowed">
                        Sold Out
                      </Button>
                    ) : (
                      /* ── THE MAIN BUY BUTTON ── */
                      <TransactionButton
                        transaction={() => {
                          console.log("→ claimTo | tokenId:", event.ticket_token_id, "| price:", event.price_pol, "POL");
                          return claimTo({
                            contract,
                            to: account.address,
                            tokenId: BigInt(event.ticket_token_id),
                            quantity: BigInt(1),
                          });
                        }}
                        payModal={{
                          metadata: {
                            name: event.title,
                            image: event.bannerImage,
                          },
                        }}
                        onTransactionSent={() => {
                          setTxState("confirming");
                          setIsDialogOpen(true);
                          toast.info("Processing purchase…", { description: "Confirm in your wallet." });
                        }}
                        onTransactionConfirmed={handleClaimSuccess}
                        onError={(err) => {
                          console.error("claimTo failed:", err);
                          toast.error("Purchase Failed", { description: err.message || "Please try again." });
                          setTxState("idle");
                        }}
                        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-purple-500/30"
                      >
                        <Ticket className="w-5 h-5 mr-2" />Buy Ticket — {event.priceInPOL} POL
                      </TransactionButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Purchase Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="glass border-purple-500/30 max-w-md">

          {/* Confirming state */}
          {txState === "confirming" && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <Loader2 className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Processing Transaction</h3>
              <p className="text-gray-400 text-center">Minting your NFT ticket on the blockchain…</p>
            </div>
          )}

          {/* Success state */}
          {txState === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center"
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Ticket Purchased</DialogTitle>
                <DialogDescription>Your NFT ticket was successfully minted.</DialogDescription>
              </DialogHeader>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center mb-6"
              >
                <Check className="w-12 h-12 text-green-400" />
              </motion.div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Ticket Minted!
              </h3>
              <p className="text-gray-400 text-center mb-2">
                🎉 Your NFT ticket for <strong className="text-white">{event.title}</strong> is now in your wallet.
              </p>
              <p className="text-gray-500 text-sm text-center mb-8">
                Check your profile to view it. An NFT certificate will be issued after the event.
              </p>

              <div className="w-full space-y-3">
                <Button onClick={() => router.push("/profile")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  View My Tickets
                </Button>
                <Button onClick={handleClose} variant="outline"
                  className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
