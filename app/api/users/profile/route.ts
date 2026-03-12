import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, full_name, email } = body;

    if (!wallet_address || !full_name || !email) {
      return NextResponse.json(
        { error: "wallet_address, full_name, and email are required" },
        { status: 400 }
      );
    }

    const trimmedWallet = wallet_address.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = full_name.trim();

    if (!trimmedWallet || !trimmedName || !trimmedEmail) {
      return NextResponse.json(
        { error: "All fields must be non-empty" },
        { status: 400 }
      );
    }

    const user = await prisma.tb_user.upsert({
      where: { wallet_address: trimmedWallet },
      update: {
        full_name: trimmedName,
        email: trimmedEmail,
      },
      create: {
        wallet_address: trimmedWallet,
        full_name: trimmedName,
        email: trimmedEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
      user: {
        wallet_address: user.wallet_address,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile save error:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already registered to another wallet" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
