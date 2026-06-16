import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { schemaMessages } from "@/constants/schemaMessages";

const userDetailsSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      maxLength: 100,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error(schemaMessages.EMAIL_INVALID);
        }
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      maxLength: 20,
    },
    profilePicUrl: {
      type: String,
      required: true,
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error(schemaMessages.URL_INVALID);
        }
      },
    },
    profilePicFileId: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    shortIntro: {
      type: String,
      required: true,
    },
    socialMediaLinks: {
      type: [
        {
          url: {
            type: String,
            required: true,
            validate(value: string) {
              if (!validator.isURL(value)) {
                throw new Error(schemaMessages.URL_INVALID);
              }
            },
          },
          icon: {
            type: String,
            required: true,
            trim: true,
          },
          iconFileId: {
            type: String,
          },
        },
      ],
      validate(links: unknown[]) {
        if (links.length > 10) {
          throw new Error(schemaMessages.SOCIAL_MEDIA_LINKS_LIMIT);
        }
      },
    },
    resumeUrl: {
      type: String,
      required: true,
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error(schemaMessages.URL_INVALID);
        }
      },
    },
    resumeFileId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwriting on hot reload in development
export default mongoose.models.UserDetails || mongoose.model("UserDetails", userDetailsSchema);
