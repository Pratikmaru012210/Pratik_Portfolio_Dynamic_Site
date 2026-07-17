import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import Cheatsheet from "@/models/Cheatsheet";
import { isAdmin } from "@/lib/auth";

const allowedFields = ["title", "pdfUrl", "pdfFileId"];

function validateCheatsheetData(body: Record<string, unknown>) {
  return Object.keys(body).every((field) => allowedFields.includes(field));
}

// PATCH /api/cheatsheets/[id] - Update a cheatsheet (Admin only)
export async function PATCH(
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
    if (!validateCheatsheetData(body)) {
      return NextResponse.json(
        { message: "Invalid Request. Validation failed" },
        { status: 400 }
      );
    }

    const updatedCheatsheet = await Cheatsheet.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCheatsheet) {
      return NextResponse.json(
        { message: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data updated successfully.",
      data: updatedCheatsheet,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update data.", error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/cheatsheets/[id] - Delete a cheatsheet (Admin only)
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

    const { id } = await params;
    await connectDB();
    const deletedCheatsheet = await Cheatsheet.findByIdAndDelete(id);

    if (!deletedCheatsheet) {
      return NextResponse.json(
        { message: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data deleted successfully.",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to delete data.", error: error.message },
      { status: 400 }
    );
  }
}
