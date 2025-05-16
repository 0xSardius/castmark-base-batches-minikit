// app/api/farcaster/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get base URL and ensure it doesn't have trailing slash to avoid double slashes
    const baseUrl = process.env.NEXT_PUBLIC_URL?.endsWith("/")
      ? process.env.NEXT_PUBLIC_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_URL;

    // Return frame and mini app metadata
    return NextResponse.json({
      // Standard Mini App metadata - this is what appears in the client's Mini Apps list
      miniApp: {
        version: "next",
        name: "Castmark",
        description:
          "Bookmark, tag, and organize your favorite Farcaster casts",
        homeUrl: process.env.NEXT_PUBLIC_URL,
        iconUrl: process.env.NEXT_PUBLIC_ICON_URL || `${baseUrl}/og.png`,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${baseUrl}/og.png`,
        // Register cast actions - this is what makes Castmark appear in the cast actions menu
        castAction: {
          title: "Add to Castmark",
          // When the user selects "Add to Castmark" from a cast, they'll be redirected to
          // the save endpoint with the cast's hash as a parameter
          url: `${baseUrl}/quick-save?cast={cast_hash}`,
        },
        buttonTitle: `Launch Castmark`,
        splashImageUrl:
          process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || `${baseUrl}/og.png`,
        splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "ffffff"}`,
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

    // Extract cast hash from body
    const castHash = body.castHash || "";

    // Redirect to quick-save page with the cast hash
    const quickSavePage = new URL("/quick-save", req.url);

    // Add cast hash as a query parameter if present
    if (castHash) {
      quickSavePage.searchParams.set("cast", castHash);
    }

    return NextResponse.redirect(quickSavePage);
  } catch (error) {
    console.error("Frame processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
