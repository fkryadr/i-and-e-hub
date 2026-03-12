import { NextRequest, NextResponse } from "next/server";
import { prepareTransaction, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { polygonAmoy } from "thirdweb/chains";
import { toWei } from "thirdweb/utils";
import { client } from "@/lib/thirdweb";

export async function POST(req: NextRequest) {
  try {
    const { targetAddress } = await req.json();

    if (!targetAddress) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet address." },
        { status: 400 }
      );
    }

    // Ensure the FAUCET_PRIVATE_KEY exists and starts with 0x
    let rawPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!rawPrivateKey) {
      console.error("FAUCET ERROR: FAUCET_PRIVATE_KEY is not defined in environment variables.");
      return NextResponse.json(
        { success: false, error: "Faucet is temporarily unavailable (Configuration error)." },
        { status: 500 }
      );
    }
    
    // thirdweb requires the private key to be strictly formatted as a hex string with a 0x prefix
    if (!rawPrivateKey.startsWith("0x")) {
      rawPrivateKey = `0x${rawPrivateKey}`;
    }

    // Initialize the Faucet Account
    const account = privateKeyToAccount({ 
      client, 
      privateKey: rawPrivateKey as `0x${string}` 
    });

    console.log(`Sending 0.5 POL to ${targetAddress}...`);

    // Prepare the transaction to send native POL
    const transaction = prepareTransaction({
      to: targetAddress,
      chain: polygonAmoy,
      client: client,
      value: toWei("0.5"), // Send exactly 0.5 POL
    });

    // Send the transaction using the faucet account
    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    });

    console.log("Transaction sent via thirdweb! Hash:", transactionHash);

    // Return the response immediately
    return NextResponse.json({
      success: true,
      message: "Successfully requested 0.5 POL!",
      txHash: transactionHash,
    });

  } catch (error: any) {
    console.error("FAUCET ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispense POL. Please try again later." },
      { status: 500 }
    );
  }
}
