import mongoose from "mongoose";

const eventTypesSchema = new mongoose.Schema({
    eventName: { type: String, required: true, unique:true},
}, { timestamps: true });

const eventTypes = mongoose.model("eventTypes", eventTypesSchema);

export default eventTypes;