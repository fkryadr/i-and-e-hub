"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, ArrowLeft, Users, CheckCircle2, ChevronRight, Clock
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Attendee {
  wallet_address: string;
  full_name: string;
  email: string;
  ticket_bought_at: string;
  is_certificate_sent: boolean;
}

export default function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string | null>(null);

  const [eventDetails, setEventDetails] = useState<{ title: string; id: string } | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Unwrap params (Next.js async params)
  const resolvedParams = use(params);
  
  useEffect(() => {
    setEventId(resolvedParams.id);
  }, [resolvedParams]);

  // 2. Fetch Attendees
  useEffect(() => {
    if (!eventId) return;

    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/attendees`);
        const data = await res.json();
        if (res.ok) {
          setEventDetails(data.event);
          setAttendees(data.attendees);
        } else {
          toast.error("Failed to load attendees", { description: data.error });
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred fetching attendees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);

  const stats = {
    total: attendees.length,
    minted: attendees.filter(a => a.is_certificate_sent).length,
    pending: attendees.filter(a => !a.is_certificate_sent).length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading attendees…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Attendees Status
          </h1>
          <p className="text-gray-400">{eventDetails?.title || "Event Dashboard"}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="glass border-purple-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Attendees</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass border-green-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Certificates Sent</p>
              <h3 className="text-2xl font-bold text-white">{stats.minted}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Certificates Pending</p>
              <h3 className="text-2xl font-bold text-white">{stats.pending}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendees Table */}
      <Card className="glass border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-purple-400" />
            Ticket Holders Monitoring
          </CardTitle>
          <CardDescription className="text-gray-400">
            View attendee details and clear certificate minting status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-purple-500/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-purple-500/30">
                  <TableHead className="text-gray-400">Attendee Name</TableHead>
                  <TableHead className="text-gray-400">Email Address</TableHead>
                  <TableHead className="text-gray-400">Wallet Address</TableHead>
                  <TableHead className="text-gray-400 min-w-[180px]">Certificate Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-10 h-10 text-gray-600" />
                        <p>No tickets sold yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendees.map((val) => (
                    <TableRow key={val.wallet_address} className="hover:bg-white/5 border-purple-500/30">
                      <TableCell>
                        <div className="font-semibold text-white">{val.full_name}</div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {val.email}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-gray-400">
                        {val.wallet_address.slice(0, 6)}...{val.wallet_address.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {val.is_certificate_sent ? (
                            <span className="inline-flex items-center justify-center gap-1.5 min-w-[90px] text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sent ✓
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center justify-center gap-1.5 min-w-[90px] text-xs font-semibold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1.5 rounded-full">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </span>
                              <Link
                                href={`/admin/dashboard/design?eventId=${eventId}&attendee=${val.wallet_address}`}
                                className="inline-flex items-center text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-md"
                              >
                                Mint Now <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </Link>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
