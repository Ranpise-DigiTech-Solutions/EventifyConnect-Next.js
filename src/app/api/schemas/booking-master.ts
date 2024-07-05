import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

// Define types for fields in your Mongoose schema
interface BookingMaster extends Document {
    documentId: string;
    hallId: mongoose.Types.ObjectId;
    hallCity: string;
    hallUserId: mongoose.Types.ObjectId;
    vendorTypeId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    customerType: 'WEB-PLATFORM' | 'WALK-IN';
    bookingType: 'HALL' | 'VENDOR';
    bookCaterer: boolean;
    bookingStartDateTimestamp: Date;
    bookingEndDateTimestamp: Date;
    bookingDuration: number;
    bookingStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED';
    bookingStatusRemark?: string;
    guestsCount: number;
    roomsCount: number;
    parkingRequirement: boolean;
    vehiclesCount: number;
    customerVegRate?: number;
    customerNonVegRate?: number;
    customerVegItemsList?: string;
    customerNonVegItemsList?: string;
    customerInfo?: string;
    customerSuggestion?: string;
    remarks?: string;
    vendorId?: mongoose.Types.ObjectId;
}

// Define your schema
const bookingMasterSchema = new Schema<BookingMaster>({
    documentId: { type: String, default: uuidv4, unique: true }, 
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'hallmasters'},
    hallCity: { type: String, required: true },
    hallUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters'},
    vendorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customermasters', required: true },
    customerType: { type: String, enum: ['WEB-PLATFORM', 'WALK-IN'], default: 'WEB-PLATFORM' },
    bookingType: { type: String, enum: ['HALL', 'VENDOR'], default: "HALL" },
    bookCaterer: { type: Boolean, required: true },
    bookingStartDateTimestamp: { type: Date, required: true },
    bookingEndDateTimestamp: { type: Date, required: true },
    bookingDuration: { type: Number, required: true },
    bookingStatus: { type: String, enum:['PENDING', 'CONFIRMED', 'REJECTED'], default:'PENDING' },
    bookingStatusRemark: { type: String },
    guestsCount: { type: Number, required: true },
    roomsCount: { type: Number, required: true },
    parkingRequirement: { type: Boolean, required: true },
    vehiclesCount: { type: Number, required: true },
    customerVegRate: { type: Number },
    customerNonVegRate: { type: Number },
    customerVegItemsList: { type: String },
    customerNonVegItemsList: { type: String },
    customerInfo: { type: String },
    customerSuggestion: { type: String },
    remarks: { type: String },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "vendormasters" },
}, { timestamps: true });

// Ensure unique index on documentId
bookingMasterSchema.index({ documentId: 1 }, { unique: true });

// Check if the model is already defined before defining it
const BookingMaster = mongoose.models.bookingMaster || mongoose.model<BookingMaster>('bookingMaster', bookingMasterSchema);

export default BookingMaster;
