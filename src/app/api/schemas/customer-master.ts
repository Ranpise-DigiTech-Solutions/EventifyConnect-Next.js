import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface CustomerMaster extends Document {
    customerName: string;
    customerCurrentLocation?: string;
    customerContact: string;
    customerEmail: string;
    customerPassword: string;
    customerUid: string;

    customerAddress?: string;
    customerCity?: string;
    customerPincode?: number;
    customerState?: string;
    customerTaluk?: string;
    customerCountry?: string;
    customerLandmark?: string;

    customerDesignation?: string;
    customerMainOfficeNo?: string;
    customerMainMobileNo?: string;
    customerMainEmail?: string;

    customerAlternateMobileNo?: string;
    customerAlternateEmail?: string;

    customerDocumentType?: string;
    customerDocumentId?: string;
    customerGender?: string;

    customerProfileImage?: string;

    programId: string;
}

// Define your schema
const customerMasterSchema = new Schema<CustomerMaster>({
    customerName: { type: String, required: true },
    customerCurrentLocation: { type: String },
    customerContact: { type: String, required: true, unique: true },
    customerEmail: { type: String, required: true, unique: true },
    customerPassword: { type: String, required: true },
    customerUid: { type: String, required: true, unique: true },

    customerAddress: { type: String },
    customerCity: { type: String },
    customerPincode: { type: Number },
    customerState: { type: String },
    customerTaluk: { type: String },
    customerCountry: { type: String },
    customerLandmark: { type: String },

    customerDesignation: { type: String },
    customerMainOfficeNo: { type: String },
    customerMainMobileNo: { type: String },
    customerMainEmail: { type: String },

    customerAlternateMobileNo: { type: String },
    customerAlternateEmail: { type: String },

    customerDocumentType: { type: String },
    customerDocumentId: { type: String },
    customerGender: { type: String },

    customerProfileImage: { type: String },

    programId: { type: String, required: true },
}, { timestamps: true });

// Define and export your model
const CustomerMaster = mongoose.model<CustomerMaster>("customerMaster", customerMasterSchema);

export default CustomerMaster;
