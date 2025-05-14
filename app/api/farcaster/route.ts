// app/api/frame/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Return frame metadata
    return NextResponse.json({
      frame: {
        version: "next",
        name: "Castmark",
        description:
          "Bookmark, tag, and organize your favorite Farcaster casts",
        homeUrl: process.env.NEXT_PUBLIC_URL,
        iconUrl:
          process.env.NEXT_PUBLIC_ICON_URL ||
          `${process.env.NEXT_PUBLIC_URL}/og.png`,
        imageUrl:
          process.env.NEXT_PUBLIC_IMAGE_URL ||
          `${process.env.NEXT_PUBLIC_URL}/og.png`,
        buttonTitle: `Launch Castmark`,
        splashImageUrl:
          process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL ||
          `${process.env.NEXT_PUBLIC_URL}/og.png`,
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

    // Extract basic cast data
    const castData = {
      castText: body.inputText || "",
      castUrl: body.url || "",
      authorFid: body.requesterFid,
    };

    // Redirect to save page with cast data
    const response = NextResponse.redirect(new URL("/save", req.url));

    // Store cast data in cookies
    response.cookies.set("castData", JSON.stringify(castData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error("Frame processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
