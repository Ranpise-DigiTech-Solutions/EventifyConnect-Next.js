import mongoose from "mongoose";

const vendorMasterSchema = new mongoose.Schema({
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

    vendorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true }, // vendor type id
    vendorDescription: { type: String, required: true },
    vendorEventTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true}], 
    vendorImages: [{ type: String, required: true }],

    programId: { type: String, required: true },
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters', required: true },
    
}, { timestamps: true });

const vendorMaster = mongoose.model("vendorMaster", vendorMasterSchema);

export default vendorMaster;