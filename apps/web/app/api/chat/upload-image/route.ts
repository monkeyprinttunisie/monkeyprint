import { NextRequest, NextResponse } from "next/server";
import { uploadImageForIssue } from "@/actions/chatbotActions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "No image URL provided" },
        { status: 400 }
      );
    }

    const result = await uploadImageForIssue(imageUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in upload-image API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing image upload",
      },
      { status: 500 }
    );
  }
}
