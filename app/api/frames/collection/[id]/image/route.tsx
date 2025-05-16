import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const collectionId = params.id;

    // Get collection from database
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collection) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 128,
              color: "black",
              background: "#f6f6f6",
              width: "100%",
              height: "100%",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Collection Not Found
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }

    // Get collection items
    const { data: collectionItems, error: itemsError } = await supabase
      .from("collection_items")
      .select("bookmark_id")
      .eq("collection_id", collectionId);

    if (itemsError) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 128,
              color: "black",
              background: "#f6f6f6",
              width: "100%",
              height: "100%",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Error Loading Collection
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }

    // Get bookmark count
    const bookmarkCount = collectionItems?.length || 0;

    // Create image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#800080", // Purple background
            fontFamily: "sans-serif",
            padding: 80,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.1,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                style={{
                  fontSize: 40,
                  margin: "0 20px",
                  transform: `rotate(${Math.random() * 40 - 20}deg)`,
                }}
              >
                📚
              </div>
            ))}
          </div>

          {/* Border */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              border: "10px solid black",
              borderRadius: 20,
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                opacity: 0.8,
                marginBottom: 20,
                background: "black",
                padding: "10px 30px",
                borderRadius: 20,
              }}
            >
              Castmark Collection
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: "bold",
                marginBottom: 40,
                maxWidth: 1000,
                wordBreak: "break-word",
              }}
            >
              {collection.name}
            </div>
            <div
              style={{
                fontSize: 40,
                maxWidth: 800,
                marginBottom: 40,
                opacity: 0.9,
              }}
            >
              {collection.description ||
                `A curated collection of Farcaster content`}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                background: "rgba(0,0,0,0.2)",
                padding: "15px 40px",
                borderRadius: 16,
              }}
            >
              <span style={{ marginRight: 15 }}>📌</span> {bookmarkCount}{" "}
              bookmark{bookmarkCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 28,
              opacity: 0.7,
            }}
          >
            Powered by Castmark on Base
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error in frames/collection/[id]/image:", error);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 128,
            color: "black",
            background: "#f6f6f6",
            width: "100%",
            height: "100%",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Error
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
