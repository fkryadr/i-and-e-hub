import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, wallet_address, amount_pol, tx_hash } = body;

    // Validation
    if (!event_id || !wallet_address || amount_pol === undefined || !tx_hash) {
      return NextResponse.json(
        { error: "event_id, wallet_address, amount_pol, and tx_hash are required" },
        { status: 400 }
      );
    }

    // Check if transaction already exists (prevent duplicates)
    const existingTransaction = await prisma.tb_transaksi_tiket.findUnique({
      where: { tx_hash: tx_hash.trim() },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Transaction already recorded" },
        { status: 409 }
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

    // Create transaction record
    const transaction = await prisma.tb_transaksi_tiket.create({
      data: {
        event_id: event_id.trim(),
        wallet_address: wallet_address.trim().toLowerCase(),
        amount_pol: parseFloat(amount_pol),
        tx_hash: tx_hash.trim(),
      },
    });

    // Atomic quota decrement
    await prisma.tb_event.update({
      where: { id: event_id },
      data: {
        quota: { decrement: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction recorded successfully",
      transaction: {
        id: transaction.id,
        event_id: transaction.event_id,
        wallet_address: transaction.wallet_address,
        amount_pol: transaction.amount_pol,
        tx_hash: transaction.tx_hash,
        created_at: transaction.created_at,
      },
    });
  } catch (error: any) {
    console.error("Transaction save error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Transaction hash already exists" },
        { status: 409 }
      );
    }

    // Handle foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid event_id or wallet_address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save transaction" },
      { status: 500 }
    );
  }
}

// GET - Fetch transactions (optional, for admin or user history)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get("wallet_address");
    const event_id = searchParams.get("event_id");

    let whereClause: any = {};

    if (wallet_address) {
      whereClause.wallet_address = wallet_address.toLowerCase();
    }

    if (event_id) {
      whereClause.event_id = event_id;
    }

    const transactions = await prisma.tb_transaksi_tiket.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            event_date: true,
            price_pol: true,
          },
        },
        user: {
          select: {
            wallet_address: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        event: {
          id: tx.event.id,
          title: tx.event.title,
          event_date: tx.event.event_date,
          price_pol: tx.event.price_pol,
        },
        user: tx.user,
        amount_pol: tx.amount_pol,
        tx_hash: tx.tx_hash,
        created_at: tx.created_at,
      })),
    });
  } catch (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
