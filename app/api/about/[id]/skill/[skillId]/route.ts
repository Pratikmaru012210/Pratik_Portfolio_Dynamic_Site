import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import About from "@/models/About";

// DELETE /api/about/[id]/skill/[skillId] - Remove a skill (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { message: "Forbidden: You are not authorized to perform this action" },
        { status: 403 }
      );
    }

    const { id, skillId } = await params;
    await connectDB();
    const updatedAbout = await About.findByIdAndUpdate(
      id,
      {
        $pull: { skills: { _id: skillId } },
      },
      { new: true }
    );

    if (!updatedAbout) {
      return NextResponse.json(
        { message: "About document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data deleted successfully.",
      updatedAbout,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to delete skill", error: error.message },
      { status: 500 }
    );
  }
}
