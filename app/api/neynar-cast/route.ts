import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) {
    return NextResponse.json(
      { error: "Missing hash parameter" },
      { status: 400 },
    );
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Neynar API key" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${hash}&identifier_type=hash`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.message || "Failed to fetch cast" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error fetching cast",
      },
      { status: 500 },
    );
  }
}
