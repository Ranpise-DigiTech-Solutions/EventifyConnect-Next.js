import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define types for fields in your Mongoose schema

export interface photographerBookingDetails {
  photographerId: string;
  companyName: string;
  vendorImage: string;
  expectedHeadCount: number;
  photoDeliveryFormat: string;
  photographyStyle: string;
  numberOfPhotographers: number;
  specialRequests: string;
  durationOfCoverage: number;
  additionalServices: string[];
}
interface BookingMaster extends Document {
  documentId: any;
  hallId: mongoose.Types.ObjectId;
  hallCity: string;
  hallUserId: mongoose.Types.ObjectId;
  vendorTypeId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerType: "WEB-PLATFORM" | "WALK-IN";
  bookingType: "HALL" | "VENDOR";
  otherVendorRequirement: boolean;
  bookingStartDateTimestamp: Date;
  bookingEndDateTimestamp: Date;
  bookingDuration: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "REJECTED";
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
  requiredOtherVendors: mongoose.Types.ObjectId[];
  inHouseVendors: mongoose.Types.ObjectId[];
  outsidePartyVendors: Map<
    mongoose.Types.ObjectId,
    photographerBookingDetails | any
  >;
  remarks?: string;
  vendorId?: mongoose.Types.ObjectId;
}

const photographerBookingDetailsSchema = new Schema(
  {
    expectedHeadCount: { type: Number, required: true },
    photoDeliveryFormat: {
      type: String,
      enum: ["digital", "prints", "both"],
      required: true,
    },
    photographyStyle: {
      type: String,
      enum: ["candid", "traditional", "journalistic"],
      required: true,
    },
    numberOfPhotographers: { type: Number, required: true },
    specialRequests: { type: String },
    durationOfCoverage: { type: Number, required: true },
    additionalServices: {
      type: [String],
      enum: ["Videography", "Drone Photography", "Live Streaming"],
      default: [],
    },
    photographerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "photographermasters",
      required: true,
    },
    companyName: { type: String, required: true },
    vendorImage: { type: String, required: true },
  }
);

// Define your schema
const bookingMasterSchema = new Schema<BookingMaster>(
  {
    documentId: { type: Number, default: uuidv4, unique: true },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: "hallmasters" },
    hallCity: { type: String, required: true },
    hallUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "serviceprovidermasters",
    },
    vendorTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendortypes",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "eventtypes",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customermasters",
      required: true,
    },
    customerType: {
      type: String,
      enum: ["WEB-PLATFORM", "WALK-IN"],
      default: "WEB-PLATFORM",
    },
    bookingType: { type: String, enum: ["HALL", "VENDOR"], default: "HALL" },
    otherVendorRequirement: {
      type: Boolean,
      default: true,
      required: true,
    },
    bookingStartDateTimestamp: { type: Date, required: true },
    bookingEndDateTimestamp: { type: Date, required: true },
    bookingDuration: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },
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
    requiredOtherVendors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "vendortypes" },
    ],
    inHouseVendors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "vendortypes" },
    ],
    outsidePartyVendors: {
      type: Map,
      of: photographerBookingDetailsSchema,
    },
    remarks: { type: String },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "vendormasters" },
  },
  { timestamps: true }
);

// Ensure unique index on documentId
bookingMasterSchema.index({ documentId: 1 }, { unique: true });

// Check if the model is already defined before defining it
const BookingMaster =
  mongoose.models.bookingMaster ||
  mongoose.model<BookingMaster>("bookingMaster", bookingMasterSchema);

export default BookingMaster;
