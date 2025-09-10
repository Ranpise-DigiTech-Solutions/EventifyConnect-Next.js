import mongoose from "mongoose";

const customerMasterSchema = new mongoose.Schema({
    customerName: { type: String, required: true},
    customerCurrentLocation: {type: String}, // current location
    customerContact: {type: String, required: true ,unique: true},
    customerEmail: {type: String, required: true, unique: true },
    customerPassword: {type: String, required:true },
    customerUid: {type: String, required: true, unique: true}, // firebase

    customerAddress: { type: String }, // required-true
    customerCity: { type: String }, // required-true
    customerPincode: { type: Number }, // required-true
    customerState: { type: String }, // required-true
    customerTaluk: { type: String }, // required-true
    customerCountry: { type: String }, // required-true
    customerLandmark: { type: String }, // required-true
    
    customerDesignation: { type: String },
    customerMainOfficeNo: { type: String }, // required-true
    customerMainMobileNo: { type: String }, // required-true
    customerMainEmail: { type: String }, // required-true

    customerAlternateMobileNo: { type: String },
    customerAlternateEmail: { type: String },

    customerDocumentType: { type: String },
    customerDocumentId: { type: String },
    customerGender:{ type: String }, 
    
    customerProfileImage: { type: String },

    programId: { type: String, required: true }, // required-true
}, { timestamps: true });

const customerMaster = mongoose.model("customerMaster", customerMasterSchema);

export default customerMaster;