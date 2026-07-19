import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import Cheatsheet from "@/models/Cheatsheet";
import { isAdmin } from "@/lib/auth";

const allowedFields = ["title", "pdfUrl", "pdfFileId", "logoUrl", "logoFileId"];

function validateCheatsheetData(body: Record<string, unknown>) {
  return Object.keys(body).every((field) => allowedFields.includes(field));
}

// GET /api/cheatsheets - Fetch all cheatsheets (Public)
export async function GET() {
  try {
    await connectDB();
    const cheatsheets = await Cheatsheet.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      message: "Data fetched successfully.",
      data: cheatsheets,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/cheatsheets - Create a new cheatsheet (Admin only)
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
    if (!validateCheatsheetData(body)) {
      return NextResponse.json(
        { message: "Invalid Request. Validation failed" },
        { status: 400 }
      );
    }

    if (!body.title || !body.pdfUrl || !body.pdfFileId) {
      return NextResponse.json(
        { message: "Title, PDF URL, and PDF File ID are required" },
        { status: 400 }
      );
    }

    const cheatsheet = new Cheatsheet(body);
    await cheatsheet.save();

    return NextResponse.json({
      message: "Data created successfully.",
      data: cheatsheet,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create data.", error: error.message },
      { status: 400 }
    );
  }
}
