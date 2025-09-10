import mongoose from "mongoose";

const venueTypesSchema = new mongoose.Schema({
    venueType: { type: String, required: true, unique:true},
}, { timestamps: true });

const venueTypes = mongoose.model("venueTypes", venueTypesSchema);

export default venueTypes;