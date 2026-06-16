import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import SystemUser from "@/models/SystemUser";
import { isAdmin, SUPER_ADMINS } from "@/lib/auth";

export async function PUT(
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
    
    const user = await SystemUser.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.status = "admin";
    await user.save();

    return NextResponse.json({
      message: "User status updated to admin.",
      data: user,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to update user.", error: error.message },
      { status: 500 }
    );
  }
}

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

    const user = await SystemUser.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (SUPER_ADMINS.includes(user.email)) {
      return NextResponse.json(
        { message: "Cannot delete a super admin." },
        { status: 400 }
      );
    }

    await SystemUser.findByIdAndDelete(id);

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to delete user.", error: error.message },
      { status: 500 }
    );
  }
}
