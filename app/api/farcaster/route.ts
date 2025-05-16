// app/api/farcaster/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get base URL and ensure it doesn't have trailing slash to avoid double slashes
    const baseUrl = process.env.NEXT_PUBLIC_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_URL;

    // Return action definition according to the Farcaster Actions v2 spec
    return NextResponse.json({
      name: "Add to Castmark",
      icon: "bookmark",
      description: "Bookmark, tag, and organize your favorite Farcaster casts",
      aboutUrl: baseUrl,
      action: {
        type: "post",
      },
    });
  } catch (error) {
    console.error("Frame metadata error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract cast hash from the request body using the formats specified in Farcaster Actions spec
    // frame_url is from the Frames spec
    // cast_id is from the Cast Actions spec
    // untrustedData.castId comes from Frames v1 (fallback)
    const castHash =
      body.cast_id?.hash ||
      body.untrustedData?.castId?.hash ||
      body.castHash ||
      "";

    if (!castHash) {
      // Return message as per spec for action responses
      return NextResponse.json(
        {
          message: "No cast found",
        },
        {
          status: 400,
        },
      );
    }

    console.log("Cast action triggered with hash:", castHash);

    // According to the Cast Actions spec, we need to return a message
    // rather than a redirect
    return NextResponse.json({
      message: "Cast saved to Castmark!",
    });
  } catch (error) {
    console.error("Cast action processing error:", error);
    return NextResponse.json(
      {
        message: "Failed to save cast",
      },
      {
        status: 400,
      },
    );
  }
}
