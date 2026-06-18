import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import DynamicSection from "@/models/DynamicSection";
import { isAdmin } from "@/lib/auth";

// GET /api/dynamic-sections - Fetch all dynamic sections (Public)
export async function GET() {
  try {
    await connectDB();
    const sections = await DynamicSection.find({}).sort({ order: 1 });
    return NextResponse.json({
      message: "Data fetched successfully.",
      data: sections,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/dynamic-sections - Create a new dynamic section (Admin only)
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

    const section = new DynamicSection(body);
    await section.save();

    return NextResponse.json({
      message: "Section created successfully.",
      data: section,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create section.", error: error.message },
      { status: 400 }
    );
  }
}
