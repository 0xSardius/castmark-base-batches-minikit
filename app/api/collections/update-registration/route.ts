import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const { collectionId, isRegistered } = body;

    // Validate request
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 },
      );
    }

    // Update collection in database
    const { data, error } = await supabase
      .from("collections")
      .update({ is_registered: isRegistered || true })
      .eq("id", collectionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating collection:", error);
      return NextResponse.json(
        { error: "Failed to update collection" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Collection registration status updated",
      collection: data,
    });
  } catch (error) {
    console.error("Error in update-registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
