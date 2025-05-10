import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface FrameActionPayload {
  untrustedData: {
    fid: number;
    username: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body as FrameActionPayload;

    // Create session
    const session = {
      fid: payload.untrustedData.fid,
      username: payload.untrustedData.username,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Set session cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({
      success: true,
      fid: session.fid,
      username: session.username,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
