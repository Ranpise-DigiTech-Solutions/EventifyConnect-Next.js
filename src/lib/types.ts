import { HallMasterSchemaType } from "@/app/api/schemas/hall-master";

export type ImagesType = {
  [key: string]: Array<string>;
};

export type HallsAvailabilityType = {
  hallId: string;
  hallName: string;
  availability: string;
  hallTaluk: string;
  hallCity: string;
  hallState: string;
  hallImages: string[];
  hallDescription: string;
  hallVegRate: number;
  hallNonVegRate: number;
  hallCapacity: number;
  hallRooms: number;
  hallParking: string;
  hallFreezDay: number;
  hallUserRating: number;
};

export type PhotographersFilteredListType = {
  _id: string;
  vendorImages: string[];
  vendorDescription: string;
  companyName: string;
  companyCity: string;
};

export type PackagesCardDataType = {
  vendorCuisines: any;
  vendorMinGuests: any;
  vendorMaxGuests: any;
  _id: string;
  vendorImages: string[];
  vendorDescription: string;
  companyName: string;
  companyCity: string;

  hallVegRate?: number;
  hallNonVegRate?: number;
  hallCapacity?: number;
  hallRooms?: number;
  hallParking?: string;
  hallFreezDay?: number;
  availability?: string;
  hallId?: string;
  hallImages?: string[];
  hallDescription?: string;
  hallName?: string;
  hallCity?: string;
};

export type PhotographerDataType = {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPincode: number;
  companyState: string;
  companyTaluk: string;
  companyCountry: string;
  companyLandmark: string;
  vendorRegisterNo: string;
  vendorRegisterDate: string;
  vendorRegisterDocument: any;
  vendorRegisterDocumentUrl: "",
  vendorMainContactFirstName: string;
  vendorMainContactLastName: string;
  vendorMainDesignation: string;
  vendorMainOfficeNo: string;
  vendorMainMobileNo: string;
  vendorMainEmail: string;
  vendorAlternateContactFirstName: string;
  vendorAlternateContactLastName: string;
  vendorAlternateDesignation: string;
  vendorAlternateOfficeNo: string;
  vendorAlternateMobileNo: string;
  vendorAlternateEmail: string;
  vendorDescription: string;
  vendorEventTypes: string[];
  vendorImages: File[];
  vendorImagesUrl: string[];
  vendorExperience: number;
  vendorPortfolioURL: string;
  vendorSocialMediaLinks: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  vendorCertificates: string[];
  vendorServiceAreas: string[];
  vendorEquipment: string[];
  vendorPackagesOffered: string[];
  vendorTravelAvailability: string;
};

export interface PhotographerDataErrorInfoType
  extends Omit<
    PhotographerDataType,
    | "companyPincode"
    | "vendorRegisterDate"
    | "vendorEventTypes"
    | "vendorImages"
    | "vendorSocialMediaLinks"
    | "vendorExperience"
    | "vendorCertificates"
    | "vendorServiceAreas"
    | "vendorEquipment"
    | "vendorPackagesOffered"
    | "vendorTravelAvailability"
    | "vendorImagesUrl"
    | "vendorRegisterDocumentUrl"
  > {
  companyPincode: string;
  vendorRegisterDate: string;
  vendorEventTypes: string;
  vendorImages: string;
  vendorExperience: string;
  vendorSocialMediaLinks: string;
  vendorCertificates: string;
  vendorServiceAreas: string;
  vendorEquipment: string;
  vendorPackagesOffered: string;
  vendorTravelAvailability: string;
}

// Start of new types for Caterer
export interface CatererDataType {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPincode: number;
  companyState: string;
  companyTaluk: string;
  companyCountry: string;
  companyLandmark: string;
  vendorRegisterNo: string;
  vendorRegisterDate: string;
  vendorRegisterDocument: any;
  vendorRegisterDocumentUrl: string;
  vendorMainContactFirstName: string;
  vendorMainContactLastName: string;
  vendorMainDesignation: string;
  vendorMainOfficeNo: string;
  vendorMainMobileNo: string;
  vendorMainEmail: string;
  vendorAlternateContactFirstName: string;
  vendorAlternateContactLastName: string;
  vendorAlternateDesignation: string;
  vendorAlternateOfficeNo: string;
  vendorAlternateMobileNo: string;
  vendorAlternateEmail: string;
  vendorDescription: string;
  vendorCuisines: string[];
  vendorMinGuests: number;
  vendorMaxGuests: number;
  vendorServiceAreas: string[];
  vendorExperience: number;
  vendorCertificates: any[];
  vendorEquipment: any[];
  vendorPackagesOffered: any[];
  vendorTravelAvailability: string;
  vendorPortfolioURL: string;
  vendorSocialMediaLinks: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

export interface CatererDataErrorInfoType
  extends Omit<
    CatererDataType,
    | "companyPincode"
    | "vendorRegisterDate"
    | "vendorCuisines"
    | "vendorMinGuests"
    | "vendorMaxGuests"
    | "vendorServiceAreas"
    | "vendorExperience"
    | "vendorCertificates"
    | "vendorEquipment"
    | "vendorPackagesOffered"
    | "vendorTravelAvailability"
    | "vendorRegisterDocument"
    | "vendorRegisterDocumentUrl"
    | "vendorSocialMediaLinks"
  > {
  companyPincode: string;
  vendorRegisterDate: string;
  vendorCuisines: string;
  vendorMinGuests: string;
  vendorMaxGuests: string;
  vendorServiceAreas: string;
  vendorExperience: string;
  vendorCertificates: string;
  vendorEquipment: string;
  vendorPackagesOffered: string;
  vendorTravelAvailability: string;
  vendorRegisterDocument: string;
  vendorSocialMediaLinks: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}
// End of new types

export interface ReactSelectOptionType {
  value: string | null;
  label: string | null;
}

export type FilteredSearchComponentFiltersType = {
  cityName?: string;
  date?: string;
  eventType?: {
    label: string;
    value: string;
  };
  vendorType?: {
    label: string;
    value: string;
  };
};