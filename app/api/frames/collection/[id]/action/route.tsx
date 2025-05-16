import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const collectionId = params.id;
    const body = await req.json();
    const buttonIndex = body?.untrustedData?.buttonIndex || 1;

    // Validate the collection exists
    const { data: collection, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    // Build response based on button index
    const hostUrl =
      process.env.NEXT_PUBLIC_URL || `https://${req.headers.get("host")}`;
    const collectionUrl = `${hostUrl}/collections/${collectionId}`;
    const imageUrl = collection.cover_image || `${hostUrl}/castmarklogo.png`;

    // Button 1: View Collection (redirect)
    if (buttonIndex === 1) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${collection.name} | Castmark Collection</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
            <meta property="fc:frame:button:1" content="View in Castmark" />
            <meta property="fc:frame:button:1:action" content="post_redirect" />
            <meta property="fc:frame:post_url" content="${hostUrl}/api/frames/collection/${collectionId}/action" />

            <meta property="og:title" content="${collection.name} | Castmark Collection" />
            <meta property="og:description" content="Click to view this collection in Castmark" />
            <meta property="og:image" content="${imageUrl}" />
            <meta http-equiv="refresh" content="0;url=${collectionUrl}" />
          </head>
          <body>
            <p>Redirecting to Castmark...</p>
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
    }

    // Button 2: Register on Base (tx)
    if (buttonIndex === 2) {
      // Get contract address from env
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Error</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${imageUrl}" />
              <meta property="fc:frame:button:1" content="Try Again" />
              <meta property="fc:frame:post_url" content="${hostUrl}/api/frames/collection/${collectionId}/action" />
            </head>
            <body>
              <p>Contract address not configured</p>
            </body>
          </html>
        `,
          {
            headers: {
              "Content-Type": "text/html",
            },
          },
        );
      }

      // Return transaction request
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Register Collection on Base</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
            
            <meta property="fc:frame:button:1" content="Cancel" />
            <meta property="fc:frame:button:1:action" content="post" />
            
            <meta property="fc:frame:button:2" content="Register on Base" />
            <meta property="fc:frame:button:2:action" content="tx" />
            <meta property="fc:frame:button:2:target" content="${contractAddress}" />
            <meta property="fc:frame:button:2:post_url" content="${hostUrl}/api/frames/collection/${collectionId}/action" />
            
            <meta property="fc:frame:post_url" content="${hostUrl}/api/frames/collection/${collectionId}/action" />
            
            <!-- Transaction details -->
            <meta property="fc:frame:transaction" content="ethereum" />
            <meta property="fc:frame:transaction:contract_address" content="${contractAddress}" />
            <meta property="fc:frame:transaction:function" content="registerCollection" />
            <meta property="fc:frame:transaction:function_signature" content="function registerCollection(string,string,string)" />
            <meta property="fc:frame:transaction:function_args" content="['${collectionId}', '${collection.name}', '${collectionUrl}']" />
            <meta property="fc:frame:transaction:chain" content="base" />
          </head>
          <body>
            <p>Registering collection on Base...</p>
          </body>
        </html>
      `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }

    // Default response
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${collection.name} | Castmark Collection</title>
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
          <p>${collection.name}</p>
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
    console.error("Error in frames/collection/[id]/action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
