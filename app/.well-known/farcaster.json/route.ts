export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

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
      buttonTitle: `Launch Castmark`,
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
