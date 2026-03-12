import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.tb_event.findUnique({
      where: { id },
      select: { title: true, id: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch all ticket transactions for this event
    const transactions = await prisma.tb_transaksi_tiket.findMany({
      where: { event_id: id },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            wallet_address: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Fetch all already-minted certificates for this event
    const certificates = await prisma.tb_sertifikat.findMany({
      where: { event_id: id },
      select: { wallet_address: true, tx_hash: true },
    });

    // Create a Set of wallet addresses that already received a certificate
    const certifiedWallets = new Set(certificates.map((c) => c.wallet_address.toLowerCase()));

    // Map the attendees to include their status
    const attendees = transactions.map((t) => {
      const wallet = t.user?.wallet_address || t.wallet_address;
      return {
        wallet_address: wallet,
        full_name: t.user?.full_name || "Unknown",
        email: t.user?.email || "No Email",
        ticket_bought_at: t.created_at,
        is_certificate_sent: certifiedWallets.has(wallet.toLowerCase()),
      };
    });

    // Deduplicate (in case a user bought >1 tickets, they only get 1 certificate)
    const uniqueAttendees = Array.from(
      new Map(attendees.map((a) => [a.wallet_address.toLowerCase(), a])).values()
    );

    return NextResponse.json({
      success: true,
      event,
      attendees: uniqueAttendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees", details: String(error) },
      { status: 500 }
    );
  }
}
