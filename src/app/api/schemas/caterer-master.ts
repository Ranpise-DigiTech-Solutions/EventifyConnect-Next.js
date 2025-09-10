import mongoose from "mongoose";

// Step 1: Define a TypeScript interface that matches your schema structure.
// This is what will be imported and used for type safety in your components.
export interface CatererMasterSchemaType extends mongoose.Document {
  vendorUserId: any;
  documentId: number;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPincode: number;
  companyState: string;
  companyTaluk?: string; // Add '?' for optional fields
  companyCountry?: string;
  companyLandmark?: string;
  vendorRegisterNo?: string;
  vendorRegisterDate?: string;
  vendorRegisterDocumentUrl?: string;
  vendorMainContactFirstName: string;
  vendorMainContactLastName?: string;
  vendorMainDesignation?: string;
  vendorMainOfficeNo?: string;
  vendorMainMobileNo: string;
  vendorMainEmail: string;
  vendorAlternateContactFirstName?: string;
  vendorAlternateContactLastName?: string;
  vendorAlternateDesignation?: string;
  vendorAlternateOfficeNo?: string;
  vendorAlternateMobileNo?: string;
  vendorAlternateEmail?: string;
  vendorDescription?: string;
  vendorCuisines?: string[]; // Use array type for multiple strings
  vendorMinGuests?: number;
  vendorMaxGuests?: number;
  vendorServiceAreas?: string[];
  vendorExperience?: number;
  vendorCertificates?: string[];
  vendorEquipment?: string[];
  vendorPackagesOffered?: string[];
  vendorTravelAvailability?: string;
  vendorPortfolioURL?: string;
  vendorSocialMediaLinks?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// Step 2: Define your Mongoose schema as you did before.
const catererSchema = new mongoose.Schema({
  documentId: {
    type: Number,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyAddress: {
    type: String,
    required: true,
  },
  companyCity: {
    type: String,
    required: true,
  },
  companyPincode: {
    type: Number,
    required: true,
  },
  companyState: {
    type: String,
    required: true,
  },
  companyTaluk: String,
  companyCountry: String,
  companyLandmark: String,
  vendorRegisterNo: String,
  vendorRegisterDate: String,
  vendorRegisterDocumentUrl: String,
  vendorMainContactFirstName: {
    type: String,
    required: true,
  },
  vendorMainContactLastName: String,
  vendorMainDesignation: String,
  vendorMainOfficeNo: String,
  vendorMainMobileNo: {
    type: String,
    required: true,
  },
  vendorMainEmail: {
    type: String,
    required: true,
  },
  vendorAlternateContactFirstName: String,
  vendorAlternateContactLastName: String,
  vendorAlternateDesignation: String,
  vendorAlternateOfficeNo: String,
  vendorAlternateMobileNo: String,
  vendorAlternateEmail: String,
  vendorDescription: String,
  vendorCuisines: [String],
  vendorMinGuests: Number,
  vendorMaxGuests: Number,
  vendorServiceAreas: [String],
  vendorExperience: Number,
  vendorCertificates: [String],
  vendorEquipment: [String],
  vendorPackagesOffered: [String],
  vendorTravelAvailability: String,
  vendorPortfolioURL: String,
  vendorSocialMediaLinks: {
    whatsapp: String,
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
  },
});

// Step 3: Use the interface in your model definition.
export const catererMaster = mongoose.models.Caterer || mongoose.model<CatererMasterSchemaType>("Caterer", catererSchema);