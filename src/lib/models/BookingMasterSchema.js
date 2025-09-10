import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const bookingMasterSchema = new mongoose.Schema({
    // HALL BOOKING
    documentId: { type: Number, default: uuidv4, unique: true }, 
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'hallmasters'},
    hallCity: {type: String, required: true },
    hallUserId:{type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters'},
    vendorTypeId: {type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customermasters', required: true },
    customerType: { type: String, enum: ['WEB-PLATFORM', 'WALK-IN'], default: 'WEB-PLATFORM' },
    bookingType: { type: String, enum: ['HALL', 'VENDOR'], default: "HALL" },
    bookCaterer: { type: Boolean, required: true },
    bookingStartDateTimestamp: {type: Date, required: true,},
    bookingEndDateTimestamp: {type: Date, required: true,},
    bookingDuration: { type: Number, required: true },
    bookingStatus: {type: String, enum:['PENDING', 'CONFIRMED', 'REJECTED'],default:'PENDING'},
    bookingStatusRemark: { type: String },
    
    // details entered by customer 
    guestsCount: { type: Number, required: true},
    roomsCount: { type: Number, required: true},
    parkingRequirement: { type: Boolean, required: true},
    vehiclesCount: { type: Number, required: true},
    customerVegRate: { type: Number },
    customerNonVegRate: { type: Number },
    customerVegItemsList: { type: String },
    customerNonVegItemsList: { type: String },
    customerInfo: { type: String },
    customerSuggestion: { type: String },
    remarks:{ type: String },
    // OTHER VENDORS BOOKING
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "vendormasters"},

}, { timestamps: true });

// bookingMasterSchema.index({ customerId: 1, bookingStartDateTimestamp: 1, bookingEndDateTimestamp: 1 }, { unique: true });

bookingMasterSchema.index({ documentId: 1 }, { unique: true });

const bookingMaster = mongoose.model("bookingMaster", bookingMasterSchema);

// bookingMasterSchema.index({ documentId: 1 }, { unique: true });

// console.log(bookingMaster.collection.dropIndexes());
// bookingMaster.collection.dropIndexes(function(err, result) {
//     if (err) {
//         console.error("Error dropping old indexes:", err);
//     } else {
//         console.log("Old indexes dropped successfully:", result);
//     }
// });

export default bookingMaster;