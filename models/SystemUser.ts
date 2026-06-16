import mongoose, { Schema } from "mongoose";

const systemUserSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "admin"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SystemUser || mongoose.model("SystemUser", systemUserSchema);
