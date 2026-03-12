import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, wallets, tx_hash } = body;

    // Validate inputs
    if (!event_id || !wallets || !Array.isArray(wallets) || wallets.length === 0 || !tx_hash) {
      return NextResponse.json(
        { error: "Invalid payload. Required: event_id, wallets (array), tx_hash" },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await prisma.tb_event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Bulk create certificate records
    // We map each wallet to a new tb_sertifikat record
    const records = wallets.map((wallet: string, index: number) => ({
      event_id,
      wallet_address: wallet.trim().toLowerCase(),
      // Since tx_hash is @unique, if we minted in a batch (1 tx_hash for multiple certs),
      // we need a unique identifier. We append the index to the tx_hash for uniqueness in the DB.
      tx_hash: `${tx_hash}-${index}`, 
    }));

    const result = await prisma.tb_sertifikat.createMany({
      data: records,
      skipDuplicates: true, // Prevents crashing if a cert already exists
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} certificates recorded.`,
    });

  } catch (error) {
    console.error("Error creating certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
