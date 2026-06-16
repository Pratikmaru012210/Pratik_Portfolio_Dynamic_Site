import mongoose, { Schema } from "mongoose";

const servicesSchema = new Schema({
  service: {
    type: String,
    required: true,
    trim: true,
    index: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 5000,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
  },
  iconFileId: {
    type: String,
    required: true,
  },
});

export default mongoose.models.ServicesDetails || mongoose.model("ServicesDetails", servicesSchema);
