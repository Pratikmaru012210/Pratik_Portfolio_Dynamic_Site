import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import SystemUser from "@/models/SystemUser";
import { isAdmin, SUPER_ADMINS } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { message: "Forbidden: You are not authorized to perform this action" },
        { status: 403 }
      );
    }

    await connectDB();
    const users = await SystemUser.find({}).sort({ createdAt: -1 });

    const usersWithFlags = users.map((u) => {
      const obj = u.toObject();
      return {
        ...obj,
        isSuperAdmin: SUPER_ADMINS.includes(obj.email),
      };
    });

    return NextResponse.json({
      message: "Users fetched successfully.",
      data: usersWithFlags,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to fetch users.", error: error.message },
      { status: 500 }
    );
  }
}
