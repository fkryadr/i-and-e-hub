"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract, MediaRenderer } from "thirdweb/react";
import { motion, AnimatePresence } from "framer-motion";
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { getOwnedNFTs as getCertNFTs } from "thirdweb/extensions/erc721";
import { client, chain } from "@/lib/thirdweb";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle, Wallet, Mail, Save, Ticket, Award,
  Inbox, Check, User, Edit2, Copy, Loader2, ExternalLink, Download, Droplet,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserData {
  wallet_address: string;
  full_name: string;
  email: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const truncate = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/** DiceBear Bottts avatar seeded on the wallet address (no install needed) */
const avatarUrl = (wallet: string) =>
  `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${wallet}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

// ── Contract ───────────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x7dD852BbC49b6Ddde1C9BF8c1D6c56932bc348B2";
const CERT_CONTRACT_ADDRESS = "0x11201AC249186142f9acC61f79510eE0defb31F0";

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const account = useActiveAccount();
  const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });
  const certContract = getContract({ client, chain, address: CERT_CONTRACT_ADDRESS });

  // profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetched user state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  // Track which certificate tokenId is currently generating a PDF
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  // Faucet state
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const [cooldownText, setCooldownText] = useState<string | null>(null);

  // Check cooldown on mount/account change
  useEffect(() => {
    if (account?.address) {
      const storageKey = `faucet_claim_${account.address}`;
      const lastRequest = localStorage.getItem(storageKey);
      
      if (lastRequest) {
        const timeElapsed = Date.now() - parseInt(lastRequest);
        const cooldownMs = 24 * 60 * 60 * 1000;
        
        if (timeElapsed < cooldownMs) {
          // Still on cooldown
          const remainingMs = cooldownMs - timeElapsed;
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          
          setCanClaim(false);
          setCooldownText(`${remainingHours}h ${remainingMinutes}m left`);
        } else {
          // Cooldown expired
          localStorage.removeItem(storageKey);
          setCanClaim(true);
          setCooldownText(null);
        }
      } else {
        setCanClaim(true);
        setCooldownText(null);
      }
    }
  }, [account?.address]);

  const handleFaucetRequest = async () => {
    if (!account?.address) return;
    setIsFaucetLoading(true);
    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAddress: account.address }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("0.5 POL is on its way!");
        
        // Immediately trigger the 24h state
        const storageKey = `faucet_claim_${account.address}`;
        localStorage.setItem(storageKey, Date.now().toString());
        setCanClaim(false);
        setCooldownText("23h 59m left");
      } else {
        toast.error(data.error || "Failed to dispense funds.");
      }
    } catch (error) {
      console.error("Faucet Request Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsFaucetLoading(false);
    }
  };

  // ── Fetch profile whenever wallet changes ──────────────────────────────────
  useEffect(() => {
    if (!account?.address) { setUserData(null); return; }

    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(
          `/api/users?wallet=${encodeURIComponent(account.address.toLowerCase())}`
        );
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
          if (data.user) {
            setFullName(data.user.full_name);
            setEmail(data.user.email);
          }
        } else {
          setUserData(null);
        }
      } catch {
        setUserData(null);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [account?.address]);

  // ── Fetch owned NFTs (Tickets) ─────────────────────────────────────────────
  const { data: ownedNFTs, isLoading: isNFTsLoading, error: nftsError } = useReadContract(
    getOwnedNFTs,
    {
      contract,
      address: account?.address || "",
      queryOptions: {
        enabled: !!account?.address,
      },
    }
  );

  // ── Fetch owned Certificate NFTs (ERC-721) ─────────────────────────────────
  const { data: ownedCerts, isLoading: isCertsLoading } = useReadContract(
    getCertNFTs,
    {
      contract: certContract,
      owner: account?.address || "",
      queryOptions: {
        enabled: !!account?.address,
      },
    }
  );

  // Debugging log for visibility in browser console
  useEffect(() => {
    if (account?.address) {
      console.log("Owned Tickets:", ownedNFTs, "Error:", nftsError);
      console.log("Owned Certificates:", ownedCerts);
    }
  }, [ownedNFTs, nftsError, ownedCerts, account?.address]);

  // ── Download certificate as landscape PDF ────────────────────────────────
  const downloadCertificatePDF = async (nft: { id: bigint; metadata: { name?: string; image?: string } }) => {
    const tokenId = nft.id.toString();
    if (pdfLoadingId === tokenId) return;
    setPdfLoadingId(tokenId);

    try {
      // ── 1. Resolve IPFS URI → HTTP URL ────────────────────────────────────
      let imgUrl = (nft.metadata.image as string) || "";
      if (imgUrl.startsWith("ipfs://")) {
        const cid = imgUrl.replace("ipfs://", "");
        // Try Thirdweb's gateway first (usually already warmed up if MediaRenderer displayed it)
        imgUrl = `https://ipfs.thirdwebcdn.com/ipfs/${cid}`;
      }
      if (!imgUrl) throw new Error("Certificate has no image.");

      // ── 2. Fetch image blob via browser fetch (no canvas = no CORS taint) ─
      const fetchWithFallback = async (url: string): Promise<Blob> => {
        let res = await fetch(url);
        if (!res.ok) {
          // Fallback to public IPFS gateway
          const cid = url.split("/ipfs/")[1];
          res = await fetch(`https://ipfs.io/ipfs/${cid}`);
        }
        if (!res.ok) throw new Error(`Image fetch failed: HTTP ${res.status}`);
        return res.blob();
      };

      const blob = await fetchWithFallback(imgUrl);

      // ── 3. Convert blob → base64 via FileReader ────────────────────────────
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(blob);
      });

      // ── 4. Determine real image dimensions ────────────────────────────────
      const { width: imgW, height: imgH } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("Could not read image dimensions."));
        img.src = base64;
      });

      // ── 5. Build landscape A4 PDF, centre + fit image ──────────────────────
      const doc    = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW  = doc.internal.pageSize.getWidth();
      const pageH  = doc.internal.pageSize.getHeight();
      const margin = 8; // mm padding around the certificate
      const maxW   = pageW - margin * 2;
      const maxH   = pageH - margin * 2;

      const aspectRatio = imgW / imgH;
      let drawW = maxW;
      let drawH = drawW / aspectRatio;
      if (drawH > maxH) { drawH = maxH; drawW = drawH * aspectRatio; }

      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      const fmt = blob.type === "image/jpeg" ? "JPEG" : "PNG";
      doc.addImage(base64, fmt, x, y, drawW, drawH);
      doc.save(`${(nft.metadata.name || "certificate").replace(/[/\\?%*:|"<>]/g, "_")}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("[PDF Export]", err);
      toast.error("PDF generation failed", {
        description: err instanceof Error ? err.message : "Check the browser console for details.",
      });
    } finally {
      setPdfLoadingId(null);
    }
  };

  // ── Save / upsert profile ──────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!email.trim()) { toast.error("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address"); return;
    }
    if (!account) { toast.error("Wallet not connected"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: account.address,
          full_name: fullName.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setUserData(data.user);
      setIsEditing(false);
      toast.success("Profile saved!", {
        description: "Your details have been updated.",
      });
    } catch (err) {
      toast.error("Failed to save profile", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Gate: wallet not connected ─────────────────────────────────────────────
  if (!account) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="max-w-lg glass border-purple-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Please connect your wallet to access your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 glass rounded-lg border border-orange-500/30">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  Use the <strong className="text-white">Connect Wallet</strong> button in the top navigation bar to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Gate: loading profile ──────────────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-mono text-purple-400">{truncate(account.address)}</span>
          </div>
        </motion.div>

        {/* ── Profile section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }} className="mb-8"
        >
          <AnimatePresence mode="wait">
            {/* ─── PROFILE CARD (registered + not editing) ─── */}
            {userData && !isEditing ? (
              <motion.div
                key="profile-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass border-purple-500/30 overflow-hidden">
                  {/* Gradient band */}
                  <div className="h-24 bg-gradient-to-r from-purple-600/40 via-pink-600/30 to-cyan-600/40" />

                  <CardContent className="relative px-8 pb-8">
                    {/* Avatar — pulled up over the gradient band */}
                    <div className="absolute -top-12 left-8">
                      <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-purple-500/20 shadow-xl shadow-purple-500/20">
                        <img
                          src={avatarUrl(account.address)}
                          alt="Avatar"
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Faucet and Edit buttons */}
                    <div className="flex flex-wrap justify-end pt-2 mb-6 gap-3">
                      <Button
                        variant="outline" size="sm"
                        onClick={handleFaucetRequest}
                        disabled={isFaucetLoading || !canClaim}
                        className={`gap-2 ${
                          !canClaim 
                            ? "border-gray-600 hover:bg-transparent text-gray-500 cursor-not-allowed" 
                            : "border-blue-500/30 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300"
                        }`}
                      >
                        {isFaucetLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</>
                        ) : !canClaim ? (
                          <><AlertCircle className="w-4 h-4 text-orange-500/80" /> Faucet on Cooldown ({cooldownText})</>
                        ) : (
                          <><Droplet className="w-4 h-4" /> Request 0.5 POL (Faucet)</>
                        )}
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </div>

                    {/* Name + badges */}
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">
                          {userData.full_name}
                        </h2>
                        <p className="text-gray-400 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {userData.email}
                        </p>
                      </div>

                      {/* Wallet address chip */}
                      <button
                        onClick={copyAddress}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 hover:border-purple-500/60 transition-all text-sm font-mono text-gray-300 hover:text-white group"
                      >
                        <Wallet className="w-3.5 h-3.5 text-purple-400" />
                        {truncate(account.address)}
                        {copied
                          ? <Check className="w-3.5 h-3.5 text-green-400" />
                          : <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300" />}
                      </button>

                      {/* Registered since */}
                      <p className="text-xs text-gray-600">
                        Registered{" "}
                        {new Date(userData.created_at).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            ) : (
              /* ─── REGISTRATION / EDIT FORM ─── */
              <motion.div
                key="profile-form"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5 text-purple-400" />
                      {isEditing ? "Edit Profile" : "Complete Your Profile"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {isEditing
                        ? "Update your name or email below."
                        : "Your name will appear on NFT certificates issued after events."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-300">
                          Full Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="fullName" type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="glass border-purple-500/30 focus:border-purple-500/50 text-white placeholder:text-gray-500"
                          disabled={isSubmitting} required
                        />
                        <p className="text-xs text-gray-500">Displayed on your NFT certificates.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">
                          Email Address <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email" type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="glass border-purple-500/30 focus:border-purple-500/50 text-white placeholder:text-gray-500"
                          disabled={isSubmitting} required
                        />
                        <p className="text-xs text-gray-500">We'll notify you when certificates are issued.</p>
                      </div>

                      <div className="flex gap-3">
                        {isEditing && (
                          <Button
                            type="button" variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-purple-500/30 hover:bg-purple-500/10"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="submit" disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Save Profile</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tickets & Certificates Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass border border-purple-500/30">
              <TabsTrigger value="tickets"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Ticket className="w-4 h-4 mr-2" />My Tickets
              </TabsTrigger>
              <TabsTrigger value="certificates"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Award className="w-4 h-4 mr-2" />My Certificates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              {isNFTsLoading ? (
                <Card className="glass border-purple-500/30">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                    <p className="text-gray-400">Loading your tickets…</p>
                  </CardContent>
                </Card>
              ) : ownedNFTs && ownedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.map((nft) => (
                    <motion.div
                      key={nft.id.toString()}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="glass border-purple-500/30 overflow-hidden h-full flex flex-col group">
                        <div className="relative h-48 w-full overflow-hidden bg-purple-500/10">
                          {nft.metadata.image ? (
                            <MediaRenderer
                              client={client}
                              src={nft.metadata.image}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full gap-2 bg-purple-500/10">
                              <Ticket className="w-10 h-10 text-purple-400/50" />
                              <span className="text-xs text-purple-400/50">No Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <span className="px-3 py-1 bg-purple-600/80 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-purple-400/50">
                              Ticket
                            </span>
                            <span className="text-sm font-mono text-purple-300">#{nft.id.toString()}</span>
                          </div>
                        </div>
                        <CardContent className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {nft.metadata.name || "Unnamed Ticket"}
                          </h3>
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                            {nft.metadata.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                            <span className="text-gray-400 text-sm">Quantity Owned: <strong className="text-white">{nft.quantityOwned.toString()}</strong></span>
                            <a
                              href={`https://amoy.polygonscan.com/nft/${CONTRACT_ADDRESS}/${nft.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Explorer
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="glass border-purple-500/30">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                      <Ticket className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                      Browse our featured events and mint your first NFT ticket!
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/events")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Inbox className="w-4 h-4 mr-2" />Browse Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="certificates">
              {isCertsLoading ? (
                <Card className="glass border-purple-500/30">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                    <p className="text-gray-400">Loading your certificates…</p>
                  </CardContent>
                </Card>
              ) : ownedCerts && ownedCerts.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 pl-1">
                    {ownedCerts.length} certificate{ownedCerts.length > 1 ? "s" : ""} earned
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedCerts.map((nft) => (
                      <motion.div
                        key={nft.id.toString()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="glass border-cyan-500/30 overflow-hidden h-full flex flex-col group hover:border-cyan-400/50 transition-all duration-300">
                          {/* Certificate image */}
                          <div className="relative h-52 w-full overflow-hidden bg-cyan-500/10">
                            {nft.metadata.image ? (
                              <MediaRenderer
                                client={client}
                                src={nft.metadata.image as string}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <Award className="w-16 h-16 text-cyan-400/40" />
                              </div>
                            )}
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            {/* Badge */}
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                              <span className="px-3 py-1 bg-cyan-600/80 backdrop-blur-md rounded-full text-xs font-bold text-white border border-cyan-400/50 flex items-center gap-1">
                                <Award className="w-3 h-3" /> Certificate
                              </span>
                              <span className="text-xs font-mono text-cyan-300">#{nft.id.toString()}</span>
                            </div>
                          </div>

                          <CardContent className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                              {nft.metadata.name || "Unnamed Certificate"}
                            </h3>
                            {nft.metadata.description && (
                              <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">
                                {nft.metadata.description as string}
                              </p>
                            )}
                            {/* Attributes chips */}
                            {Array.isArray(nft.metadata.attributes) && nft.metadata.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                {(nft.metadata.attributes as Array<{ trait_type: string; value: string }>).map((attr, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-300"
                                  >
                                    {attr.trait_type}: {attr.value}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="pt-3 border-t border-cyan-500/20 mt-auto flex items-center justify-between gap-2">
                              <a
                                href={`https://amoy.polygonscan.com/nft/${CERT_CONTRACT_ADDRESS}/${nft.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                              >
                                <ExternalLink className="w-3 h-3" /> View on Explorer
                              </a>
                              <button
                                onClick={() => downloadCertificatePDF(nft)}
                                disabled={pdfLoadingId === nft.id.toString()}
                                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-purple-500/20 hover:border-purple-500/40 px-2 py-1 rounded-lg"
                              >
                                {pdfLoadingId === nft.id.toString() ? (
                                  <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                                ) : (
                                  <><Download className="w-3 h-3" /> Download PDF</>
                                )}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="glass border-purple-500/30">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                      <Award className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                      Attend events to earn exclusive NFT certificates.
                    </p>
                    <div className="flex items-start gap-3 p-4 glass rounded-lg border border-cyan-500/30 max-w-md">
                      <Mail className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        Complete your profile with an email to receive notifications when certificates are issued.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
