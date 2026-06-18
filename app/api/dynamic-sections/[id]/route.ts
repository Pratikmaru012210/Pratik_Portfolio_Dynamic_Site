import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import DynamicSection from "@/models/DynamicSection";
import { isAdmin } from "@/lib/auth";

// PUT /api/dynamic-sections/[id] - Update a dynamic section (Admin only)
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

    await connectDB();
    const body = await request.json();
    const { id } = await params;

    const section = await DynamicSection.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!section) {
      return NextResponse.json({ message: "Section not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Section updated successfully.",
      data: section,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update section.", error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/dynamic-sections/[id] - Delete a dynamic section (Admin only)
export async function DELETE(
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

    await connectDB();
    const { id } = await params;

    const section = await DynamicSection.findByIdAndDelete(id);

    if (!section) {
      return NextResponse.json({ message: "Section not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Section deleted successfully.",
      data: section,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to delete section.", error: error.message },
      { status: 400 }
    );
  }
}
