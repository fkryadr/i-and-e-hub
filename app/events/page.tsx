import { prisma } from "@/lib/prisma";
import EventsPageClient from "./EventsPageClient";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  priceInPOL: string;
  totalQuota: number;
  availableQuota: number;
  bannerImage: string;
}

async function getAllEvents(): Promise<Event[]> {
  try {
    const events = await prisma.tb_event.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    // Transform data to match EventCard props
    return events.map((event) => {
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
        bannerImage: event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      };
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getAllEvents();

  return <EventsPageClient events={events} />;
}
