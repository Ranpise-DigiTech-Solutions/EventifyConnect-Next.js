import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const hallBookingMasterSchema = new mongoose.Schema({
    documentId: {type: Number, unique: true},
    customerType: { type: String, enum: ['WEB-PLATFORM', 'WALK-IN'], default: 'WEB-PLATFORM' },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'hallmasters'},
    hallCity: {type: String, required: true},
    hallUserId:{type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters'},
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'eventtypes'},
    vendorTypeId: {type: mongoose.Schema.Types.ObjectId, ref: 'vendortypes', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customermasters'},
    bookCaterer: { type: Boolean, required: true },
    bookingStatus: {type: String, enum:['PENDING', 'CONFIRMED', 'REJECTED'], default:'CONFIRMED'},
    bookingStatusRemark: { type: String },    
    bookingStartDateTimestamp: {type: Date, required: true,},
    bookingEndDateTimestamp: {type: Date, required: true,},
    bookingDuration: { type: Number, required: true },
    customerSuggestion: { type: String },

    finalGuestCount: { type: Number, required: true },
    finalRoomCount: { type: Number, required: true },
    finalHallParkingRequirement: { type: Boolean, required: true},
    finalVehicleCount: { type: Number, required: true },
    finalVegRate: { type: Number },
    finalNonVegRate: { type: Number },
    finalVegItemsList: { type: String },
    finalNonVegItemsList: { type: String },

    // additional details for walk-in customer booking
    customerName:  { type: String },
    customerMainOfficeNo: { type: String },
    customerMainMobileNo: { type: String },
    customerMainEmail: { type: String },
    
}, { timestamps: true });

// hallBookingMasterSchema.index({ customerId: 1, bookingTimestamp: 1 }, { unique: true });

hallBookingMasterSchema.index({ documentId: 1 }, { unique: true });

const hallBookingMaster = mongoose.model("hallBookingMaster", hallBookingMasterSchema);

// hallBookingMaster.collection.dropIndexes(function(err, result) {
//     if (err) {
//         console.error("Error dropping old indexes:", err);
//     } else {
//         console.log("Old indexes dropped successfully:", result);
//     }
// });

export default hallBookingMaster;