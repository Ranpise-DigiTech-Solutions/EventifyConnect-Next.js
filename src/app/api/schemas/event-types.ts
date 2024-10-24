import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface EventTypes extends Document {
    eventName: string;
    _id: string;
}

// Define your schema
const eventTypesSchema = new Schema<EventTypes>({
    eventName: { type: String, required: true, unique: true },
}, { timestamps: true });

// Define and export your model
const EventTypes = mongoose.models.eventTypes || mongoose.model<EventTypes>("eventTypes", eventTypesSchema);

export default EventTypes;
