import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import ProjectDetails from "@/models/ProjectDetails";

const allowedFields = [
  "imageUrl",
  "projectName",
  "description",
  "problemSolve",
  "techStack",
  "gitHubLink",
  "liveLink",
  "imageFileId",
];

function validateProjectData(body: Record<string, unknown>) {
  return Object.keys(body).every((field) => allowedFields.includes(field));
}

// PATCH /api/projects/[id] - Update a project (Admin only)
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
    if (!validateProjectData(body)) {
      return NextResponse.json(
        { message: "Invalid Edit Requests. Validation failed" },
        { status: 400 }
      );
    }

    const projectUpdate = await ProjectDetails.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!projectUpdate) {
      return NextResponse.json(
        { message: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data updated successfully.",
      data: projectUpdate,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update data.", error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project (Admin only)
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
    const deletedProject = await ProjectDetails.findByIdAndDelete(id);

    if (!deletedProject) {
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
