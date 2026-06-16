import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import ServicesDetails from "@/models/ServiceDetails";

// PATCH /api/services/[id] - Update a service (Admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid Clerk session" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const serviceUpdate = await ServicesDetails.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!serviceUpdate) {
      return NextResponse.json(
        { message: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data updated successfully.",
      data: serviceUpdate,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update data.", error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/services/[id] - Delete a service (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid Clerk session" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const deletedService = await ServicesDetails.findByIdAndDelete(id);

    if (!deletedService) {
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
