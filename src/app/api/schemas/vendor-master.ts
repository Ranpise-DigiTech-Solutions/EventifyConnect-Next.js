import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface VendorMaster extends Document {
    companyName: string;
    companyAddress: string;
    companyCity: string;
    companyPincode: number;
    companyState: string;
    companyTaluk: string;
    companyCountry: string;
    companyLandmark: string;
    vendorRegisterNo?: string;
    vendorRegisterDate?: Date;
    vendorRegisterDocument?: string;
    vendorMainContactName: string;
    vendorMainDesignation?: string;
    vendorMainOfficeNo: string;
    vendorMainMobileNo: string;
    vendorMainEmail: string;
    vendorAlternateContactName?: string;
    vendorAlternateDesignation?: string;
    vendorAlternateOfficeNo?: string;
    vendorAlternateMobileNo?: string;
    vendorAlternateEmail?: string;
    vendorTypeId: mongoose.Schema.Types.ObjectId;
    vendorDescription: string;
    vendorEventTypes: mongoose.Schema.Types.ObjectId[];
    vendorImages: string[];
    programId: string;
    vendorUserId: mongoose.Schema.Types.ObjectId;
}

// Define your schema
const vendorMasterSchema = new Schema<VendorMaster>({
    companyName: { type: String, required: true, unique: true },
    companyAddress: { type: String, required: true },
    companyCity: { type: String, required: true },
    companyPincode: { type: Number, required: true },
    companyState: { type: String, required: true },
    companyTaluk: { type: String, required: true },
    companyCountry: { type: String, required: true },
    companyLandmark: { type: String, required: true },
    vendorRegisterNo: { type: String },
    vendorRegisterDate: { type: Date },
    vendorRegisterDocument: { type: String },
    vendorMainContactName: { type: String, required: true },
    vendorMainDesignation: { type: String },
    vendorMainOfficeNo: { type: String, required: true },
    vendorMainMobileNo: { type: String, required: true },
    vendorMainEmail: { type: String, required: true },
    vendorAlternateContactName: { type: String },
    vendorAlternateDesignation: { type: String },
    vendorAlternateOfficeNo: { type: String },
    vendorAlternateMobileNo: { type: String },
    vendorAlternateEmail: { type: String },
    vendorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    vendorDescription: { type: String, required: true },
    vendorEventTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true }],
    vendorImages: [{ type: String, required: true }],
    programId: { type: String, required: true },
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters', required: true },
}, { timestamps: true });

// Define and export your model
const VendorMaster = mongoose.model<VendorMaster>("vendorMaster", vendorMasterSchema);

export default VendorMaster;
