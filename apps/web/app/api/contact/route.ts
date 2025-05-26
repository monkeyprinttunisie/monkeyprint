import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@monkeyprint/utils/email";

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    const {
      recipient,
      name,
      email,
      subject,
      message,
      imageUrl,
      storeName,
      storeId,
    } = formData;

    if (!recipient || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const result = await sendContactFormEmail({
      recipient,
      name,
      email,
      subject,
      message,
      imageUrl,
      storeName,
      storeId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Error in contact API route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
