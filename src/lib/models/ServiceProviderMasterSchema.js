import mongoose from "mongoose";

const serviceProviderMasterSchema = new mongoose.Schema({
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
    vendorGender:{ type: String },
    vendorAlternateMobileNo:{ type: String},
    vendorAlternateEmail:{ type: String },
    vendorAddress:{ type: String },
    vendorLandmark:{ type: String },
    vendorCity:{ type: String },
    vendorTaluk:{ type: String },
    vendorState:{ type: String },
    vendorCountry:{ type: String },
    vendorPincode:{ type: Number },
    vendorProfileImage: { type: String },
    programId: { type: String, required: true },
}, { timestamps: true });

const serviceProviderMaster = mongoose.model("serviceProviderMaster", serviceProviderMasterSchema);

export default serviceProviderMaster;