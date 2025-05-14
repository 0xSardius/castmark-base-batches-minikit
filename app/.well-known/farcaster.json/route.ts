export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  // Validate required environment variables
  if (!URL) {
    return new Response("NEXT_PUBLIC_URL is not configured", { status: 500 });
  }

  if (
    !process.env.FARCASTER_HEADER ||
    !process.env.FARCASTER_PAYLOAD ||
    !process.env.FARCASTER_SIGNATURE
  ) {
    return new Response("Farcaster manifest credentials are not configured", {
      status: 500,
    });
  }

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      version: "next",
      name: "Castmark",
      description: "Bookmark, tag, and organize your favorite Farcaster casts",
      homeUrl: URL,
      iconUrl: process.env.NEXT_PUBLIC_ICON_URL || `${URL}/og.png`,
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${URL}/og.png`,
      buttonTitle: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Castmark"}`,
      splashImageUrl:
        process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || `${URL}/og.png`,
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "ffffff"}`,
      webhookUrl: `${URL}/api/webhook`,
    },
    triggers: [
      {
        type: "cast",
        id: "save-cast",
        url: `${URL}/save`,
        name: "Save to Castmark",
      },
    ],
  });
}
