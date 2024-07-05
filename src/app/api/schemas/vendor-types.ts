import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface VendorTypes extends Document {
    vendorType: string;
    vendorTypeDesc: string;
}

// Define your schema
const vendorTypesSchema = new Schema<VendorTypes>({
    vendorType: { type: String, required: true, unique: true },
    vendorTypeDesc: { type: String, required: true },
}, { timestamps: true });

// Define and export your model
const VendorTypes = mongoose.models.vendorTypes || mongoose.model<VendorTypes>("vendorTypes", vendorTypesSchema);

export default VendorTypes;
