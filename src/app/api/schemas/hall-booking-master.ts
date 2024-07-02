import mongoose, { Schema, Document } from "mongoose";

// Define types for fields in your Mongoose schema
interface HallBookingMaster extends Document {
    documentId: number;
    customerType: 'WEB-PLATFORM' | 'WALK-IN';
    hallId: mongoose.Schema.Types.ObjectId;
    hallCity: string;
    hallUserId: mongoose.Schema.Types.ObjectId;
    eventId: mongoose.Schema.Types.ObjectId;
    vendorTypeId: mongoose.Schema.Types.ObjectId;
    customerId: mongoose.Schema.Types.ObjectId;
    bookCaterer: boolean;
    bookingStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED';
    bookingStatusRemark?: string;
    bookingStartDateTimestamp: Date;
    bookingEndDateTimestamp: Date;
    bookingDuration: number;
    customerSuggestion?: string;
    
    finalGuestCount: number;
    finalRoomCount: number;
    finalHallParkingRequirement: boolean;
    finalVehicleCount: number;
    finalVegRate?: number;
    finalNonVegRate?: number;
    finalVegItemsList?: string;
    finalNonVegItemsList?: string;

    // additional details for walk-in customer booking
    customerName?: string;
    customerMainOfficeNo?: string;
    customerMainMobileNo?: string;
    customerMainEmail?: string;
}

// Define your schema
const hallBookingMasterSchema = new Schema<HallBookingMaster>({
    documentId: { type: Number, unique: true },
    customerType: { type: String, enum: ['WEB-PLATFORM', 'WALK-IN'], default: 'WEB-PLATFORM' },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'hallmasters' },
    hallCity: { type: String, required: true },
    hallUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes' },
    vendorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customermasters' },
    bookCaterer: { type: Boolean, required: true },
    bookingStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'REJECTED'], default: 'CONFIRMED' },
    bookingStatusRemark: { type: String },
    bookingStartDateTimestamp: { type: Date, required: true },
    bookingEndDateTimestamp: { type: Date, required: true },
    bookingDuration: { type: Number, required: true },
    customerSuggestion: { type: String },

    finalGuestCount: { type: Number, required: true },
    finalRoomCount: { type: Number, required: true },
    finalHallParkingRequirement: { type: Boolean, required: true },
    finalVehicleCount: { type: Number, required: true },
    finalVegRate: { type: Number },
    finalNonVegRate: { type: Number },
    finalVegItemsList: { type: String },
    finalNonVegItemsList: { type: String },

    customerName: { type: String },
    customerMainOfficeNo: { type: String },
    customerMainMobileNo: { type: String },
    customerMainEmail: { type: String },
}, { timestamps: true });

// Define and export your model
const HallBookingMaster = mongoose.model<HallBookingMaster>("hallBookingMaster", hallBookingMasterSchema);

export default HallBookingMaster;
