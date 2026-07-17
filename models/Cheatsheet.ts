import mongoose, { Schema } from "mongoose";

const cheatsheetSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    pdfUrl: {
      type: String,
      required: true,
      trim: true,
    },
    pdfFileId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Cheatsheet || mongoose.model("Cheatsheet", cheatsheetSchema);
