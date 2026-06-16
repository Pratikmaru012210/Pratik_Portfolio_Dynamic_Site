import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import ServiceDetails from "@/models/ServiceDetails";
import { isAdmin } from "@/lib/auth";

// GET /api/services - Fetch all services (Public)
export async function GET() {
  try {
    await connectDB();
    const services = await ServiceDetails.find({});
    return NextResponse.json({
      message: "Data fetched successfully.",
      data: services,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/services - Create a new service (Admin only)
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
    const service = new ServicesDetails(body);
    await service.save();

    return NextResponse.json({
      message: "Data created successfully.",
      data: service,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create data.", error: error.message },
      { status: 400 }
    );
  }
}
