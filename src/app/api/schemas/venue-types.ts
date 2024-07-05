import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface VenueTypes extends Document {
    venueType: string;
}

// Define your schema
const venueTypesSchema = new Schema<VenueTypes>({
    venueType: { type: String, required: true, unique: true },
}, { timestamps: true });

// Define and export your model
const VenueTypes = mongoose.models.venueTypes || mongoose.model<VenueTypes>("venueTypes", venueTypesSchema);

export default VenueTypes;
