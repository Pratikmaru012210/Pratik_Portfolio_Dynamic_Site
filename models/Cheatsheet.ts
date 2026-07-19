import mongoose, { Schema } from "mongoose";

if (mongoose.models && mongoose.models.Cheatsheet) {
  delete mongoose.models.Cheatsheet;
}

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
    logoUrl: {
      type: String,
      trim: true,
    },
    logoFileId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Cheatsheet || mongoose.model("Cheatsheet", cheatsheetSchema);
