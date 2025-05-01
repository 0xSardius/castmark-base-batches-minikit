import { NextRequest, NextResponse } from "next/server";
import {
  Message,
  MessageData,
  MessageType,
  FarcasterNetwork,
} from "@farcaster/hub-nodejs";

// This is a placeholder for now - in a full implementation,
// you would verify the Farcaster signature here
export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    // Decode the message bytes into a Message object
    const frameMessage = Message.decode(Buffer.from(message, "hex"));

    // Extract the signature components
    const messageSignature = Buffer.from(signature).toString("hex");

    // Create the message data object
    const messageData: MessageData = {
      type: frameMessage.data?.type as MessageType,
      fid: frameMessage.data?.fid as number,
      timestamp: frameMessage.data?.timestamp as number,
      network: frameMessage.data?.network as FarcasterNetwork,
      frameActionBody: frameMessage.data?.frameActionBody,
    };

    // Encode the message data
    const messageEncoded = MessageData.encode(messageData).finish();

    // Verify the signature using the hub's validation endpoint
    const hubResponse = await fetch(
      "https://hub.farcaster.xyz/v1/validateMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: messageEncoded,
      },
    );

    const validationResult = await hubResponse.json();

    if (!validationResult.valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      fid: messageData.fid,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
