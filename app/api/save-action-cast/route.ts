import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();

    // Extract hash from various possible sources
    const castHash =
      body.cast_id?.hash ||
      body.untrustedData?.castId?.hash ||
      body.castHash ||
      body.hash ||
      "";

    if (!castHash) {
      return NextResponse.json(
        {
          error: "No cast hash provided",
        },
        {
          status: 400,
        },
      );
    }

    // Get the user ID from the request (would come from authentication)
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    // Fetch cast data from Neynar
    const neynarResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/neynar-cast?hash=${castHash}`,
    );
    if (!neynarResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch cast data",
        },
        {
          status: 500,
        },
      );
    }

    const castData = await neynarResponse.json();
    const cast = castData.cast || castData.result?.cast || null;

    if (!cast) {
      return NextResponse.json(
        {
          error: "Invalid cast data returned from Neynar",
        },
        {
          status: 500,
        },
      );
    }

    // Save the bookmark in the database
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        cast_hash: castHash,
        cast_author_fid: cast.author?.fid || 0,
        cast_text: cast.text || "Cast content",
        cast_url: cast.url || `https://warpcast.com/~/cast/${castHash}`,
        is_public: true,
        note: "",
        tags: [],
      })
      .select();

    if (error) {
      console.error("Error saving bookmark:", error);
      return NextResponse.json(
        {
          error: "Failed to save bookmark",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cast saved to Castmark!",
      bookmark: data[0],
    });
  } catch (error) {
    console.error("Error in save-action-cast:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
