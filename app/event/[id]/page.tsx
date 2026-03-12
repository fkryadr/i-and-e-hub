import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventDetailClient from "./EventDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEventById(id: string) {
  try {
    const event = await prisma.tb_event.findUnique({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!event) {
      return null;
    }

    // Transform data to match component props
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
      id: event.id,
      title: event.title,
      description: event.description,
      longDescription: event.description,
      date: dateStr,
      venue: "Virtual Event",
      category: "Conference",
      priceInPOL: event.price_pol.toString(),
      price_pol: event.price_pol,
      ticket_token_id: (event as any).ticket_token_id ?? 0,
      max_per_wallet: (event as any).max_per_wallet ?? null,
      totalQuota: event.quota,
      availableQuota: event.quota,
      bannerImage: event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      organizer: "I&E Hub Team",
      features: [
        "NFT Ticket Access",
        "NFT Certificate After Event",
        "Exclusive Content",
        "Networking Opportunities",
        "Live Q&A Sessions",
        "Event Recordings",
      ],
    };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
