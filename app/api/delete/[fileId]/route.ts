import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGE_KIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGE_KIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGE_KIT_URL_END_POINT || "",
    });

    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ImageKit delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file from ImageKit" },
      { status: 500 }
    );
  }
}
