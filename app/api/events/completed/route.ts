import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.tb_event.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        title: true,
        event_date: true,
      },
      orderBy: { event_date: "desc" },
    });

    const formattedEvents = events.map((event) => {
      const dateStr = new Date(event.event_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return {
        id: event.id,
        title: `${event.title} (${dateStr})`,
      };
    });

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Completed events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed events" },
      { status: 500 }
    );
  }
}
