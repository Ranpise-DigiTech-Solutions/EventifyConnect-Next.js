import { Double } from "mongodb";
import mongoose from "mongoose";

const hallMasterSchema = new mongoose.Schema({
    hallName: { type: String, required: true, unique:true},
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
    hallParkingCapacity: { type: Number, }, 
    hallVegRate: { type: Number, required: true },
    hallNonVegRate: { type: Number, required: true },
    hallFreezDay: { type: Number },

    hallEventTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true}], 
    hallImages: [{ type: String, required: true }],

    hallLikesCount: { type: Number, required: true, default: 0 },
    hallMaxBookings: { type: Number, required: true, default: 0 },
    hallUserRating: { type: Number, required: true, default: 0 },

    programId: { type: String, required: true },
    hallUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters', required: true }
}, { timestamps: true });

const hallMaster = mongoose.model("hallMaster", hallMasterSchema);

export default hallMaster;