import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { schemaMessages } from "@/constants/schemaMessages";

const projectSchema = new Schema(
  {
    imageUrl: {
      type: String,
      validate(value: string) {
        if (value && !validator.isURL(value)) {
          throw new Error(schemaMessages.URL_INVALID);
        }
      },
    },
    projectName: {
      type: String,
      required: true,
      index: true,
      maxLength: 50,
      validate(value: string) {
        if (value.length > 50) {
          throw new Error(schemaMessages.MAX_LEN_50);
        }
      },
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
      validate(value: string) {
        if (value.length > 2000) {
          throw new Error(schemaMessages.MAX_LEN_2000);
        }
      },
    },
    problemSolve: {
      type: String,
      required: true,
      maxLength: 500,
      validate(value: string) {
        if (value.length > 500) {
          throw new Error(schemaMessages.MAX_LEN_500);
        }
      },
    },
    techStack: {
      type: [String],
      required: true,
    },
    gitHubLink: {
      type: String,
      validate(value: string) {
        if (value && !validator.isURL(value)) {
          throw new Error(schemaMessages.URL_INVALID);
        }
      },
    },
    liveLink: {
      type: String,
      validate(value: string) {
        if (value && !validator.isURL(value)) {
          throw new Error(schemaMessages.URL_INVALID);
        }
      },
    },
    imageFileId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ProjectDetails || mongoose.model("ProjectDetails", projectSchema);
