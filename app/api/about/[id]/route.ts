import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import About from "@/models/About";

// PUT /api/about/[id] - Update biography details (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { message: "Forbidden: You are not authorized to perform this action" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const updatedAbout = await About.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAbout) {
      return NextResponse.json(
        { message: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data updated successfully.",
      about: updatedAbout,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update data.", error: error.message },
      { status: 400 }
    );
  }
}
