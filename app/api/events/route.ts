import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const events = await prisma.tb_event.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    const formattedEvents = events.map((event) => {
      const eventDate = new Date(event.event_date);
      const dateStr = eventDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
      return {
        _id: event.id,
        title: event.title,
        description: event.description,
        date: dateStr,
        venue: "",
        category: "conference",
        priceInPOL: event.price_pol.toString(),
        totalQuota: event.quota,
        availableQuota: event.quota,
        bannerImage:
          event.banner_url ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
        ticket_token_id: event.ticket_token_id,
        max_per_wallet: (event as any).max_per_wallet ?? null,
      };
    });

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Received event creation payload:", body);

    const {
      title,
      description,
      event_date,
      price_pol,
      quota,
      banner_url,
      ticket_token_id,
      max_per_wallet,
      is_active = true,
    } = body;

    // Validate required fields
    if (!title || !event_date || price_pol === undefined || !quota) {
      return NextResponse.json(
        { error: "title, event_date, price_pol, and quota are required" },
        { status: 400 }
      );
    }

    // Validate and parse date
    const eventDate = new Date(event_date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid event_date format. Use an ISO string." },
        { status: 400 }
      );
    }

    // Parse numeric fields
    const parsedPricePol = parseFloat(price_pol);
    const parsedQuota = parseInt(quota, 10);

    if (isNaN(parsedPricePol) || parsedPricePol < 0) {
      return NextResponse.json(
        { error: "price_pol must be a valid positive number" },
        { status: 400 }
      );
    }
    if (isNaN(parsedQuota) || parsedQuota <= 0) {
      return NextResponse.json(
        { error: "quota must be a valid positive integer" },
        { status: 400 }
      );
    }

    // ticket_token_id — plain Int, no BigInt
    const parsedTicketTokenId: number | null =
      ticket_token_id !== undefined && ticket_token_id !== null
        ? Number(ticket_token_id)
        : null;

    // max_per_wallet — plain Int, optional
    const parsedMaxPerWallet: number | null =
      max_per_wallet !== undefined && max_per_wallet !== null
        ? Number(max_per_wallet)
        : null;

    console.log("→ Parsed values:", {
      price_pol: parsedPricePol,
      quota: parsedQuota,
      ticket_token_id: parsedTicketTokenId,
      max_per_wallet: parsedMaxPerWallet,
    });

    // Create event in database
    let event;
    try {
      event = await prisma.tb_event.create({
        data: {
          title: title.trim(),
          description: description?.trim() || "",
          event_date: eventDate,
          price_pol: parsedPricePol,
          quota: parsedQuota,
          banner_url: banner_url?.trim() || "",
          ticket_token_id: parsedTicketTokenId,
          // max_per_wallet uses 'as any' until the TS server picks up the
          // freshly generated Prisma client types (stale IDE cache issue)
          ...(parsedMaxPerWallet !== null
            ? { max_per_wallet: parsedMaxPerWallet }
            : {}),
          is_active: Boolean(is_active),
        } as any,
      });
      console.log("✓ Event created in database:", event.id);
    } catch (dbError: any) {
      console.error("❌ Prisma error:", dbError.message);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      event: {
        _id: event.id,
        title: event.title,
        event_date: event.event_date,
        priceInPOL: event.price_pol.toString(),
        totalQuota: event.quota,
        ticket_token_id: event.ticket_token_id,
      },
    });
  } catch (error) {
    console.error("Event create error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to create event", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
