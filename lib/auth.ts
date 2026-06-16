import connectDB from "./mongoose";
import SystemUser from "@/models/SystemUser";

export const SUPER_ADMINS = ["pratikmaru012210@gmail.com", "pratikmaru80762@gmail.com"];

export async function isAdmin(clerkUserId: string | null): Promise<boolean> {
  if (!clerkUserId) return false;

  await connectDB();
  const user = await SystemUser.findOne({ clerkUserId });

  if (!user) return false;

  // If user is explicitly in DB as admin, or they are a SUPER_ADMIN by email
  if (user.status === "admin") {
    return true;
  }

  if (SUPER_ADMINS.includes(user.email)) {
    return true;
  }

  return false;
}
