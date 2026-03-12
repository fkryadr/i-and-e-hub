"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { upload } from "thirdweb/storage";
import { lazyMint, nextTokenIdToMint } from "thirdweb/extensions/erc1155";
import { client, chain } from "@/lib/thirdweb";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar, Plus, Upload as UploadIcon, Loader2,
  Edit, Trash2, Check, X, Users, Sparkles, AlertCircle,
  MapPin, Tag, User, Ticket
} from "lucide-react";

// Contract — pure ERC-1155 Edition Drop on Polygon Amoy
const CONTRACT_ADDRESS = "0x7dD852BbC49b6Ddde1C9BF8c1D6c56932bc348B2";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  quota: number;
  totalQuota: number;
  priceInPOL: string;
  price_pol: number;
  banner_url?: string;
  status: "active" | "completed" | "cancelled";
  ticket_token_id: number | null;
  max_per_wallet: number | null;
}

export default function EventsPage() {
  const router = useRouter();
  const account = useActiveAccount();

  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEvents, setIsFetchingEvents] = useState(true);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    priceInPOL: "",
    quota: "",
    maxPerWallet: "",
  });

  // Purely visual state for demo presentation (not saved to DB)
  const [eventType, setEventType] = useState<"virtual" | "conference">("virtual");
  const [isIEHubOrg, setIsIEHubOrg] = useState(true);
  const [includedFeatures, setIncludedFeatures] = useState({
    nftTicket: true,
    exclusiveContent: false,
    liveQa: false,
    nftCert: true,
    networking: false,
    recordings: false
  });

  // Refs so async callbacks (onTransactionConfirmed) always read live values,
  // not stale React state from when the closure was created.
  const formDataRef = useRef(formData);
  const pendingBannerUriRef = useRef<string>(
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
  );

  const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });

  // ── Pre-fetch the next token ID from the chain
  // useReadContract 2-arg form: (extensionFn, { contract }) — thirdweb v5 pattern
  const { data: nextTokenId } = useReadContract(nextTokenIdToMint, { contract });

  // nextTokenIdRef — always holds the latest polled value (updated every render)
  const nextTokenIdRef = useRef<bigint | undefined>(undefined);
  useEffect(() => {
    nextTokenIdRef.current = nextTokenId as bigint | undefined;
  }, [nextTokenId]);

  // pendingTokenIdRef — locked inside transaction() the moment lazyMint is signed,
  // then read in onTransactionConfirmed (completely stale-closure-safe)
  const pendingTokenIdRef = useRef<bigint | undefined>(undefined);

  // ── Data ─────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setIsFetchingEvents(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(
          data.events.map((e: any) => ({
            id: e._id,
            title: e.title,
            description: e.description,
            date: e.date,
            quota: e.availableQuota,
            totalQuota: e.totalQuota,
            priceInPOL: e.priceInPOL,
            price_pol: parseFloat(e.priceInPOL) || 0,
            banner_url: e.bannerImage,
            status: "active" as const,
            ticket_token_id: e.ticket_token_id !== undefined ? Number(e.ticket_token_id) : null,
            max_per_wallet: e.max_per_wallet !== undefined ? Number(e.max_per_wallet) : null,
          }))
        );
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setIsFetchingEvents(false);
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      formDataRef.current = next;
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerFile(e.target.files?.[0] || null);
  };

  const resetForm = () => {
    const empty = { title: "", description: "", date: "", priceInPOL: "", quota: "", maxPerWallet: "" };
    setFormData(empty);
    formDataRef.current = empty;
    pendingBannerUriRef.current =
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop";
    setBannerFile(null);
    setIsEditMode(false);
    setEditingEventId(null);
    setIsLoading(false);
    setIsUploadingToIPFS(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) resetForm();
  };

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleEdit = async (event: Event) => {
    try {
      const res = await fetch(`/api/events/${event.id}`);
      const data = await res.json();
      if (res.ok) {
        const e = data.event;
        const localDt = new Date(e.event_date).toISOString().slice(0, 16);
        const next = {
          title: e.title,
          description: e.description || "",
          date: localDt,
          priceInPOL: e.price_pol?.toString() || "",
          quota: e.quota?.toString() || "",
          maxPerWallet: e.max_per_wallet?.toString() || "",
        };
        setFormData(next);
        formDataRef.current = next;
        setEditingEventId(event.id);
        setIsEditMode(true);
        setIsSheetOpen(true);
      }
    } catch {
      toast.error("Failed to load event details");
    }
  };

  const handleEditSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.title || !formData.date || !formData.priceInPOL || !formData.quota) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/events/${editingEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || "",
          event_date: new Date(formData.date).toISOString(),
          price_pol: parseFloat(formData.priceInPOL),
          quota: parseInt(formData.quota, 10),
          max_per_wallet: formData.maxPerWallet ? parseInt(formData.maxPerWallet, 10) : null,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update event");
      toast.success("Event Updated!", { description: `${formData.title} has been updated.` });
      setIsSheetOpen(false);
      resetForm();
      await fetchEvents();
    } catch (err) {
      toast.error("Failed to update event", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      toast.success(data.note ? "Event Deactivated" : "Event Deleted", {
        description: data.note || `${event.title} has been removed.`,
      });
      await fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const handleMintSuccess = async (receipt: any) => {
    console.log("✓ lazyMint confirmed", receipt);

    // The token ID minted is exactly the value nextTokenIdToMint returned
    // just before we called lazyMint (locked into pendingTokenIdRef inside transaction()).
    const tokenId = pendingTokenIdRef.current !== undefined
      ? Number(pendingTokenIdRef.current)
      : 0;
    console.log("→ tokenId used for DB:", tokenId);

    const liveForm = formDataRef.current;
    const liveBanner = pendingBannerUriRef.current;

    try {
      const payload = {
        title: liveForm.title.trim(),
        description: liveForm.description?.trim() || "",
        event_date: new Date(liveForm.date).toISOString(),
        price_pol: parseFloat(liveForm.priceInPOL),
        quota: parseInt(liveForm.quota, 10),
        banner_url: liveBanner,
        is_active: true,
        ticket_token_id: tokenId,
        max_per_wallet: liveForm.maxPerWallet
          ? parseInt(liveForm.maxPerWallet, 10)
          : null,
      };

      console.log("→ POST /api/events", payload);

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Save failed");

      console.log("✓ Saved event ID:", data.event._id);
      toast.success("🎉 Event Published!", {
        description: `${liveForm.title} is now live. Set claim conditions via the Thirdweb Dashboard.`,
      });

      setIsSheetOpen(false);
      resetForm();
      await fetchEvents();
      router.refresh();
    } catch (err) {
      console.error("DB save error:", err);
      toast.error("NFT minted but database save failed", {
        description: err instanceof Error ? err.message : "Check console.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Status badge ──────────────────────────────────────────────────────────────
  const getStatusBadge = (status: Event["status"]) => {
    const styles = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const icon = status === "cancelled" ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Listing Event
          </h2>
          <p className="text-gray-400">Manage all your events in one place</p>
        </div>

        {/* ── Create / Edit Sheet ── */}
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Event Baru
            </Button>
          </SheetTrigger>

          <SheetContent className="glass border-purple-500/30 sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="space-y-3 pb-6 border-b border-purple-500/30">
              <SheetTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {isEditMode ? "Edit Event" : "Create New Event"}
              </SheetTitle>
              <SheetDescription className="text-gray-400 text-base">
                {isEditMode
                  ? "Update the event details below."
                  : "Fill in the details and mint the NFT ticket metadata on-chain. Pricing & quota limits are configured separately via the Thirdweb Dashboard."}
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={isEditMode ? handleEditSubmit : (e) => e.preventDefault()}
              className="space-y-8 mt-8"
            >
              {/* Event Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">Event Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-200">
                    Event Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title" name="title"
                    placeholder="e.g. Web3 Innovation Summit 2026"
                    value={formData.title} onChange={handleInputChange}
                    className="h-12 glass border-purple-500/30 focus:border-purple-500 text-white placeholder:text-gray-500"
                    disabled={isLoading} required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-200">
                    Description
                  </Label>
                  <textarea
                    id="description" name="description"
                    placeholder="Provide a detailed description..."
                    value={formData.description} onChange={handleInputChange}
                    rows={4}
                    className="w-full glass border border-purple-500/30 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all resize-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">Event Details</h3>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Date &amp; Time <span className="text-red-400">*</span>
                  </Label>
                  <input
                    id="date" name="date" type="datetime-local"
                    value={formData.date} onChange={handleInputChange}
                    className="w-full h-12 glass border border-purple-500/30 focus:border-purple-500 rounded-lg px-4 text-white outline-none transition-all [color-scheme:dark]"
                    disabled={isLoading} required
                  />
                </div>

                {/* Price & Quota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priceInPOL" className="text-sm font-semibold text-gray-200">
                      <span className="text-[#8247E5] mr-1">◈</span>Price (POL) <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="priceInPOL" name="priceInPOL" type="number" step="0.001" min="0"
                        placeholder="0.05" value={formData.priceInPOL} onChange={handleInputChange}
                        className="h-12 pl-8 glass border-purple-500/30 text-white placeholder:text-gray-500"
                        disabled={isLoading} required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8247E5] font-bold">◈</span>
                    </div>
                    <p className="text-xs text-gray-500">Stored for reference — set on Thirdweb Dashboard</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quota" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Total Quota <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="quota" name="quota" type="number" min="1"
                      placeholder="500" value={formData.quota} onChange={handleInputChange}
                      className="h-12 glass border-purple-500/30 text-white placeholder:text-gray-500"
                      disabled={isLoading} required
                    />
                    <p className="text-xs text-gray-500">Set matching supply on Thirdweb Dashboard</p>
                  </div>
                </div>

                {/* Max per Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="maxPerWallet" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Max Tickets per Wallet
                    <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                  </Label>
                  <Input
                    id="maxPerWallet" name="maxPerWallet" type="number" min="1"
                    placeholder="e.g. 5" value={formData.maxPerWallet} onChange={handleInputChange}
                    className="h-12 glass border-purple-500/30 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">Stored for reference — configure on Thirdweb Dashboard</p>
                </div>
              </div>

              {/* Event Settings (Visual UI Only) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">Event Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Event Type Toggles */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-200">Event Format</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEventType("virtual")}
                        className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border transition-all text-sm font-medium ${
                          eventType === "virtual" 
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                            : "bg-black/20 border-gray-700/50 text-gray-400 hover:bg-white/5"
                        }`}
                      >
                        <MapPin className="w-4 h-4" /> Virtual Event
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventType("conference")}
                        className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border transition-all text-sm font-medium ${
                          eventType === "conference" 
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                            : "bg-black/20 border-gray-700/50 text-gray-400 hover:bg-white/5"
                        }`}
                      >
                        <Tag className="w-4 h-4" /> Conference
                      </button>
                    </div>
                  </div>

                  {/* Organizer Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-200">Organizer</Label>
                    <button
                      type="button"
                      onClick={() => setIsIEHubOrg(!isIEHubOrg)}
                      className={`w-full flex items-center justify-between px-4 h-11 rounded-lg border transition-all text-sm font-medium ${
                        isIEHubOrg 
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                          : "bg-black/20 border-gray-700/50 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Organized by I&E Hub Team
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isIEHubOrg ? "border-blue-500 bg-blue-500 text-white" : "border-gray-600 bg-transparent"
                      }`}>
                        {isIEHubOrg && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* What's Included (Visual UI Only) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">What&apos;s Included</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "nftTicket", label: "NFT Ticket Access", icon: Ticket },
                    { id: "exclusiveContent", label: "Exclusive Content", icon: Sparkles },
                    { id: "liveQa", label: "Live Q&A Sessions", icon: Users },
                    { id: "nftCert", label: "NFT Certificate After Event", icon: Check },
                    { id: "networking", label: "Networking Opportunities", icon: Users },
                    { id: "recordings", label: "Event Recordings", icon: Loader2 },
                  ].map((feature) => {
                    const isChecked = includedFeatures[feature.id as keyof typeof includedFeatures];
                    const Icon = feature.icon;
                    return (
                      <label 
                        key={feature.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? "bg-purple-500/10 border-purple-500/40 text-purple-300" 
                            : "bg-black/20 border-gray-700/50 text-gray-400 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 opacity-70" />
                          <span className="text-sm font-medium">{feature.label}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={isChecked}
                          onChange={() => setIncludedFeatures(prev => ({ ...prev, [feature.id]: !prev[feature.id as keyof typeof includedFeatures] }))}
                        />
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-all ${
                          isChecked ? "border-purple-500 bg-purple-500 text-white" : "border-gray-500 bg-transparent"
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">Event Banner</h3>
                </div>

                <input id="bannerFile" name="bannerFile" type="file" accept="image/*"
                  onChange={handleFileChange} className="hidden"
                  disabled={isLoading || isEditMode}
                />
                <label htmlFor="bannerFile"
                  className={`block ${(isLoading || isEditMode) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className={`glass border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${bannerFile ? "border-green-500/50 bg-green-500/5" : "border-purple-500/30 hover:border-purple-500/60"}`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center
                        ${bannerFile ? "bg-green-500/20" : "bg-purple-500/20"}`}>
                        {bannerFile
                          ? <Check className="w-7 h-7 text-green-400" />
                          : <UploadIcon className="w-7 h-7 text-purple-400" />}
                      </div>
                      {bannerFile ? (
                        <div>
                          <p className="text-green-400 font-semibold text-sm">{bannerFile.name}</p>
                          <p className="text-gray-500 text-xs">{(bannerFile.size / 1024 / 1024).toFixed(2)} MB · click to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-200 font-medium text-sm">Drop image or click to browse</p>
                          <p className="text-gray-500 text-xs">PNG, JPG, GIF · Max 10 MB · Optional</p>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              {/* Submit area */}
              <div className="pt-6 border-t border-purple-500/30 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-6 px-6 pb-6 space-y-3">
                {/* Wallet warning */}
                {!account && !isEditMode && (
                  <div className="glass border border-orange-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-orange-400 font-semibold text-sm">Wallet Not Connected</p>
                      <p className="text-gray-400 text-xs">Connect your Polygon Amoy wallet to mint NFT metadata.</p>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {(isUploadingToIPFS || isLoading) && (
                  <div className="glass border border-cyan-500/30 rounded-lg p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
                    <p className="text-cyan-400 text-sm font-semibold">
                      {isUploadingToIPFS ? "Uploading banner to IPFS…" : "Minting & saving event…"}
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsSheetOpen(false)}
                    disabled={isLoading || isUploadingToIPFS}
                    className="h-12 px-6 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>

                  {isEditMode ? (
                    <Button type="submit" disabled={isLoading}
                      className="h-12 px-8 font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      {isLoading
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Updating…</span></>
                        : <span>Update Event</span>}
                    </Button>
                  ) : (
                    <TransactionButton
                      transaction={async () => {
                        if (!formData.title || !formData.date || !formData.priceInPOL || !formData.quota) {
                          toast.error("Please fill in all required fields");
                          throw new Error("Validation failed");
                        }
                        if (!account) {
                          toast.error("Please connect your wallet first");
                          throw new Error("Wallet not connected");
                        }

                        setIsUploadingToIPFS(true);
                        setIsLoading(true);

                        try {
                          // 1. Upload banner
                          let bannerUri = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop";
                          if (bannerFile) {
                            toast.info("Uploading banner to IPFS…");
                            bannerUri = await upload({ client, files: [bannerFile] });
                            console.log("Banner URI:", bannerUri);
                          }
                          pendingBannerUriRef.current = bannerUri;
                          setIsUploadingToIPFS(false);

                          // 2. Build NFT metadata
                          const metadata = {
                            name: formData.title,
                            description: formData.description || `Join us for ${formData.title}`,
                            image: bannerUri,
                            attributes: [
                              { trait_type: "Event Date", value: formData.date },
                              { trait_type: "Price (POL)", value: formData.priceInPOL },
                              { trait_type: "Total Quota", value: formData.quota },
                              { trait_type: "Max Per Wallet", value: formData.maxPerWallet || "Set via Dashboard" },
                              { trait_type: "Event Type", value: "NFT Ticket" },
                            ],
                          };

                          // 3. Lock in the token ID BEFORE sending the tx to the wallet.
                          pendingTokenIdRef.current = nextTokenIdRef.current;
                          console.log("→ Locking tokenId for DB:", pendingTokenIdRef.current?.toString());

                          // 4. Return lazyMint tx for wallet to sign
                          return lazyMint({ contract, nfts: [metadata] });
                        } catch (err) {
                          setIsUploadingToIPFS(false);
                          setIsLoading(false);
                          throw err;
                        }
                      }}
                      onTransactionSent={() =>
                        toast.info("Minting NFT Ticket Metadata", { description: "Please confirm in your wallet…" })
                      }
                      onTransactionConfirmed={handleMintSuccess}
                      onError={(err) => {
                        console.error("Transaction failed:", err);
                        toast.error("Transaction Failed", { description: err.message });
                        setIsLoading(false);
                        setIsUploadingToIPFS(false);
                      }}
                      disabled={isLoading || isUploadingToIPFS || !account}
                      className="!h-12 !px-8 !font-bold !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 !transition-all hover:!scale-105 hover:!shadow-[0_0_20px_rgba(168,85,247,0.4)] !rounded-md disabled:!opacity-50"
                    >
                      {isUploadingToIPFS
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Uploading...</span></>
                        : isLoading
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Minting...</span></>
                        : <><Sparkles className="w-5 h-5 mr-2" /><span>Create Event</span></>}
                    </TransactionButton>
                  )}
                </div>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-purple-400" />
              All Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-purple-500/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5 border-purple-500/30">
                    <TableHead className="text-gray-400">Title</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Quota</TableHead>
                    <TableHead className="text-gray-400">Price</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingEvents ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                          <p className="text-gray-400">Loading events…</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="w-12 h-12 text-gray-600" />
                          <p className="text-gray-400">No events yet. Create your first one!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-purple-500/30 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-medium text-white max-w-[200px] truncate">
                          {event.title}
                        </TableCell>
                        <TableCell className="text-gray-400">{event.date}</TableCell>
                        <TableCell className="text-gray-400">{event.quota} / {event.totalQuota}</TableCell>
                        <TableCell className="text-[#8247E5] font-semibold">{event.priceInPOL} POL</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm"
                              onClick={() => router.push(`/admin/dashboard/events/${event.id}/attendees`)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                              title="Manage Attendees & Certificates">
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              onClick={() => handleEdit(event)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              title="Edit Event">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              onClick={() => handleDelete(event)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Delete Event">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
