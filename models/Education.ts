import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { schemaMessages } from "@/constants/schemaMessages";

const educationSchema = new Schema(
  {
    institute: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
      validate(value: unknown) {
        if (!validator.isDate(String(value))) {
          throw new Error(schemaMessages.INVALID_DATE);
        }
      },
    },
    endDate: {
      type: Date,
      validate(value: unknown) {
        if (value !== null && !validator.isDate(String(value))) {
          throw new Error(schemaMessages.INVALID_DATE);
        }
      },
    },
    learnings: {
      type: String,
      required: true,
      maxLength: 250,
      validate(value: string) {
        if (value.length > 250) {
          throw new Error(schemaMessages.MAX_LEN_250);
        }
      },
    },
    activities: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Education || mongoose.model("Education", educationSchema);
