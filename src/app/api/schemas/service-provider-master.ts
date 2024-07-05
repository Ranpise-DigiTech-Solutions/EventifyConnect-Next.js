import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface ServiceProviderMaster extends Document {
    vendorName: string;
    vendorTypeId: mongoose.Schema.Types.ObjectId;
    vendorCurrentLocation?: string;
    vendorContact: string;
    vendorEmail: string;
    vendorPassword: string;
    vendorUid: string; // firebase id
    vendorCompanyName: string;
    vendorLocation: string;
    eventTypes: mongoose.Schema.Types.ObjectId[];
    vendorGender?: string;
    vendorAlternateMobileNo?: string;
    vendorAlternateEmail?: string;
    vendorAddress?: string;
    vendorLandmark?: string;
    vendorCity?: string;
    vendorTaluk?: string;
    vendorState?: string;
    vendorCountry?: string;
    vendorPincode?: number;
    vendorProfileImage?: string;
    programId: string;
}

// Define your schema
const serviceProviderMasterSchema = new Schema<ServiceProviderMaster>({
    vendorName: { type: String, required: true },
    vendorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    vendorCurrentLocation: { type: String },
    vendorContact: { type: String, required: true, unique: true },
    vendorEmail: { type: String, required: true },
    vendorPassword: { type: String, required: true },
    vendorUid: { type: String, required: true, unique: true }, // firebase id
    vendorCompanyName: { type: String, required: true },
    vendorLocation: { type: String, required: true },
    eventTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true }],
    vendorGender: { type: String },
    vendorAlternateMobileNo: { type: String },
    vendorAlternateEmail: { type: String },
    vendorAddress: { type: String },
    vendorLandmark: { type: String },
    vendorCity: { type: String },
    vendorTaluk: { type: String },
    vendorState: { type: String },
    vendorCountry: { type: String },
    vendorPincode: { type: Number },
    vendorProfileImage: { type: String },
    programId: { type: String, required: true },
}, { timestamps: true });

// Define and export your model
const ServiceProviderMaster = mongoose.models.serviceProviderMaster || mongoose.model<ServiceProviderMaster>("serviceProviderMaster", serviceProviderMasterSchema);

export default ServiceProviderMaster;
