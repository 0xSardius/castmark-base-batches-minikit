import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const hostUrl =
      process.env.NEXT_PUBLIC_URL || `https://${req.headers.get("host")}`;
    const imageUrl = `${hostUrl}/castmarklogo.png`;

    // Return a simple test frame
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Castmark Frame Test</title>
          <meta property="og:title" content="Castmark Frame Test" />
          <meta property="og:description" content="Testing Castmark Farcaster Frame Image" />
          <meta property="og:image" content="${imageUrl}" />
          
          <!-- Farcaster Frame Metadata -->
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
          <meta property="fc:frame:button:1" content="Test Button" />
          <meta property="fc:frame:post_url" content="${hostUrl}/api/frames/test/action" />
        </head>
        <body>
          <h1>Castmark Frame Test</h1>
          <p>This is a test page to verify that the Castmark logo is displaying correctly in Farcaster frames.</p>
          <img src="${imageUrl}" alt="Castmark Logo" style="max-width: 100%; height: auto;" />
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  } catch (error) {
    console.error("Error in frames test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
