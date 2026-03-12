import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single event by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const event = await prisma.tb_event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Format event data
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    return NextResponse.json({
      event: {
        _id: event.id,
        title: event.title,
        description: event.description,
        date: dateStr,
        event_date: event.event_date.toISOString(),
        priceInPOL: event.price_pol.toString(),
        price_pol: event.price_pol,
        quota: event.quota,
        totalQuota: event.quota,
        availableQuota: event.quota,
        banner_url: event.banner_url,
        bannerImage: event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
        is_active: event.is_active,
        created_at: event.created_at,
      },
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update event
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin session
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      event_date,
      price_pol,
      quota,
      banner_url,
      is_active,
    } = body;

    // Check if event exists
    const existingEvent = await prisma.tb_event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Validate required fields (at least one field should be provided for update)
    if (!title && !description && !event_date && price_pol === undefined && !quota && banner_url === undefined && is_active === undefined) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (event_date !== undefined) {
      const eventDate = new Date(event_date);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid event_date format" },
          { status: 400 }
        );
      }
      updateData.event_date = eventDate;
    }

    if (price_pol !== undefined) {
      updateData.price_pol = parseFloat(price_pol);
    }

    if (quota !== undefined) {
      updateData.quota = parseInt(quota, 10);
    }

    if (banner_url !== undefined) {
      updateData.banner_url = banner_url.trim();
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    // Update event
    const updatedEvent = await prisma.tb_event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: {
        _id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.event_date,
        priceInPOL: updatedEvent.price_pol.toString(),
        totalQuota: updatedEvent.quota,
        availableQuota: updatedEvent.quota,
        bannerImage: updatedEvent.banner_url,
        is_active: updatedEvent.is_active,
      },
    });
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// PATCH - Same as PUT (for partial updates)
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  return PUT(request, context);
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin session
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if event exists
    const existingEvent = await prisma.tb_event.findUnique({
      where: { id },
      include: {
        ticketTransactions: true,
        certificates: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if there are related records (tickets or certificates)
    const hasTickets = existingEvent.ticketTransactions.length > 0;
    const hasCertificates = existingEvent.certificates.length > 0;

    if (hasTickets || hasCertificates) {
      // Soft delete: Set is_active to false instead of hard delete
      const softDeletedEvent = await prisma.tb_event.update({
        where: { id },
        data: { is_active: false },
      });

      return NextResponse.json({
        success: true,
        message: "Event deactivated successfully (soft delete)",
        note: "Event has related tickets/certificates, so it was deactivated instead of deleted",
        event: {
          _id: softDeletedEvent.id,
          title: softDeletedEvent.title,
          is_active: softDeletedEvent.is_active,
        },
      });
    }

    // Hard delete: No related records, safe to delete
    await prisma.tb_event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
      deletedId: id,
    });
  } catch (error: any) {
    console.error("Event delete error:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return NextResponse.json(
        { 
          error: "Cannot delete event due to existing references",
          note: "This event has related records. Please deactivate it instead.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
