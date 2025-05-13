// app/api/frame/route.ts
import { NextRequest, NextResponse } from "next/server";

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
