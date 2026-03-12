"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Palette, Check, Download, Wand2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CompletedEvent { id: string; title: string; }
interface Attendee {
  wallet_address: string;
  full_name: string;
  email: string;
  is_certificate_sent: boolean;
}

// ── Certificate Templates ─────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "navy",
    label: "Royal Navy",
    bg: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    border: "2px solid rgba(139,92,246,0.6)",
    textColor: "#e9d5ff",
    accentColor: "#a78bfa",
    sealColor: "#7c3aed",
  },
  {
    id: "dark-gold",
    label: "Dark Gold",
    bg: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    border: "2px solid rgba(251,191,36,0.6)",
    textColor: "#fef3c7",
    accentColor: "#fbbf24",
    sealColor: "#d97706",
  },
  {
    id: "emerald",
    label: "Forest Elite",
    bg: "linear-gradient(135deg, #0a1628, #0d2137, #0c3547)",
    border: "2px solid rgba(52,211,153,0.6)",
    textColor: "#d1fae5",
    accentColor: "#34d399",
    sealColor: "#059669",
  },
  {
    id: "rose",
    label: "Crimson Gala",
    bg: "linear-gradient(135deg, #1f0035, #3b0764, #1e1b4b)",
    border: "2px solid rgba(244,114,182,0.6)",
    textColor: "#fce7f3",
    accentColor: "#f472b6",
    sealColor: "#be185d",
  },
];

// ── Google Font (loaded via <link> in head — we inline it via style tag) ──────
const FONT_PAIRS = [
  { label: "Playfair + Inter", heading: "'Playfair Display', serif", body: "'Inter', sans-serif" },
  { label: "Cinzel + Lato",    heading: "'Cinzel', serif",           body: "'Lato', sans-serif" },
  { label: "Cormorant + DM Sans", heading: "'Cormorant Garamond', serif", body: "'DM Sans', sans-serif" },
];

export default function DesignCertificatePage() {
  const router = useRouter();

  // ── Data State ─────────────────────────────────────────────────────────────
  const [events, setEvents]       = useState<CompletedEvent[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventId, setEventId]     = useState("");
  const [attendeeWallet, setAttendeeWallet] = useState("");
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  // ── Design State ───────────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFont, setSelectedFont]         = useState(FONT_PAIRS[0]);
  const [fontSize, setFontSize]                 = useState(40);
  const [subFontSize, setSubFontSize]           = useState(20);
  const [customSubtitle, setCustomSubtitle]     = useState("Certificate of Attendance");

  // ── Generate State ─────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedAttendee = attendees.find(a => a.wallet_address === attendeeWallet);
  const selectedEvent    = events.find(e => e.id === eventId);

  // ── Fetch events on mount ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const res  = await fetch("/api/events/completed");
      const data = await res.json();
      if (res.ok) setEvents(data.events);
    })();
  }, []);

  // ── Fetch attendees whenever event changes ─────────────────────────────────
  useEffect(() => {
    setAttendeeWallet("");
    setGeneratedFile(null);
    if (!eventId) { setAttendees([]); return; }

    (async () => {
      setIsLoadingAttendees(true);
      try {
        const res  = await fetch(`/api/events/${eventId}/attendees`);
        const data = await res.json();
        if (res.ok) setAttendees(data.attendees);
      } finally {
        setIsLoadingAttendees(false);
      }
    })();
  }, [eventId]);

  // ── Generate PNG from the canvas div ──────────────────────────────────────
  const handleGenerate = async () => {
    if (!canvasRef.current) return;
    if (!selectedAttendee) { toast.error("Select an attendee first."); return; }

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true });
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `cert_${selectedAttendee.full_name.replace(/\s+/g, "_")}.png`,
        { type: "image/png" }
      );
      setGeneratedFile(file);
      toast.success("Certificate generated!", { description: "Now go to 'Terbitkan Sertifikat' to mint it." });
    } catch {
      toast.error("Failed to generate certificate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download preview ───────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!generatedFile) return;
    const url = URL.createObjectURL(generatedFile);
    const a   = document.createElement("a");
    a.href    = url;
    a.download = generatedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Navigate to mint page with file in localStorage (simple handoff) ───────
  const handleGoMint = () => {
    if (!generatedFile) { toast.error("Generate the certificate first."); return; }
    // Store file info in sessionStorage for the mint page to pick up
    // (We store as dataURL since File objects can't be serialized directly)
    const reader = new FileReader();
    reader.onload = (e) => {
      sessionStorage.setItem("pendingCertDataUrl", e.target?.result as string);
      sessionStorage.setItem("pendingCertName", generatedFile.name);
      sessionStorage.setItem("pendingCertWallet", attendeeWallet);
      router.push("/admin/dashboard/certificates");
    };
    reader.readAsDataURL(generatedFile);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Design Certificate
        </h1>
        <p className="text-gray-400 mt-2">Choose a template, personalise it, then generate a certificate image ready for IPFS minting.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">

        {/* ── LEFT: Live Canvas Preview ─────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Live Preview</h2>

          {/* Canvas */}
          <div
            ref={canvasRef}
            style={{
              background: selectedTemplate.bg,
              border: selectedTemplate.border,
              fontFamily: selectedFont.body,
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              aspectRatio: "1.414 / 1",   // A4-ish landscape ratio
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px",
              boxSizing: "border-box",
              minHeight: "380px",
              userSelect: "none",
            }}
          >
            {/* Corner ornaments */}
            {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-16 h-16 rounded-full opacity-10`}
                style={{ background: selectedTemplate.accentColor, filter: "blur(20px)" }}
              />
            ))}

            {/* Inner border line */}
            <div
              style={{
                position: "absolute",
                inset: "16px",
                border: `1px solid ${selectedTemplate.accentColor}33`,
                borderRadius: "8px",
                pointerEvents: "none",
              }}
            />

            {/* Seal dot */}
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, ${selectedTemplate.accentColor}, ${selectedTemplate.sealColor})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, boxShadow: `0 0 24px ${selectedTemplate.accentColor}66`,
              }}
            >
              <span style={{ fontSize: 28 }}>🎓</span>
            </div>

            {/* Title */}
            <p
              style={{
                fontFamily: selectedFont.heading,
                fontSize: `${subFontSize}px`,
                color: selectedTemplate.accentColor,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {customSubtitle}
            </p>

            {/* Divider */}
            <div style={{ width: 160, height: 1, background: `${selectedTemplate.accentColor}55`, marginBottom: 16 }} />

            {/* Attendee name */}
            <p
              style={{
                fontFamily: selectedFont.heading,
                fontSize: `${fontSize}px`,
                color: selectedTemplate.textColor,
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              {selectedAttendee?.full_name || "Attendee Name"}
            </p>

            {/* Event line */}
            <p
              style={{
                fontSize: `${Math.round(subFontSize * 0.9)}px`,
                color: `${selectedTemplate.textColor}99`,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              {selectedEvent ? `for attending ${selectedEvent.title}` : "for attending [Event Name]"}
            </p>

            {/* Bottom date / issuer */}
            <div
              style={{
                position: "absolute",
                bottom: 28,
                left: 48,
                right: 48,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <p style={{ fontSize: 12, color: `${selectedTemplate.textColor}55` }}>
                I&E Hub · Polygon Amoy
              </p>
              <p style={{ fontSize: 12, color: `${selectedTemplate.textColor}55` }}>
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Action row */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAttendee}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? "Generating…" : "Generate Certificate"}
            </button>

            {generatedFile && (
              <>
                <button
                  onClick={handleDownload}
                  className="px-4 py-3 glass border border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-white rounded-xl transition-all"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGoMint}
                  className="flex items-center gap-2 px-4 py-3 bg-cyan-600/80 hover:bg-cyan-500/80 text-white font-semibold rounded-xl transition-all"
                  title="Send to Mint page"
                >
                  Mint <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {generatedFile && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              <Check className="w-4 h-4" />
              <span>Ready: <strong>{generatedFile.name}</strong></span>
            </div>
          )}
        </div>

        {/* ── RIGHT: Controls Panel ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Template Picker */}
          <div className="glass border border-purple-500/30 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" /> Template
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all ${
                    selectedTemplate.id === t.id
                      ? "border-purple-400 scale-105 shadow-lg shadow-purple-500/30"
                      : "border-transparent hover:border-purple-500/50"
                  }`}
                  style={{ background: t.bg }}
                >
                  <span className="text-xs font-semibold" style={{ color: t.accentColor }}>
                    {t.label}
                  </span>
                  {selectedTemplate.id === t.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="glass border border-purple-500/30 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-white">Typography</h3>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Font Pair</label>
              <select
                value={selectedFont.label}
                onChange={(e) => setSelectedFont(FONT_PAIRS.find(f => f.label === e.target.value)!)}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/70 appearance-none"
              >
                {FONT_PAIRS.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Name Size: {fontSize}px</label>
              <input type="range" min={24} max={64} value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Subtitle Size: {subFontSize}px</label>
              <input type="range" min={12} max={32} value={subFontSize}
                onChange={e => setSubFontSize(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Subtitle Text</label>
              <input
                type="text"
                value={customSubtitle}
                onChange={e => setCustomSubtitle(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/70"
                placeholder="Certificate of Attendance"
              />
            </div>
          </div>

          {/* Attendee Selector */}
          <div className="glass border border-purple-500/30 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-white">Attendee</h3>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Event</label>
              <div className="flex items-center gap-2">
                <select
                  value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/70 appearance-none"
                >
                  <option value="">-- Select Event --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                {isLoadingAttendees && <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Attendee</label>
              <select
                value={attendeeWallet}
                onChange={e => setAttendeeWallet(e.target.value)}
                disabled={!eventId || attendees.length === 0}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 focus:outline-none focus:border-purple-500/70 appearance-none"
              >
                <option value="">{!eventId ? "Select event first" : attendees.length === 0 && !isLoadingAttendees ? "No attendees found" : "-- Select Attendee --"}</option>
                {attendees.map(a => (
                  <option key={a.wallet_address} value={a.wallet_address} disabled={a.is_certificate_sent}>
                    {a.full_name}
                    {a.is_certificate_sent ? " (Minted)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedAttendee && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-gray-300 space-y-1">
                <p><span className="text-gray-500">Name:</span> {selectedAttendee.full_name}</p>
                <p className="font-mono truncate"><span className="text-gray-500">Wallet:</span> {selectedAttendee.wallet_address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
