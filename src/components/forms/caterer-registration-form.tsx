/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import Select, { SingleValue } from "react-select";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/use-redux-store";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import AddIcon from "@mui/icons-material/Add";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { FaEdit } from "react-icons/fa";

import PhoneInput from "react-phone-input-2";
import { LoadingScreen } from "@/components/sub-components";
import {catererMaster} from "@/app/api/schemas/caterer-master";
import {
  CatererDataErrorInfoType,
  CatererDataType,
  ReactSelectOptionType,
} from "@/lib/types";
import { RootState } from "@/redux/store";
import { fetchCitiesOfState, fetchStates } from "@/redux/thunks/data";

import "react-phone-input-2/lib/style.css";
import styles from "./caterer-registration-form.module.css";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import {
  generateValidationSchema,
  validationSchema,
} from "@/lib/utils/validation-schema-generator";

// Custom helper function to check if an object is empty
const isObjectEmpty = (obj: any) => Object.keys(obj).length === 0;

const CatererRegistrationForm = () => {
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState("FORM_ONE");
  const [userConfirmationDialog, setUserConfirmationDialog] = useState(false);
  const [userConfirmation, setUserConfirmation] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDocumentUploading, setIsDocumentUploading] = useState(false);

  // States for dynamic data fetching
  const [selectedState, setSelectedState] =
    useState<SingleValue<ReactSelectOptionType> | null>(null);
  const [selectedCity, setSelectedCity] =
    useState<SingleValue<ReactSelectOptionType> | null>(null);

  const dispatch = useAppDispatch();
  const states = useAppSelector((state: RootState) => state.dataInfo.states);
  const cities = useAppSelector((state: RootState) => state.dataInfo.cities);

  const catererDataTemplate: CatererDataType = {
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPincode: 0,
    companyState: "",
    companyTaluk: "",
    companyCountry: "",
    companyLandmark: "",
    vendorRegisterNo: "",
    vendorRegisterDate: "",
    vendorRegisterDocument: null,
    vendorRegisterDocumentUrl: "",
    vendorMainContactFirstName: "",
    vendorMainContactLastName: "",
    vendorMainDesignation: "",
    vendorMainOfficeNo: "",
    vendorMainMobileNo: "",
    vendorMainEmail: "",
    vendorAlternateContactFirstName: "",
    vendorAlternateContactLastName: "",
    vendorAlternateDesignation: "",
    vendorAlternateOfficeNo: "",
    vendorAlternateMobileNo: "",
    vendorAlternateEmail: "",
    vendorDescription: "",
    vendorCuisines: [],
    vendorMinGuests: 0,
    vendorMaxGuests: 0,
    vendorServiceAreas: [],
    vendorExperience: 0,
    vendorCertificates: [],
    vendorEquipment: [],
    vendorPackagesOffered: [],
    vendorTravelAvailability: "",
    vendorPortfolioURL: "",
    vendorSocialMediaLinks: {
      whatsapp: "",
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  };

  const catererDataErrorInfoTemplate: CatererDataErrorInfoType = {
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPincode: "",
    companyState: "",
    companyTaluk: "",
    companyCountry: "",
    companyLandmark: "",
    vendorRegisterNo: "",
    vendorRegisterDate: "",
    vendorRegisterDocument: "",
    vendorMainContactFirstName: "",
    vendorMainContactLastName: "",
    vendorMainDesignation: "",
    vendorMainOfficeNo: "",
    vendorMainMobileNo: "",
    vendorMainEmail: "",
    vendorAlternateContactFirstName: "",
    vendorAlternateContactLastName: "",
    vendorAlternateDesignation: "",
    vendorAlternateOfficeNo: "",
    vendorAlternateMobileNo: "",
    vendorAlternateEmail: "",
    vendorDescription: "",
    vendorCuisines: "",
    vendorMinGuests: "",
    vendorMaxGuests: "",
    vendorServiceAreas: "",
    vendorExperience: "",
    vendorCertificates: "",
    vendorEquipment: "",
    vendorPackagesOffered: "",
    vendorTravelAvailability: "",
    vendorPortfolioURL: "",
    vendorSocialMediaLinks: {
      whatsapp: "",
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  };

  // State for caterer specific data and errors
  const [catererData, setCatererData] = useState<CatererDataType>(catererDataTemplate);
  const [catererDataErrorInfo, setCatererDataErrorInfo] =
    useState<CatererDataErrorInfoType>(catererDataErrorInfoTemplate);


  // Function to handle changes in caterer data
  const handleCatererData = (key: string, value: any) => {
    setCatererData((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleCatererDataErrorInfo = (key: string, value: string) => {
    setCatererDataErrorInfo((prevState) => ({ ...prevState, [key]: value }));
  };

  // State management for Firebase file uploads
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Formik validation and state management
  const formik = useFormik({
    initialValues: catererDataTemplate,
    validationSchema: validationSchema,
    onSubmit: async () => {
      // Form submission logic here
    },
  });

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(fetchStates({ countryName: "India" }));
  }, [dispatch]);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (selectedState) { // Added null check here
      dispatch(fetchCitiesOfState({
        countryName: "India", // Also passing country name here
        stateName: selectedState.value as string
      }));
    }
  }, [selectedState, dispatch]);

  const validateCatererFormOne = () => {
    let errors: Partial<CatererDataErrorInfoType> = {};
    if (!catererData.companyName.trim())
      errors.companyName = "Company name is required";
    if (!catererData.companyAddress.trim())
      errors.companyAddress = "Company address is required";
    if (!catererData.companyState.trim())
      errors.companyState = "State is required";
    if (!catererData.companyCity.trim())
      errors.companyCity = "City is required";
    if (!catererData.companyPincode)
      errors.companyPincode = "Pincode is required";
    return errors;
  };

  const validateCatererFormTwo = () => {
    let errors: Partial<CatererDataErrorInfoType> = {};
    if (!catererData.vendorMainContactFirstName.trim())
      errors.vendorMainContactFirstName = "First name is required";
    if (!catererData.vendorMainContactLastName.trim())
      errors.vendorMainContactLastName = "Last name is required";
    if (!catererData.vendorMainEmail.trim())
      errors.vendorMainEmail = "Email is required";
    return errors;
  };

  const validateCatererFormThree = () => {
    let errors: Partial<CatererDataErrorInfoType> = {};
    if (catererData.vendorCuisines.length === 0)
      errors.vendorCuisines = "At least one cuisine must be selected";
    if (!catererData.vendorMinGuests)
      errors.vendorMinGuests = "Minimum guests is required";
    if (!catererData.vendorMaxGuests)
      errors.vendorMaxGuests = "Maximum guests is required";
    return errors;
  };

  const validateCatererFormFour = () => {
    let errors: Partial<CatererDataErrorInfoType> = {};
    if (!catererData.vendorExperience)
      errors.vendorExperience = "Experience is required";
    if (catererData.vendorServiceAreas.length === 0)
      errors.vendorServiceAreas = "Service areas are required";
    return errors;
  };

  const handleNextBtnClick = () => {
    let errors = {};
    if (formType === "FORM_ONE") {
      errors = validateCatererFormOne();
      if (isObjectEmpty(errors)) {
        setFormType("FORM_TWO");
      }
    } else if (formType === "FORM_TWO") {
      errors = validateCatererFormTwo();
      if (isObjectEmpty(errors)) {
        setFormType("FORM_THREE");
      }
    } else if (formType === "FORM_THREE") {
      errors = validateCatererFormThree();
      if (isObjectEmpty(errors)) {
        setFormType("FORM_FOUR");
      }
    } else if (formType === "FORM_FOUR") {
      errors = validateCatererFormFour();
      if (isObjectEmpty(errors)) {
        setUserConfirmationDialog(true);
      }
    }
    setCatererDataErrorInfo(errors as CatererDataErrorInfoType);
  };

  const handlePreviousBtnClick = () => {
    if (formType === "FORM_FOUR") {
      setFormType("FORM_THREE");
    } else if (formType === "FORM_THREE") {
      setFormType("FORM_TWO");
    } else if (formType === "FORM_TWO") {
      setFormType("FORM_ONE");
    }
  };

  const handleFormSubmit = async () => {
    const URL = `/api/routes/catererMaster/`;
    try {
      setIsLoading(true);
      const data = {
        ...catererData,
        vendorRegisterDocumentUrl: url,
      };
      const res = await axios.post(URL, data);
      setIsLoading(false);
      setIsFormSubmitted(true);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (userConfirmation) {
      handleFormSubmit();
      setUserConfirmation(false);
    }
  }, [userConfirmation]);

  return (
    <div className={styles.container}>
      {isLoading && <LoadingScreen />}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="caterer-registration-dialog-title"
        aria-describedby="caterer-registration-dialog-description"
        maxWidth="xl"
      >
        <div className={styles.dialogContainer}>
          <div className={styles.dialogHeader}>
            <h1>Caterer Registration Form</h1>
            <p>
              Fill out the following information to register as a Caterer with
              us!
            </p>
            <div className={styles.formCloseBtn}>
              <CloseIcon
                onClick={() => setOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            {formType === "FORM_ONE" && (
              <div className={styles.formSection}>
                <h2>Company Details</h2>
                {/* ... existing fields for company details */}
                <div className={styles.textField}>
                  <label className={styles.title}>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={catererData.companyName}
                    onChange={(e) =>
                      handleCatererData("companyName", e.target.value)
                    }
                    placeholder="Enter your company name"
                  />
                  {catererDataErrorInfo.companyName && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.companyName}
                    </span>
                  )}
                </div>
                {/* ... other company detail fields like address, city, etc. */}
              </div>
            )}
            {formType === "FORM_TWO" && (
              <div className={styles.formSection}>
                <h2>Contact Information</h2>
                {/* ... existing fields for contact details */}
                <div className={styles.textField}>
                  <label className={styles.title}>Main Contact First Name</label>
                  <input
                    type="text"
                    name="vendorMainContactFirstName"
                    value={catererData.vendorMainContactFirstName}
                    onChange={(e) =>
                      handleCatererData("vendorMainContactFirstName", e.target.value)
                    }
                    placeholder="Enter main contact first name"
                  />
                  {catererDataErrorInfo.vendorMainContactFirstName && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.vendorMainContactFirstName}
                    </span>
                  )}
                </div>
                {/* ... other contact detail fields */}
              </div>
            )}
            {formType === "FORM_THREE" && (
              <div className={styles.formSection}>
                <h2>Caterer Specific Information</h2>
                {/* Updated fields for Caterer */}
                <div className={styles.textField}>
                  <label className={styles.title}>Cuisines Offered</label>
                  <Select
                    isMulti
                    options={[
                      { value: 'Indian', label: 'Indian' },
                      { value: 'Italian', label: 'Italian' },
                      { value: 'Chinese', label: 'Chinese' },
                      { value: 'Mexican', label: 'Mexican' },
                    ]}
                    onChange={(selectedOptions) =>
                      handleCatererData(
                        "vendorCuisines",
                        selectedOptions.map((opt) => opt.value)
                      )
                    }
                    placeholder="Select cuisines"
                  />
                  {catererDataErrorInfo.vendorCuisines && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.vendorCuisines}
                    </span>
                  )}
                </div>
                <div className={styles.textField}>
                  <label className={styles.title}>Minimum Guests</label>
                  <input
                    type="number"
                    name="vendorMinGuests"
                    value={catererData.vendorMinGuests}
                    onChange={(e) =>
                      handleCatererData("vendorMinGuests", parseInt(e.target.value))
                    }
                    placeholder="Enter minimum number of guests"
                  />
                  {catererDataErrorInfo.vendorMinGuests && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.vendorMinGuests}
                    </span>
                  )}
                </div>
                <div className={styles.textField}>
                  <label className={styles.title}>Maximum Guests</label>
                  <input
                    type="number"
                    name="vendorMaxGuests"
                    value={catererData.vendorMaxGuests}
                    onChange={(e) =>
                      handleCatererData("vendorMaxGuests", parseInt(e.target.value))
                    }
                    placeholder="Enter maximum number of guests"
                  />
                  {catererDataErrorInfo.vendorMaxGuests && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.vendorMaxGuests}
                    </span>
                  )}
                </div>
              </div>
            )}
            {formType === "FORM_FOUR" && (
              <div className={styles.formSection}>
                <h2>Additional Information</h2>
                {/* ... existing fields like experience, social links, etc. */}
                <div className={styles.textField}>
                  <label className={styles.title}>Years of Experience</label>
                  <input
                    type="number"
                    name="vendorExperience"
                    value={catererData.vendorExperience}
                    onChange={(e) =>
                      handleCatererData("vendorExperience", parseInt(e.target.value))
                    }
                    placeholder="Enter years of experience"
                  />
                  {catererDataErrorInfo.vendorExperience && (
                    <span className={styles.errorText}>
                      {catererDataErrorInfo.vendorExperience}
                    </span>
                  )}
                </div>
                {/* ... other fields like social media links */}
              </div>
            )}
            <div className={styles.btnSection}>
              {formType !== "FORM_ONE" && (
                <button
                  className={styles.backBtn}
                  onClick={handlePreviousBtnClick}
                  type="button"
                >
                  Back
                </button>
              )}
              <button
                className={styles.nextBtn}
                onClick={handleNextBtnClick}
                type="button"
              >
                {formType === "FORM_FOUR" ? <span>Submit</span> : <span>Next</span>}
              </button>
            </div>
          </div>
        </div>
        <Dialog
          open={userConfirmationDialog}
          onClose={() => setUserConfirmationDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirmation Dialog!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure the provided information is correct to the best of
              your knowledge? Your input is crucial for accurate registration!!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUserConfirmationDialog(false);
                setUserConfirmation(true);
              }}
              autoFocus
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    </div>
  );
};

export default CatererRegistrationForm;