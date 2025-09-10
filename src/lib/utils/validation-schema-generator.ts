import * as Yup from "yup";
import { CatererDataType } from "@/lib/types";

// A simple example schema for validation.
// You will need to expand this to cover all your form fields.
export const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  companyAddress: Yup.string().required("Company address is required"),
  companyPincode: Yup.number().required("Pincode is required"),
  vendorMainContactFirstName: Yup.string().required("First name is required"),
  vendorMainEmail: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  vendorCuisines: Yup.array()
    .min(1, "At least one cuisine is required")
    .required("Cuisines are required"),
});

// A placeholder function as your component expects this export
export const generateValidationSchema = () => {
  return validationSchema;
};