import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongoose";
import SystemUser from "@/models/SystemUser";
import { SUPER_ADMINS } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid Clerk session" },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { message: "Unauthorized: No email found for user" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await SystemUser.findOne({ clerkUserId: userId });

    if (!user) {
      // Determine if they should be admin automatically
      const isSuperAdmin = SUPER_ADMINS.includes(email);
      const initialStatus = isSuperAdmin ? "admin" : "pending";

      user = new SystemUser({
        clerkUserId: userId,
        email: email,
        status: initialStatus,
      });
      await user.save();
    } else if (SUPER_ADMINS.includes(email) && user.status !== "admin") {
      // Ensure super admins are always admins
      user.status = "admin";
      await user.save();
    }

    return NextResponse.json({
      message: "User checked successfully",
      status: user.status,
      email: user.email,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { message: "Failed to sync user", error: error.message },
      { status: 500 }
    );
  }
}
