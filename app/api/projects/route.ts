import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import ProjectDetails from "@/models/ProjectDetails";
import { isAdmin } from "@/lib/auth";

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

// GET /api/projects - Fetch all projects (Public)
export async function GET() {
  try {
    await connectDB();
    const projects = await ProjectDetails.find({});
    return NextResponse.json({
      message: "Data fetched successfully.",
      data: projects,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/projects - Create a new project (Admin only)
export async function POST(request: Request) {
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
    if (!validateProjectData(body)) {
      return NextResponse.json(
        { message: "Invalid Edit Requests. Validation failed" },
        { status: 400 }
      );
    }

    const project = new ProjectDetails(body);
    await project.save();

    return NextResponse.json({
      message: "Data created successfully.",
      data: project,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create data.", error: error.message },
      { status: 400 }
    );
  }
}
