import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import UserDetails from "@/models/UserDetails";

// GET /api/profile - Fetch profile details (Public)
export async function GET() {
  try {
    await connectDB();
    const details = await UserDetails.findOne();
    return NextResponse.json({
      message: "Data fetched successfully.",
      data: details,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch data.", error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/profile - Create initial profile details (Admin only)
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
    const count = await UserDetails.countDocuments();
    if (count >= 1) {
      return NextResponse.json(
        { message: "Only one profile allowed." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const userDetails = new UserDetails(body);
    await userDetails.save();

    return NextResponse.json({
      message: "Data created successfully.",
      data: userDetails,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to create data.", error: error.message },
      { status: 400 }
    );
  }
}

// PATCH /api/profile - Update existing profile details (Admin only)
export async function PATCH(request: Request) {
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
    const updatedProfile = await UserDetails.findOneAndUpdate({}, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { message: "No profile found to update." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${updatedProfile.firstName}'s, Profile is updated successfully!`,
      data: updatedProfile,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update data.", error: error.message },
      { status: 400 }
    );
  }
}
