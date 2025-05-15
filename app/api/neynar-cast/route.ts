import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { CastParamType } from "@neynar/nodejs-sdk/build/api";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) {
    return NextResponse.json(
      { error: "Missing hash parameter" },
      { status: 400 },
    );
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  // Debug: Check if API key exists and log its first few characters
  console.log("API Key exists:", !!apiKey);
  if (apiKey) {
    console.log("API Key starts with:", apiKey.substring(0, 8) + "...");
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Neynar API key" },
      { status: 500 },
    );
  }

  try {
    // Initialize Neynar client
    const config = new Configuration({
      apiKey: apiKey,
    });

    const client = new NeynarAPIClient(config);

    console.log("Attempting to fetch cast with hash:", hash);

    // Different strategies based on hash format
    // 1. Try direct hash approach first for all hash formats
    try {
      console.log("Trying direct hash approach first");
      const response = await client.lookupCastByHashOrWarpcastUrl({
        identifier: hash,
        type: CastParamType.Hash,
      });

      console.log("Successfully fetched cast using direct hash");
      return NextResponse.json(response);
    } catch (hashError) {
      console.error("Error with direct hash approach:", hashError);

      // 2. If that fails, try URL approach with various formats
      console.log("Falling back to URL approach");

      // Different URL formats to try
      const urlFormats = [
        `https://warpcast.com/~/cast/${hash}`, // Newer format
        `https://warpcast.com/~/${hash}`, // Older format
      ];

      // Try each URL format until one works
      for (const url of urlFormats) {
        try {
          console.log("Trying URL format:", url);
          const response = await client.lookupCastByHashOrWarpcastUrl({
            identifier: url,
            type: CastParamType.Url,
          });

          console.log("Successfully fetched cast using URL:", url);
          return NextResponse.json(response);
        } catch (urlError) {
          console.error(`Error with URL format ${url}:`, urlError);
          // Continue to next URL format
        }
      }

      // If all attempts fail, return the original error
      console.error("All fetch attempts failed");
      return NextResponse.json(
        {
          error:
            "Failed to fetch cast. The hash may be invalid or the cast may not exist.",
        },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error in Neynar API request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error fetching cast",
      },
      { status: 500 },
    );
  }
}
