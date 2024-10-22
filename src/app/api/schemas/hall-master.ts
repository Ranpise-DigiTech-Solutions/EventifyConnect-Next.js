import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
export interface HallMasterSchemaType extends Document {
    hallName: string;
    hallAddress: string;
    hallCountry: string;
    hallState: string;
    hallCity: string;
    hallTaluk: string;
    hallPincode: number;
    hallLandmark: string;

    hallRegisterNo?: string;
    hallRegisterDate?: Date;
    hallRegisterDocument?: string;

    hallMainContactName: string;
    hallMainDesignation?: string;
    hallMainOfficeNo: string;
    hallMainMobileNo: string;
    hallMainEmail: string;

    hallAlternateContactName?: string;
    hallAlternateDesignation?: string;
    hallAlternateOfficeNo?: string;
    hallAlternateMobileNo?: string;
    hallAlternateEmail?: string;

    hallDescription: string;
    hallCapacity: number;
    hallRooms: number;
    hallParking: boolean;
    hallParkingCapacity?: number;
    hallVegRate: number;
    hallNonVegRate: number;
    hallFreezDay?: number;

    hallEventTypes: mongoose.Schema.Types.ObjectId[];
    hallImages: string[];

    hallLikesCount: number;
    hallMaxBookings: number;
    hallUserRating: number;

    programId: string;
    hallUserId: mongoose.Schema.Types.ObjectId;
}

// Define your schema
const hallMasterSchema = new Schema<HallMasterSchemaType>({
    hallName: { type: String, required: true, unique: true },
    hallAddress: { type: String, required: true },
    hallCountry: { type: String, required: true },
    hallState: { type: String, required: true },
    hallCity: { type: String, required: true },
    hallTaluk: { type: String, required: true },
    hallPincode: { type: Number, required: true },
    hallLandmark: { type: String, required: true },

    hallRegisterNo: { type: String },
    hallRegisterDate: { type: Date },
    hallRegisterDocument: { type: String },

    hallMainContactName: { type: String, required: true },
    hallMainDesignation: { type: String },
    hallMainOfficeNo: { type: String, required: true },
    hallMainMobileNo: { type: String, required: true },
    hallMainEmail: { type: String, required: true },

    hallAlternateContactName: { type: String },
    hallAlternateDesignation: { type: String },
    hallAlternateOfficeNo: { type: String },
    hallAlternateMobileNo: { type: String },
    hallAlternateEmail: { type: String },

    hallDescription: { type: String, required: true },
    hallCapacity: { type: Number, required: true },
    hallRooms: { type: Number, required: true },
    hallParking: { type: Boolean, required: true },
    hallParkingCapacity: { type: Number },
    hallVegRate: { type: Number, required: true },
    hallNonVegRate: { type: Number, required: true },
    hallFreezDay: { type: Number },

    hallEventTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true }],
    hallImages: [{ type: String, required: true }],

    hallLikesCount: { type: Number, required: true, default: 0 },
    hallMaxBookings: { type: Number, required: true, default: 0 },
    hallUserRating: { type: Number, required: true, default: 0 },

    programId: { type: String, required: true },
    hallUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters', required: true },
}, { timestamps: true });

// Define and export your model
const HallMaster = mongoose.models.hallMaster || mongoose.model<HallMasterSchemaType>("hallMaster", hallMasterSchema);

export default HallMaster;
