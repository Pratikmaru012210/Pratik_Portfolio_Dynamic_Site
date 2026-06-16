import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { schemaMessages } from "@/constants/schemaMessages";

const experienceSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
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
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
