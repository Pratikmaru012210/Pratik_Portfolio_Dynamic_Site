import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGE_KIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGE_KIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGE_KIT_URL_END_POINT || "",
    });

    const result = imagekit.getAuthenticationParameters();
    return NextResponse.json({
      ...result,
      publicKey: process.env.IMAGE_KIT_PUBLIC_KEY || "",
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate ImageKit auth parameters" },
      { status: 500 }
    );
  }
}
