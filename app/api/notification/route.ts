import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // This endpoint will proxy notification requests to the appropriate service
    // For example, using the Warpcast notification API with the token from the frame

    const { url, token, notification } = body;

    if (!url || !token || !notification) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Forward the notification to the appropriate service
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: notification.id || Date.now().toString(),
        title: notification.title,
        body: notification.body,
        targetUrl:
          notification.targetUrl || `${process.env.NEXT_PUBLIC_URL}/bookmarks`,
        tokens: [token],
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
