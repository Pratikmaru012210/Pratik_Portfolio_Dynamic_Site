import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import About from "@/models/About";

// GET /api/about - Fetch all biography details (Public)
export async function GET() {
  try {
    await connectDB();
    const abouts = await About.find();
    return NextResponse.json({
      message: "Data fetched successfully.",
      abouts,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/about - Create biography details (Admin only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid Clerk session" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const newAbout = new About(body);
    await newAbout.save();

    return NextResponse.json(
      {
        message: "Data created successfully.",
        about: newAbout,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create data.", error: error.message },
      { status: 400 }
    );
  }
}
