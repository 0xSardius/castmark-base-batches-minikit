import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const collectionId = params.id;

    // Validate request
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 },
      );
    }

    // Get collection from database
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    // Get collection items
    const { data: collectionItems, error: itemsError } = await supabase
      .from("collection_items")
      .select("bookmark_id")
      .eq("collection_id", collectionId);

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to fetch collection items" },
        { status: 500 },
      );
    }

    // Get bookmarks for this collection
    const bookmarkIds = collectionItems.map((item) => item.bookmark_id);

    let bookmarks = [];
    if (bookmarkIds.length > 0) {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .in("id", bookmarkIds);

      if (!error && data) {
        bookmarks = data;
      }
    }

    // Build the frame metadata
    const hostUrl =
      process.env.NEXT_PUBLIC_URL || `https://${req.headers.get("host")}`;
    const collectionUrl = `${hostUrl}/collections/${collectionId}`;

    // Frame image URL - use static logo instead of dynamic image
    const imageUrl = collection.cover_image || `${hostUrl}/castmarklogo.png`;

    // Return HTML with frame metadata
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${collection.name} | Castmark Collection</title>
          <meta property="og:title" content="${collection.name} | Castmark Collection" />
          <meta property="og:description" content="${collection.description || `A collection of ${bookmarks.length} Farcaster casts`}" />
          <meta property="og:image" content="${imageUrl}" />
          
          <!-- Farcaster Frame Metadata -->
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
          <meta property="fc:frame:button:1" content="View Collection" />
          <meta property="fc:frame:button:1:action" content="post_redirect" />
          <meta property="fc:frame:button:2" content="Register on Base" />
          <meta property="fc:frame:button:2:action" content="tx" />
          <meta property="fc:frame:post_url" content="${hostUrl}/api/frames/collection/${collectionId}/action" />
        </head>
        <body>
          <h1>${collection.name}</h1>
          <p>${collection.description || `A collection of ${bookmarks.length} Farcaster casts`}</p>
          <p>This collection contains ${bookmarks.length} bookmarks.</p>
          <script>
            window.location.href = "${collectionUrl}";
          </script>
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
    console.error("Error in frames/collection/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
