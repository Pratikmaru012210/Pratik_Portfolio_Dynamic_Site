import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { schemaMessages } from "@/constants/schemaMessages";

const dynamicRecordSchema = new Schema({
  imageUrl: {
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
  heading: {
    type: String,
    required: true,
    maxLength: 50,
    validate(value: string) {
      if (value.length > 50) {
        throw new Error(schemaMessages.MAX_LEN_50);
      }
    },
  },
  description: {
    type: String,
    maxLength: 2000,
    validate(value: string) {
      if (value && value.length > 2000) {
        throw new Error(schemaMessages.MAX_LEN_2000);
      }
    },
  },
  link: {
    type: String,
    validate(value: string) {
      if (value && !validator.isURL(value)) {
        throw new Error(schemaMessages.URL_INVALID);
      }
    },
  },
  tags: {
    type: [String],
    default: [],
  },
});

const dynamicSectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
      validate(value: string) {
        if (value.length > 50) {
          throw new Error(schemaMessages.MAX_LEN_50);
        }
      },
    },
    description: {
      type: String,
      maxLength: 250,
      validate(value: string) {
        if (value && value.length > 250) {
          throw new Error(schemaMessages.MAX_LEN_250);
        }
      },
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    records: {
      type: [dynamicRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DynamicSection || mongoose.model("DynamicSection", dynamicSectionSchema);
