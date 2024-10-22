"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/use-redux-store";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import PhoneInput from "react-phone-input-2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import Slide, { SlideProps } from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedIcon from "@mui/icons-material/Verified";
import { FaEdit } from "react-icons/fa";

import { LoadingScreen } from "@/components/sub-components";
import { fetchCitiesOfState, fetchStates } from "@/redux/thunks/data";
import { firebaseStorage } from "@/lib/db/firebase";
import styles from "./user-registration-form.module.scss";
import "react-phone-input-2/lib/style.css";
import { RootState } from "@/redux/store";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Props = {
  open: boolean;
  handleClose: () => void;
};

const UserRegistrationFormComponent = ({ open, handleClose }: Props) => {
  const theme = useTheme();
  const { executeRecaptcha } = useGoogleReCaptcha();
  // const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // // Define the Transition component with correct types
  // const Transition = React.forwardRef<HTMLDivElement, SlideProps>(
  //   function Transition(props, ref) {
  //     return <Slide direction="up" ref={ref} {...props} />;
  //   }
  // );

  // const onDrop = useCallback((acceptedFiles) => {
  //   // Do something with the uploaded files (e.g., display or process them)
  //
  // }, []);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "none",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      boxShadow: state.isFocused ? "none" : provided.boxShadow,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      "& svg": {
        display: "none", // Hide the default arrow icon
      },
      padding: 0,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999999", // Change the placeholder color here
    }),
  };

  const progressBarStyle: React.CSSProperties = {
    position: "relative",
    flex: 1,
    width: "6.5rem",
  };

  const beforeStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    top: "-10px",
    left: "0",
    height: "1px",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  };

  interface customerDataType {
    customerFirstName: string;
    customerLastName: string;
    customerDocumentType: string;
    customerProfileImage: File | null | any;
    customerProfileImageUrl: string;
  }

  const customerDataTemplate = {
    customerFirstName: "", // required field
    customerLastName: "", // required field

    customerDocumentType: "",
    customerProfileImage: null,
    customerProfileImageUrl: "",
    // ... other fields can be found in `commonDataTemplate`
  };

  interface hallVendorDataType {
    hallName: string; // required field
    hallCapacity: number; // required field
    hallRooms: number; // required field
    hallParking: string; // required field
    hallParkingCapacity: number; // required field
    hallVegRate: number; // required field
    hallNonVegRate: number; // required field
    hallFreezDay: number;
  }

  const hallVendorDataTemplate = {
    hallName: "", // required field

    hallCapacity: 0, // required field
    hallRooms: 0, // required field
    hallParking: "UNAVAILABLE", // required field
    hallParkingCapacity: 0, // required field
    hallVegRate: 0, // required field
    hallNonVegRate: 0, // required field
    hallFreezDay: 0,
    // ... other fields can be found in `commonDataTemplate`
  };

  interface otherVendorDataType {
    companyName: string; // required field
    // ... other fields can be found in `commonDataTemplate`
  }

  const otherVendorDataTemplate = {
    companyName: "", // required field
    // ... other fields can be found in `commonDataTemplate`
  };

  const IdDocumentTypes = [
    "Aadhaar Card (India)",
    "Passport",
    "Driver's License",
    "Voter ID Card",
    "PAN Card (Permanent Account Number)",
    "Social Security Number (SSN)",
    "National Identity Card",
    "Birth Certificate",
    "School/College ID Card",
    "Employee ID Card",
    "Health Insurance Card",
    "Residence Permit",
    "Citizenship Certificate",
    "Military ID Card",
    "Bank Account Statement",
    "Utility Bill (Electricity, Water, Gas)",
    "Property Tax Receipt",
    "Rent Agreement",
    "Vehicle Registration Certificate",
    "Tax Identification Number (TIN)",
  ];

  interface commonDataType {
    address: string;
    landmark: string;
    country: string;
    state: string;
    city: string;
    taluk: string;
    pincode: string;

    mainContactFirstName: string;
    mainContactLastName: string;
    mainDesignation: string;
    mainOfficeNo: string;
    mainMobileNo: string;
    mainEmail: string;

    registerNo: string;
    registerDate: string;
    registerDocument: any;
    registerDocumentUrl: string;

    alternateContactFirstName: string;
    alternateContactLastName: string;
    alternateDesignation: string;
    alternateOfficeNo: string;
    alternateMobileNo: string;
    alternateEmail: string;

    description: string;

    images: File[];
    imagesUrl: string[];
  }

  const commonDataTemplate = {
    address: "",
    landmark: "",
    country: "India",
    state: "",
    city: "",
    taluk: "",
    pincode: "",

    mainContactFirstName: "",
    mainContactLastName: "",
    mainDesignation: "",
    mainOfficeNo: "+91",
    mainMobileNo: "+91",
    mainEmail: "",

    registerNo: "",
    registerDate: "",
    registerDocument: "",
    registerDocumentUrl: "",

    alternateContactFirstName: "",
    alternateContactLastName: "",
    alternateDesignation: "",
    alternateOfficeNo: "+91",
    alternateMobileNo: "+91",
    alternateEmail: "",

    description: "",

    images: [],
    imagesUrl: [],
  };

  const dispatch = useAppDispatch();
  const data = useAppSelector((state: RootState) => state.dataInfo); // COUNTRIES, STATES & CITIES
  const userInfo = useAppSelector((state: RootState) => state.userInfo); // details of registered user.

  const userType = userInfo.userDetails.userType;
  const vendorType = userInfo.userDetails.vendorType;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);
  const vendorPicturesInputRef = useRef<HTMLInputElement | null>(null);

  const [welcomeScreen, setWelcomeScreen] = useState<boolean>(true); //set the welcome page when this component is loaded for the first time.
  const [formType, setFormType] = useState("FORM_ONE"); //  FORM_ONE, FORM_TWO, FORM_THREE, FORM_FOUR
  const [formContactType, setFormContactType] = useState("PRIMARY"); // PRIMARY or SECONDARY
  const [userConfirmationDialog, setUserConfirmationDialog] =
    useState<boolean>(false); // toggle user confirmation dialog
  const [userConfirmation, setUserConfirmation] = useState<boolean>(false); // ask user whether the entered details are correct to the best of his/her knowledge.
  const [loadingScreen, setLoadingScreen] = useState<boolean>(false); // toggle Loading Screen
  const [isFileUploadComplete, setIsFileUploadComplete] =
    useState<boolean>(false); // to toggle submit

  const [hallVendorData, setHallVendorData] = useState<hallVendorDataType>({
    ...hallVendorDataTemplate,
  });
  const [customerData, setCustomerData] = useState<customerDataType>({
    ...customerDataTemplate,
  });
  const [otherVendorData, setOtherVendorData] = useState<otherVendorDataType>({
    ...otherVendorDataTemplate,
  });
  const [commonData, setCommonData] = useState<commonDataType>({
    // this contains fields from
    ...commonDataTemplate,
  });

  // to specify types for react-select options
  interface ReactSelectOptionType {
    value: string | null;
    label: string | null;
  }

  interface hallVendorDataErrorInfoType
    extends Omit<
      hallVendorDataType,
      | `hallCapacity`
      | `hallRooms`
      | `hallParkingCapacity`
      | `hallVegRate`
      | `hallNonVegRate`
      | `hallFreezDay`
    > {
    hallCapacity: string;
    hallRooms: string;
    hallParking: string;
    hallParkingCapacity: string;
    hallVegRate: string;
    hallNonVegRate: string;
    hallFreezDay: string;
    hallEventTypes: string;
  }

  const [hallVendorDataErrorInfo, setHallVendorDataErrorInfo] =
    useState<hallVendorDataErrorInfoType>({
      ...hallVendorDataTemplate,
      hallCapacity: "",
      hallRooms: "",
      hallParking: "",
      hallParkingCapacity: "",
      hallVegRate: "",
      hallNonVegRate: "",
      hallFreezDay: "",
      hallEventTypes: "",
    });
  const [customerDataErrorInfo, setCustomerDataErrorInfo] =
    useState<customerDataType>({
      ...customerDataTemplate,
    });
  const [otherVendorDataErrorInfo, setOtherVendorDataErrorInfo] =
    useState<otherVendorDataType>({
      ...otherVendorDataTemplate,
    });

  interface commonDataErrorInfoType
    extends Omit<commonDataType, `images` | `imagesUrl`> {
    images: string;
    imagesUrl: string;
    country: string;
    mainMobileNo: string;
    mainOfficeNo: string;
    alternateOfficeNo: string;
  }

  const [commonDataErrorInfo, setCommonDataErrorInfo] =
    useState<commonDataErrorInfoType>({
      ...commonDataTemplate,
      images: "",
      imagesUrl: "",
      country: "",
      mainMobileNo: "",
      mainOfficeNo: "",
      alternateOfficeNo: "",
      alternateMobileNo: "",
    });
  const [formErrorUpdateFlag, setFormErrorUpdateFlag] =
    useState<boolean>(false);

  useEffect(() => {
    try {
      if (userConfirmation && !userConfirmationDialog) {
        uploadFiles();
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }, [userConfirmation, userConfirmationDialog]);

  //fetch states data when a country is selected
  useEffect(() => {
    try {
      setLoadingScreen(true);
      dispatch(fetchStates({ countryName: commonData.country }));
      setLoadingScreen(false);
    } catch (error: any) {
      setLoadingScreen(false);
      console.error(error.message);
    } finally {
      setLoadingScreen(false);
    }
  }, [commonData.country]);

  //fetch cities data when a state is selected
  useEffect(() => {
    try {
      setLoadingScreen(true);
      dispatch(
        fetchCitiesOfState({
          countryName: commonData.country,
          stateName: commonData.state,
        })
      );
    } catch (error: any) {
      setLoadingScreen(false);
      console.error(error.message);
    } finally {
      setLoadingScreen(false);
    }
  }, [commonData.state]);

  useEffect(() => {
    try {
      switch (formType) {
        case "FORM_ONE":
          if (commonData.address) {
            // ensuring that form is filled before proceeding
            setLoadingScreen(true);
            const requiredFields = [
              customerDataErrorInfo.customerFirstName,
              customerDataErrorInfo.customerLastName,
              hallVendorDataErrorInfo.hallName,
              otherVendorDataErrorInfo.companyName,
              commonDataErrorInfo.country,
              commonDataErrorInfo.state,
              commonDataErrorInfo.city,
              commonDataErrorInfo.taluk,
              commonDataErrorInfo.pincode,
            ];

            const isFormValid = requiredFields.every((field) => field === "");

            if (isFormValid) {
              setFormType("FORM_TWO");
            }
            setLoadingScreen(false);
          }
          break;
        case "FORM_THREE":
          {
            const requiredFields = [
              commonDataErrorInfo.mainContactFirstName,
              commonDataErrorInfo.mainContactLastName,
              commonDataErrorInfo.mainDesignation,
              commonDataErrorInfo.mainEmail,
              commonDataErrorInfo.mainMobileNo,
              commonDataErrorInfo.mainOfficeNo,
              commonDataErrorInfo.alternateEmail,
              commonDataErrorInfo.alternateMobileNo,
              commonDataErrorInfo.alternateOfficeNo,
            ];

            const isFormValid = requiredFields.every((field) => field === "");

            if (isFormValid) {
              if (userType === "CUSTOMER") {
                setUserConfirmationDialog(true);
                return;
              }
              setFormType("FORM_FOUR");
            }
          }
          break;
        case "FORM_FOUR":
          {
            const requiredFields = [
              commonDataErrorInfo.images,
              commonDataErrorInfo.description,
              hallVendorDataErrorInfo.hallCapacity,
              hallVendorDataErrorInfo.hallRooms,
              hallVendorDataErrorInfo.hallParkingCapacity,
            ];

            const isFormValid = requiredFields.every((field) => field === "");

            if (isFormValid) {
              setUserConfirmationDialog(true);
              return;
            }
          }
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }, [formErrorUpdateFlag]);

  const handleCustomerData = (
    key: keyof customerDataType,
    value: customerDataType[keyof customerDataType]
  ) => {
    setCustomerData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleHallVendorData = (
    key: keyof hallVendorDataType,
    value: hallVendorDataType[keyof hallVendorDataType]
  ) => {
    setHallVendorData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleOtherVendorData = (
    key: keyof otherVendorDataType,
    value: otherVendorDataType[keyof otherVendorDataType]
  ) => {
    setOtherVendorData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleCommonData = (
    key: keyof commonDataType,
    value: commonDataType[keyof commonDataType]
  ) => {
    setCommonData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleCustomerDataErrorInfo = async (
    field: keyof customerDataType,
    errorMessage: string
  ) => {
    setCustomerDataErrorInfo((prevErrorInfo) => ({
      ...prevErrorInfo,
      [field]: errorMessage,
    }));
  };

  const handleHallVendorDataErrorInfo = (
    field: keyof hallVendorDataErrorInfoType,
    errorMessage: string
  ) => {
    setHallVendorDataErrorInfo((prevErrorInfo) => ({
      ...prevErrorInfo,
      [field]: errorMessage,
    }));
  };

  const handleOtherVendorDataErrorInfo = (
    field: keyof otherVendorDataType,
    errorMessage: string
  ) => {
    setOtherVendorDataErrorInfo((prevErrorInfo) => ({
      ...prevErrorInfo,
      [field]: errorMessage,
    }));
  };

  const handleCommonDataErrorInfo = (
    field: keyof commonDataErrorInfoType,
    errorMessage: string
  ) => {
    setCommonDataErrorInfo((prevErrorInfo) => ({
      ...prevErrorInfo,
      [field]: errorMessage,
    }));
  };

  const handleImageChange = (event: any) => {
    const selectedFiles = Array.from(event.target.files);
    let finalImageList: Array<any> = [];
    let finalImageListCount = 0;
    let requiredImageCount = 0;

    if (commonData.images) {
      finalImageList = [...commonData.images];
      finalImageListCount = commonData.images.length;
    }

    if (vendorType === "Banquet Hall") {
      requiredImageCount = 10;
    } else {
      requiredImageCount = 5;
    }

    if (selectedFiles.length + finalImageListCount > requiredImageCount) {
      handleCommonDataErrorInfo("images", "You can set at most 10 images!");
      return;
    }

    finalImageList = [...finalImageList, ...selectedFiles];

    handleCommonData("images", finalImageList);
  };

  const getRegisterDocumentType = () => {
    const fileExtension = commonData.registerDocument?.name
      .split(".")
      .pop()
      .toLowerCase();
    switch (fileExtension) {
      case "pdf":
        return "/images/pdf.svg";
      case "pptx":
      case "ppt":
        return "/images/pptx.svg";
      case "docx":
        return "/images/docx.svg";
      case "png":
      case "jpg":
      case "jpeg":
        return "/images/jpg.svg";
      default:
        return "/images/txt.svg";
    }
  };

  const validateFormOne = () => {
    if (userType === "CUSTOMER") {
      if (!customerData.customerFirstName) {
        handleCustomerDataErrorInfo(
          "customerFirstName",
          "First name is required"
        );
      } else {
        handleCustomerDataErrorInfo("customerFirstName", "");
      }
      if (!customerData.customerLastName) {
        handleCustomerDataErrorInfo(
          "customerLastName",
          "Last name is required"
        );
      } else {
        handleCustomerDataErrorInfo("customerLastName", "");
      }
    } else {
      if (vendorType === "Banquet Hall") {
        if (!hallVendorData.hallName) {
          handleHallVendorDataErrorInfo("hallName", "Hall name is required");
        } else {
          handleHallVendorDataErrorInfo("hallName", "");
        }
      } else {
        if (!otherVendorData.companyName) {
          handleOtherVendorDataErrorInfo(
            "companyName",
            "Brand name is required"
          );
        } else {
          handleOtherVendorDataErrorInfo("companyName", "");
        }
      }
    }
    if (!commonData.address) {
      handleCommonDataErrorInfo("address", "Address is required");
    } else {
      handleCommonDataErrorInfo("address", "");
    }
    if (!commonData.landmark) {
      handleCommonDataErrorInfo("landmark", "Landmark is required");
    } else {
      handleCommonDataErrorInfo("landmark", "");
    }
    if (!commonData.state) {
      handleCommonDataErrorInfo("state", "State is required");
    } else {
      handleCommonDataErrorInfo("state", "");
    }
    if (!commonData.city) {
      handleCommonDataErrorInfo("city", "City is required");
    } else {
      handleCommonDataErrorInfo("city", "");
    }
    if (!commonData.taluk) {
      handleCommonDataErrorInfo("taluk", "Taluk is required");
    } else {
      handleCommonDataErrorInfo("taluk", "");
    }
    if (!commonData.pincode) {
      handleCommonDataErrorInfo("pincode", "Pincode is required");
    } else {
      handleCommonDataErrorInfo("pincode", "");
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const validateFormThree = () => {
    if (!commonData.mainDesignation) {
      handleCommonDataErrorInfo("mainDesignation", "Designation is required");
    } else {
      handleCommonDataErrorInfo("mainDesignation", "");
    }
    if (!commonData.mainOfficeNo) {
      handleCommonDataErrorInfo(
        "mainOfficeNo",
        "Main office number is required"
      );
    } else if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(commonData.mainOfficeNo)) {
      handleCommonDataErrorInfo(
        "mainOfficeNo",
        "Please enter a valid phone number"
      );
    } else {
      handleCommonDataErrorInfo("mainOfficeNo", "");
    }
    if (!commonData.mainMobileNo) {
      handleCommonDataErrorInfo(
        "mainMobileNo",
        "Main mobile number is required"
      );
    } else if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(commonData.mainMobileNo)) {
      handleCommonDataErrorInfo(
        "mainMobileNo",
        "Please enter a valid phone number"
      );
    } else {
      handleCommonDataErrorInfo("mainMobileNo", "");
    }
    if (!commonData.mainEmail) {
      handleCommonDataErrorInfo("mainEmail", "Email is required");
    } else if (!/\S+@\S+\.\S+/.test(commonData.mainEmail)) {
      handleCommonDataErrorInfo(
        "mainEmail",
        "Please enter a valid email address"
      );
    } else if (!commonData.mainEmail.endsWith("@gmail.com")) {
      handleCommonDataErrorInfo("mainEmail", "Couldn't find your account");
    } else {
      handleCommonDataErrorInfo("mainEmail", "");
    }

    if (userType === "VENDOR") {
      if (!commonData.mainContactFirstName) {
        handleCommonDataErrorInfo(
          "mainContactFirstName",
          "First name is required"
        );
      } else {
        handleCommonDataErrorInfo("mainContactFirstName", "");
      }
      if (!commonData.mainContactLastName) {
        handleCommonDataErrorInfo(
          "mainContactLastName",
          "Last name is required"
        );
      } else {
        handleCommonDataErrorInfo("mainContactLastName", "");
      }
    }

    if (commonData.alternateOfficeNo !== "+91") {
      if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(commonData.alternateOfficeNo)) {
        handleCommonDataErrorInfo(
          "alternateOfficeNo",
          "Please enter a valid phone number"
        );
      } else {
        handleCommonDataErrorInfo("alternateOfficeNo", "");
      }
    }

    if (commonData.alternateMobileNo !== "+91") {
      if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(commonData.alternateMobileNo)) {
        handleCommonDataErrorInfo(
          "alternateMobileNo",
          "Please enter a valid phone number"
        );
      } else {
        handleCommonDataErrorInfo("alternateMobileNo", "");
      }
    }

    if (commonData.alternateEmail) {
      if (!/\S+@\S+\.\S+/.test(commonData.alternateEmail)) {
        handleCommonDataErrorInfo(
          "alternateEmail",
          "Please enter a valid email address"
        );
      } else if (!commonData.alternateEmail.endsWith("@gmail.com")) {
        handleCommonDataErrorInfo(
          "alternateEmail",
          "Couldn't find your account"
        );
      } else {
        handleCommonDataErrorInfo("alternateEmail", "");
      }
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const validateFormFour = () => {
    if (commonData.images.length === 0) {
      handleCommonDataErrorInfo("images", "Please select atleast one image");
    } else {
      handleCommonDataErrorInfo("images", "");
    }

    if (!commonData.description) {
      handleCommonDataErrorInfo("description", "Description is required");
    } else {
      handleCommonDataErrorInfo("description", "");
    }

    if (vendorType === "Banquet Hall") {
      if (hallVendorData.hallCapacity <= 0) {
        handleHallVendorDataErrorInfo(
          "hallCapacity",
          "Hall capacity cannot be less than or equal to zero"
        );
      } else {
        handleHallVendorDataErrorInfo("hallCapacity", "");
      }
      if (hallVendorData.hallRooms <= 0) {
        handleHallVendorDataErrorInfo(
          "hallRooms",
          "No of rooms cannot be less than or equal to zero"
        );
      } else {
        handleHallVendorDataErrorInfo("hallRooms", "");
      }
      if (hallVendorData.hallVegRate <= 0) {
        handleHallVendorDataErrorInfo(
          "hallVegRate",
          "Price cannot be less than or equal to zero"
        );
      } else {
        handleHallVendorDataErrorInfo("hallVegRate", "");
      }
      if (hallVendorData.hallNonVegRate <= 0) {
        handleHallVendorDataErrorInfo(
          "hallNonVegRate",
          "Price cannot be less than or equal to zero"
        );
      } else {
        handleHallVendorDataErrorInfo("hallNonVegRate", "");
      }
      if (hallVendorData.hallParkingCapacity <= 0) {
        handleHallVendorDataErrorInfo(
          "hallParkingCapacity",
          "Parking capacity cannot be less than or equal to zero"
        );
      } else {
        handleHallVendorDataErrorInfo("hallParkingCapacity", "");
      }
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const handlePrevBtnClick = () => {
    switch (formType) {
      case "FORM_ONE":
        break;
      case "FORM_TWO":
        setFormType("FORM_ONE");
        break;
      case "FORM_THREE":
        setFormType("FORM_TWO");
        break;
      case "FORM_FOUR":
        setFormType("FORM_THREE");
        break;
      default:
        break;
    }
  };

  const handleNextBtnClick = () => {
    switch (formType) {
      case "FORM_ONE":
        validateFormOne();
        break;
      case "FORM_TWO":
        setFormType("FORM_THREE");
        break;
      case "FORM_THREE":
        validateFormThree();
        break;
      case "FORM_FOUR":
        validateFormFour();
        break;
      default:
        break;
    }
  };

  const handleFormContactTypeChange = () => {
    if (formContactType === "PRIMARY") {
      setFormContactType("SECONDARY");
    } else {
      setFormContactType("PRIMARY");
    }
  };

  const uploadFiles = async () => {
    setLoadingScreen(true);
    try {
      if (userType === "VENDOR") {
        // Business Images Upload
        const uploadBusinessImages = commonData.images.map(async (file) => {
          const hallImagesRef = ref(
            firebaseStorage,
            `VENDOR/${vendorType}/${userInfo.userDetails.UID}/BusinessImages/${file.name}`
          );
          const snapshot = await uploadBytes(hallImagesRef, file);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          return downloadUrl;
        });

        const businessImagesUrl = await Promise.all(uploadBusinessImages);
        handleCommonData("imagesUrl", businessImagesUrl);

        // Registration Document Upload
        const hallRegisterDocumentRef = ref(
          firebaseStorage,
          `VENDOR/${vendorType}/${userInfo.userDetails.UID}/RegistrationDocument/${commonData.registerDocument.name}`
        );
        const snapshot = await uploadBytes(
          hallRegisterDocumentRef,
          commonData.registerDocument
        );
        const registrationDocumentUrl = await getDownloadURL(snapshot.ref);
        handleCommonData("registerDocumentUrl", registrationDocumentUrl);

        setIsFileUploadComplete(true);
      } else if (userType === "CUSTOMER") {
        const customerProfileImageRef = ref(
          firebaseStorage,
          `CUSTOMER/${userInfo.userDetails.UID}/ProfileImage/${customerData.customerProfileImage?.name}`
        );
        const snapshot = await uploadBytes(
          customerProfileImageRef,
          customerData.customerProfileImage
        );
        const customerProfileImageUrl = await getDownloadURL(snapshot.ref);
        handleCustomerData("customerProfileImageUrl", customerProfileImageUrl);
        setIsFileUploadComplete(true);
      }
      setLoadingScreen(false);
    } catch (err) {
      setLoadingScreen(false);
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isFileUploadComplete) {
      return;
    }

    try {
      handleFormSubmit();
    } catch (error) {
      console.error(error);
    }
  }, [isFileUploadComplete, executeRecaptcha]);

  const handleFormSubmit = async () => {
    if (!executeRecaptcha) {
      return;
    }

    setLoadingScreen(true);
    const captchaToken = await executeRecaptcha("inquirySubmit");
    let data = {};
    let URL = "";
    if (userType === "VENDOR") {
      if (vendorType === "Banquet Hall") {
        data = {
          ...hallVendorData,
          hallAddress: commonData.address,
          hallCountry: commonData.country,
          hallState: commonData.state,
          hallCity: commonData.city,
          hallTaluk: commonData.taluk,
          hallPincode: commonData.pincode,
          hallLandmark: commonData.landmark,

          hallRegisterNo: commonData.registerNo,
          hallRegisterDate: commonData.registerDate,
          hallRegisterDocument: commonData.registerDocumentUrl,

          hallMainContactName:
            commonData.mainContactFirstName +
            " " +
            commonData.mainContactLastName,
          hallMainDesignation: commonData.mainDesignation,
          hallMainOfficeNo: commonData.mainOfficeNo,
          hallMainMobileNo: commonData.mainMobileNo,
          hallMainEmail: commonData.mainEmail,

          hallAlternateContactName:
            commonData.alternateContactFirstName +
            " " +
            commonData.alternateContactLastName,
          hallAlternateDesignation: commonData.alternateDesignation,
          hallAlternateOfficeNo: commonData.alternateOfficeNo,
          hallAlternateMobileNo: commonData.alternateMobileNo,
          hallAlternateEmail: commonData.alternateEmail,

          hallDescription: commonData.description,

          hallEventTypes: userInfo.userDetails.Document.eventTypes,
          hallImages: commonData.imagesUrl,

          programId: "USER",
          hallUserId: userInfo.userDetails.Document._id,
        };
        URL = `/api/routes/hallMaster/`;
      } else {
        data = {
          ...otherVendorData,
          companyAddress: commonData.address,
          companyCity: commonData.city,
          companyPincode: commonData.pincode,
          companyState: commonData.state,
          companyTaluk: commonData.taluk,
          companyCountry: commonData.country,
          companyLandmark: commonData.landmark,

          vendorRegisterNo: commonData.registerNo,
          vendorRegisterDate: commonData.registerDate,
          vendorRegisterDocument: commonData.registerDocumentUrl,

          vendorMainContactName:
            commonData.mainContactFirstName +
            " " +
            commonData.mainContactLastName,
          vendorMainDesignation: commonData.mainDesignation,
          vendorMainOfficeNo: commonData.mainOfficeNo,
          vendorMainMobileNo: commonData.mainMobileNo,
          vendorMainEmail: commonData.mainEmail,

          vendorAlternateContactName:
            commonData.alternateContactFirstName +
            " " +
            commonData.alternateContactLastName,
          vendorAlternateDesignation: commonData.alternateDesignation,
          vendorAlternateOfficeNo: commonData.alternateOfficeNo,
          vendorAlternateMobileNo: commonData.alternateMobileNo,
          vendorAlternateEmail: commonData.alternateEmail,

          vendorTypeId: userInfo.userDetails.Document.vendorTypeId,
          vendorDescription: commonData.description,
          vendorEventTypes: userInfo.userDetails.Document.eventTypes,
          vendorImages: commonData.imagesUrl,

          programId: "USER",
          vendorUserId: userInfo.userDetails.Document._id,
        };
        URL = `/api/routes/vendorMaster/`;
      }
    } else {
      const {
        customerFirstName,
        customerLastName,
        customerProfileImage,
        ...remainingInfo
      } = customerData;
      data = {
        ...remainingInfo,
        customerName: customerFirstName + " " + customerLastName,

        customerAddress: commonData.address,
        customerCity: commonData.city,
        customerPincode: commonData.pincode,
        customerState: commonData.state,
        customerTaluk: commonData.taluk,
        customerCountry: commonData.country,
        customerLandmark: commonData.landmark,

        customerDesignation: commonData.mainDesignation,
        customerMainOfficeNo: commonData.mainOfficeNo,
        customerMainMobileNo: commonData.mainMobileNo,
        customerMainEmail: commonData.mainEmail,

        customerAlternateMobileNo: commonData.alternateMobileNo,
        customerAlternateEmail: commonData.alternateEmail,

        customerDocumentId: commonData.registerNo,
        customerDocumentType: customerData.customerDocumentType,
        customerProfileImage: customerData.customerProfileImageUrl,

        programId: "USER", // required-true
      };
      URL = `/api/routes/customerMaster/${userInfo.userDetails.Document._id}`;
    }

    try {
      const response =
        userType === "VENDOR"
          ? await axios.post(URL, data, {
              headers: {
                "Content-Type": "application/json",
                "X-Captcha-Token": captchaToken,
              },
              withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
            })
          : await axios.patch(URL, data, {
              headers: {
                "Content-Type": "application/json",
                "X-Captcha-Token": captchaToken,
              },
              withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
            });
    } catch (error: any) {
      setLoadingScreen(false);
      console.error(error.message);
    }
    setLoadingScreen(false);
    handleClose();
  };

  return (
    <div className={styles.registrationForm__container}>
      <Dialog
        // fullScreen={fullScreen}
        open={open}
        // TransitionComponent={Transition}
        keepMounted
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose();
          }
        }}
        // aria-describedby="alert-dialog-slide-description"
        // aria-labelledby="responsive-dialog-title"
        maxWidth="lg"
      >
        {loadingScreen && <LoadingScreen />}
        {welcomeScreen ? (
          <div className={styles.welcomeScreen__container}>
            <div className={styles.image__wrapper}>
              {/* <img src={Images.welcomePageBg} alt="" /> */}
            </div>
            <div className={styles.contents__wrapper}>
              <img src={"/images/welcomePageThankYou.png"} alt="" />
              <h2 className={styles.title}>Thank you for signing up !!</h2>
              <div className={styles.userProfile}>
                <PersonIcon className={`${styles.icon} ${styles.personIcon}`} />
                <p>
                  {userType === "CUSTOMER"
                    ? userInfo.userDetails?.Document?.customerName
                    : userInfo.userDetails?.Document?.vendorName}
                </p>
                <VerifiedIcon
                  className={`${styles.icon} ${styles.verificationIcon}`}
                />
              </div>
              <div className={styles.description}>
                {userType === "CUSTOMER" ? (
                  <p>
                    Congratulations on joining us! Get ready for a seamless
                    journey towards your dream wedding. <br /> Let&apos;s create
                    unforgettable memories together. Your perfect wedding starts
                    here!
                  </p>
                ) : (
                  <p>
                    Welcome aboard! Elevate wedding experiences with your
                    expertise and join our vibrant community.
                    <br /> Join us in making every wedding extraordinary.
                    Let&apos;s create magic together!
                  </p>
                )}
              </div>
              <button
                className={styles.continueBtn}
                onClick={() => setWelcomeScreen(false)}
              >
                Continue
              </button>
              {userType === "CUSTOMER" && (
                <button className={styles.skipBtn} onClick={handleClose}>
                  Skip! I will confirm later
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.registrationFormMain__wrapper}>
            <div className={styles.img__wrapper}>
              <div className={styles.companyInfo}>
                <img src={"/images/logo.jpg"} alt="EventifyConnect" />
                <p>EventifyConnect</p>
              </div>
              <div className={styles.bgCover}>
                <p>
                  Let&apos;s get <br /> <span>Started</span>
                </p>
              </div>
              <img
                src={"/images/userRegistrationPageBg2.jpg"}
                alt=""
                style={{
                  objectPosition:
                    formType === "FORM_FOUR" ? "center" : "left center",
                }}
              />
            </div>
            <div className={styles.contents__wrapper}>
              <div className={styles.formTitle__wrapper}>
                <h2 className={styles.form__title}>
                  {userType === "VENDOR" ? (
                    vendorType === "Banquet Hall" ? (
                      <span>Hall Information</span>
                    ) : (
                      <span>Vendor Information</span>
                    )
                  ) : (
                    <span>Customer Information</span>
                  )}
                </h2>
                <p className={styles["form__sub-title"]}>
                  {userType === "VENDOR" ? (
                    <span>Fill the from to become a part of the team</span>
                  ) : (
                    <span>Tell us more about yourself</span>
                  )}
                </p>
              </div>
              <div className={styles.progressIndicator__wrapper}>
                <div
                  className={`${styles["sub-wrapper"]} ${styles.currentForm}`}
                >
                  <div className={styles.formNumberIndicator}>
                    {formType === "FORM_ONE" ? (
                      <span>1</span>
                    ) : (
                      <DoneIcon className={styles.icon} />
                    )}
                  </div>
                  <p className={styles.tag}>Address</p>
                </div>
                <div
                  className={styles.progressBar}
                  style={{ ...progressBarStyle }}
                >
                  <div
                    style={
                      formType !== "FORM_ONE"
                        ? { ...beforeStyle, backgroundColor: "#007bff" }
                        : beforeStyle
                    }
                  ></div>
                </div>
                <div
                  className={`${styles["sub-wrapper"]} ${
                    formType !== "FORM_ONE" && styles.currentForm
                  }`}
                >
                  <div className={styles.formNumberIndicator}>
                    {formType === "FORM_ONE" || formType === "FORM_TWO" ? (
                      <span>2</span>
                    ) : (
                      <DoneIcon className={styles.icon} />
                    )}
                  </div>
                  <p className={styles.tag}>Register</p>
                </div>
                <div className={styles.progressBar} style={progressBarStyle}>
                  <div
                    style={
                      formType !== "FORM_ONE" && formType !== "FORM_TWO"
                        ? { ...beforeStyle, backgroundColor: "#007bff" }
                        : beforeStyle
                    }
                  ></div>
                </div>
                <div
                  className={`${styles["sub-wrapper"]} ${
                    formType !== "FORM_ONE" &&
                    formType !== "FORM_TWO" &&
                    styles.currentForm
                  }`}
                >
                  <div className={styles.formNumberIndicator}>
                    {formType !== "FORM_FOUR" ? (
                      <span>3</span>
                    ) : (
                      <DoneIcon className={styles.icon} />
                    )}
                  </div>
                  <p className={styles.tag}>Contact</p>
                </div>
                {userType === "VENDOR" && (
                  <>
                    <div
                      className={styles.progressBar}
                      style={progressBarStyle}
                    >
                      <div
                        style={
                          formType === "FORM_FOUR"
                            ? { ...beforeStyle, backgroundColor: "#007bff" }
                            : beforeStyle
                        }
                      ></div>
                    </div>
                    <div
                      className={`${styles["sub-wrapper"]} ${
                        formType === "FORM_FOUR" && styles.currentForm
                      }`}
                    >
                      <div className={styles.formNumberIndicator}>
                        {/* {formType === "FORM_FOUR" ? <span>4</span> : <DoneIcon />} */}
                        <span>4</span>
                      </div>
                      <p className={styles.tag}>Detailed</p>
                    </div>
                  </>
                )}
              </div>
              <form className={styles.form__container}>
                {formType === "FORM_ONE" && (
                  <div className={styles.userInput__wrapper}>
                    {userType === "CUSTOMER" ? (
                      <div className={styles.textField__wrapper}>
                        <div className={styles["sub-wrapper"]}>
                          <div className={styles.title}>First Name *</div>
                          <input
                            type="text"
                            name="firstName"
                            value={customerData.customerFirstName}
                            placeholder="John"
                            onChange={(e) =>
                              handleCustomerData(
                                "customerFirstName",
                                e.target.value
                              )
                            }
                            style={
                              customerDataErrorInfo.customerFirstName
                                ? { border: "2px solid red" }
                                : {}
                            }
                            className={styles.input}
                            spellCheck={false}
                          />
                          {customerDataErrorInfo.customerFirstName && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{customerDataErrorInfo.customerFirstName}</p>
                            </div>
                          )}
                        </div>
                        <div className={styles["sub-wrapper"]}>
                          <div className={styles.title}>Last Name *</div>
                          <input
                            type="text"
                            name="lastName"
                            value={customerData.customerLastName}
                            placeholder="Smith"
                            onChange={(e) =>
                              handleCustomerData(
                                "customerLastName",
                                e.target.value
                              )
                            }
                            style={
                              customerDataErrorInfo.customerLastName
                                ? { border: "2px solid red" }
                                : {}
                            }
                            className={styles.input}
                            spellCheck={false}
                          />
                          {customerDataErrorInfo.customerLastName && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{customerDataErrorInfo.customerLastName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.textField}>
                        <label className={styles.title}>
                          {vendorType === "Banquet Hall" ? (
                            <span>Hall Name *</span>
                          ) : (
                            <span>Company Name *</span>
                          )}
                        </label>
                        {vendorType === "Banquet Hall" ? (
                          <>
                            <input
                              type="text"
                              name="hallName"
                              value={hallVendorData.hallName}
                              onChange={(e) =>
                                handleHallVendorData("hallName", e.target.value)
                              }
                              style={
                                hallVendorDataErrorInfo.hallName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder={"Enter hall name"}
                              className={styles.input}
                              spellCheck={false}
                            />
                            {hallVendorDataErrorInfo.hallName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{hallVendorDataErrorInfo.hallName}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <input
                              type="text"
                              name="companyName"
                              value={otherVendorData.companyName}
                              onChange={(e) =>
                                handleOtherVendorData(
                                  "companyName",
                                  e.target.value
                                )
                              }
                              style={
                                otherVendorDataErrorInfo.companyName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder={"Enter company name"}
                              className={styles.input}
                              spellCheck={false}
                            />
                            {otherVendorDataErrorInfo.companyName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{otherVendorDataErrorInfo.companyName}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <div className={styles.textField}>
                      <div className={styles.title}>Address *</div>
                      <>
                        <input
                          type="text"
                          name="address"
                          value={commonData.address}
                          onChange={(e) =>
                            handleCommonData("address", e.target.value)
                          }
                          style={
                            commonDataErrorInfo.address
                              ? { border: "2px solid red" }
                              : {}
                          }
                          placeholder="Enter the address"
                          className={styles.input}
                          spellCheck={false}
                        />
                        {commonDataErrorInfo.address && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>{commonDataErrorInfo.address}</p>
                          </div>
                        )}
                      </>
                    </div>
                    <div className={styles.textField}>
                      <div className={styles.title}>Landmark *</div>
                      <>
                        <input
                          type="text"
                          name="landmark"
                          value={commonData.landmark}
                          onChange={(e) =>
                            handleCommonData("landmark", e.target.value)
                          }
                          style={
                            commonDataErrorInfo.landmark
                              ? { border: "2px solid red" }
                              : {}
                          }
                          placeholder="Enter the landmark"
                          className={styles.input}
                          spellCheck={false}
                        />
                        {commonDataErrorInfo.landmark && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>{commonDataErrorInfo.landmark}</p>
                          </div>
                        )}
                      </>
                    </div>
                    <div className={styles.textField__wrapper}>
                      <div className={styles["sub-wrapper"]}>
                        <div className={styles.title}>Country *</div>
                        <>
                          <div
                            style={
                              commonDataErrorInfo.country
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <Select
                              styles={customSelectStyles}
                              options={
                                Array.isArray(data.countries.data)
                                  ? data.countries.data?.map(
                                      (country: string) => ({
                                        value: country,
                                        label: country,
                                      })
                                    )
                                  : null
                              }
                              value={
                                commonData.country
                                  ? {
                                      value: commonData.country,
                                      label: commonData.country,
                                    }
                                  : null
                              }
                              onChange={(
                                selectedOption: SingleValue<ReactSelectOptionType>
                              ) =>
                                handleCommonData(
                                  "country",
                                  selectedOption?.value
                                )
                              }
                              placeholder="Select your country"
                              className={styles.selectInput}
                              components={{
                                DropdownIndicator: () => (
                                  <KeyboardArrowDownIcon
                                    style={{ color: "#007bff" }}
                                  />
                                ),
                              }}
                              menuShouldScrollIntoView={false}
                              hideSelectedOptions={false}
                              closeMenuOnSelect
                              isClearable={false}
                              isSearchable
                            />
                          </div>
                          {commonDataErrorInfo.country && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{commonDataErrorInfo.country}</p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles["sub-wrapper"]}>
                        <div className={styles.title}>State *</div>
                        <>
                          <div
                            style={
                              commonDataErrorInfo.state
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <Select
                              styles={customSelectStyles}
                              options={
                                data.states.data &&
                                Array.isArray(data.states.data)
                                  ? data.states.data?.map((state: string) => ({
                                      value: state,
                                      label: state,
                                    }))
                                  : null
                              }
                              value={
                                commonData.state
                                  ? {
                                      value: commonData.state,
                                      label: commonData.state,
                                    }
                                  : null
                              }
                              onChange={(
                                selectedOption: SingleValue<ReactSelectOptionType>
                              ) =>
                                handleCommonData("state", selectedOption?.value)
                              }
                              placeholder="Select your state"
                              className={styles.selectInput}
                              components={{
                                DropdownIndicator: () => (
                                  <KeyboardArrowDownIcon
                                    style={{ color: "#007bff" }}
                                  />
                                ),
                              }}
                              menuShouldScrollIntoView={false}
                              hideSelectedOptions={false}
                              closeMenuOnSelect
                              isClearable={false}
                              isSearchable
                            />
                          </div>
                          {commonDataErrorInfo.state && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{commonDataErrorInfo.state}</p>
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                    <div className={styles.textField__wrapper}>
                      <div className={styles["sub-wrapper"]}>
                        <div className={styles.title}>City *</div>
                        <>
                          <div
                            style={
                              commonDataErrorInfo.city
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <Select
                              styles={customSelectStyles}
                              options={
                                data.citiesOfState.data &&
                                Array.isArray(data.citiesOfState.data)
                                  ? data.citiesOfState.data?.map(
                                      (city: string) => ({
                                        value: city,
                                        label: city,
                                      })
                                    )
                                  : null
                              }
                              value={
                                commonData.city
                                  ? {
                                      value: commonData.city,
                                      label: commonData.city,
                                    }
                                  : null
                              }
                              onChange={(
                                selectedOption: SingleValue<ReactSelectOptionType>
                              ) =>
                                handleCommonData("city", selectedOption?.value)
                              }
                              placeholder="Select your city"
                              className={styles.selectInput}
                              components={{
                                DropdownIndicator: () => (
                                  <KeyboardArrowDownIcon
                                    style={{ color: "#007bff" }}
                                  />
                                ),
                              }}
                              menuShouldScrollIntoView={false}
                              hideSelectedOptions={false}
                              closeMenuOnSelect
                              isClearable={false}
                              isSearchable
                            />
                          </div>
                          {commonDataErrorInfo.city && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{commonDataErrorInfo.city}</p>
                            </div>
                          )}
                        </>
                      </div>
                      <div
                        className={`${styles.taluk} ${styles["sub-wrapper"]}`}
                      >
                        <div className={styles.title}>Taluk *</div>
                        <>
                          <input
                            type="text"
                            name="taluk"
                            value={commonData.taluk}
                            onChange={(e) =>
                              handleCommonData("taluk", e.target.value)
                            }
                            style={
                              commonDataErrorInfo.taluk
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Enter the taluk"
                            className={styles.input}
                            spellCheck={false}
                          />
                          {commonDataErrorInfo.taluk && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{commonDataErrorInfo.taluk}</p>
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                    <div
                      className={`${styles.textField} ${styles.pinCode__wrapper}`}
                    >
                      <div className={styles.title}>Pincode *</div>
                      <>
                        <input
                          type="text"
                          name="pincode"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          onKeyDown={(e) => {
                            // Allow: backspace, delete, tab, escape, enter, and .
                            if (
                              [46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !==
                                -1 ||
                              // Allow: Ctrl+A/Ctrl+C/Ctrl+V/Ctrl+X
                              (e.keyCode === 65 && e.ctrlKey === true) || // Ctrl+A
                              (e.keyCode === 67 && e.ctrlKey === true) || // Ctrl+C
                              (e.keyCode === 86 && e.ctrlKey === true) || // Ctrl+V
                              (e.keyCode === 88 && e.ctrlKey === true) // Ctrl+X
                            ) {
                              // let it happen, don't do anything
                              return;
                            }
                            // Ensure that it is a number and stop the keypress
                            if (
                              (e.shiftKey ||
                                e.keyCode < 48 ||
                                e.keyCode > 57) &&
                              (e.keyCode < 96 || e.keyCode > 105)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          value={commonData.pincode}
                          onChange={(e) =>
                            handleCommonData("pincode", e.target.value)
                          }
                          style={
                            commonDataErrorInfo.pincode
                              ? { border: "2px solid red" }
                              : {}
                          }
                          placeholder="Enter your pincode"
                          className={styles.input}
                          spellCheck={false}
                        />
                        {commonDataErrorInfo.pincode && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>{commonDataErrorInfo.pincode}</p>
                          </div>
                        )}
                      </>
                    </div>
                  </div>
                )}
                {formType === "FORM_TWO" && (
                  <div
                    className={`${styles.userInput__wrapper} ${styles.registrationDetails__wrapper}`}
                  >
                    {userType === "CUSTOMER" && (
                      <>
                        <div className={styles.profilePic__wrapper}>
                          <div className={styles.profilePic}>
                            <img
                              alt="Profile Image"
                              src={
                                customerData.customerProfileImage
                                  ? URL.createObjectURL(
                                      customerData.customerProfileImage
                                    )
                                  : ""
                              }
                              className={styles.avatar}
                            />
                            {customerData.customerProfileImage ? (
                              <div
                                className={styles.icon__wrapper}
                                onClick={(e) =>
                                  handleCustomerData("customerProfileImage", "")
                                }
                              >
                                <CloseIcon className={styles.icon} />
                              </div>
                            ) : (
                              <div
                                className={styles.icon__wrapper}
                                onClick={(e) => {
                                  if (profilePicInputRef.current) {
                                    profilePicInputRef.current.click();
                                  }
                                }}
                              >
                                <AddIcon className={styles.icon} />
                              </div>
                            )}
                          </div>
                          <input
                            placeholder="files"
                            ref={profilePicInputRef}
                            type="file"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                handleCustomerData(
                                  "customerProfileImage",
                                  files[0]
                                );
                              }
                            }}
                            className={styles.profilePicInput}
                            style={{ display: "none" }}
                            accept="image/*"
                          />
                          <button disabled className={styles.profileBtn}>
                            Profile Pic
                          </button>
                        </div>
                        <div className={styles.textField}>
                          <label className={styles.title}>Document Type</label>
                          <Select
                            styles={customSelectStyles}
                            placeholder="Select document type"
                            options={IdDocumentTypes.map((id) => ({
                              value: id,
                              label: id,
                            }))}
                            value={{
                              value: customerData.customerDocumentType,
                              label: customerData.customerDocumentType,
                            }}
                            onChange={(
                              selectedOption: SingleValue<ReactSelectOptionType>
                            ) => {
                              if (selectedOption && selectedOption.value) {
                                handleCustomerData(
                                  "customerDocumentType",
                                  selectedOption.value
                                );
                              }
                            }}
                            className={styles.selectInput}
                            components={{
                              DropdownIndicator: () => (
                                <KeyboardArrowDownIcon
                                  style={{ color: "#007bff" }}
                                />
                              ),
                            }}
                            menuShouldScrollIntoView={false}
                            hideSelectedOptions={false}
                            closeMenuOnSelect
                            isClearable={false}
                            isSearchable
                          />
                        </div>
                      </>
                    )}
                    <div className={styles.textField}>
                      <label className={styles.title}>
                        {userType === "CUSTOMER" ? (
                          <span>Document Id</span>
                        ) : (
                          <span>Registration No</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="registerNo"
                        value={commonData.registerNo}
                        onChange={(e) =>
                          handleCommonData("registerNo", e.target.value)
                        }
                        placeholder={
                          userType === "CUSTOMER"
                            ? "Enter document id"
                            : "Enter registration number"
                        }
                        className={styles.input}
                        spellCheck={false}
                      />
                    </div>
                    {userType === "VENDOR" && (
                      <>
                        <div className={styles.textField}>
                          <label className={styles.title}>
                            Registration Date
                          </label>
                          <input
                            type="date"
                            value={commonData.registerDate}
                            placeholder="dd-mm-yyyy"
                            className={styles.input}
                            onChange={(e) =>
                              handleCommonData("registerDate", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.img__dropZone}>
                          <label className={styles.title}>
                            Registration Document{" "}
                          </label>
                          {!commonData.registerDocument ? (
                            <div
                              className={styles.imgUploadArea}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleCommonData(
                                  "registerDocument",
                                  e.dataTransfer.files[0]
                                );
                              }}
                              onClick={(e) => {
                                if (fileInputRef.current) {
                                  fileInputRef.current.click();
                                }
                              }}
                            >
                              <UploadFileIcon className={styles.icon} />
                              <p className={styles.text}>
                                Drag file to upload or <span>Browse</span>
                              </p>
                              <input
                                placeholder="registerDoc"
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    handleCommonData(
                                      "registerDocument",
                                      files[0]
                                    );
                                  }
                                }}
                                className={styles.fileInput}
                                style={{ display: "none" }}
                              />
                            </div>
                          ) : (
                            <div className={styles.documentArea}>
                              <button
                                title="registerDoc"
                                onClick={(e) =>
                                  handleCommonData("registerDocument", "")
                                }
                              >
                                <CloseIcon className={styles.closeIcon} />
                              </button>
                              <img
                                src={getRegisterDocumentType()}
                                alt=""
                                className={styles.documentIcon}
                              />
                              <label className={styles.fileName}>
                                {commonData.registerDocument?.name}
                              </label>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {formType === "FORM_THREE" && (
                  <div
                    className={`${styles.userInput__wrapper} ${styles.contactDetails__wrapper}`}
                  >
                    <div className={`${styles.formSubTitle__wrapper}`}>
                      <h2 className={`${styles.formSubTitle}`}>
                        {formContactType === "PRIMARY" ? (
                          <span> Primary </span>
                        ) : (
                          <span>Secondary </span>
                        )}
                        Contact Info
                      </h2>
                      <div
                        className={styles.formSwitchTitle}
                        onClick={handleFormContactTypeChange}
                      >
                        {formContactType === "PRIMARY" ? (
                          <AddIcon className={styles.icon} />
                        ) : (
                          <FaEdit className={styles.icon} />
                        )}
                        <p className={styles.switchTitle}>
                          {formContactType === "PRIMARY" ? (
                            <span>Secondary</span>
                          ) : (
                            <span>Primary </span>
                          )}
                          Contact
                        </p>
                      </div>
                    </div>
                    {userType === "VENDOR" &&
                      (formContactType === "PRIMARY" ? (
                        <div className={styles.textField__wrapper}>
                          <div className={styles["sub-wrapper"]}>
                            <label className={styles.title}>
                              First Name *{" "}
                            </label>
                            <>
                              <input
                                type="text"
                                name="mainContactFirstName"
                                value={commonData.mainContactFirstName}
                                onChange={(e) =>
                                  handleCommonData(
                                    "mainContactFirstName",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.mainContactFirstName
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Logan"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.mainContactFirstName && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>
                                    {commonDataErrorInfo.mainContactFirstName}
                                  </p>
                                </div>
                              )}
                            </>
                          </div>
                          <div className={styles["sub-wrapper"]}>
                            <label className={styles.title}>Last Name * </label>
                            <>
                              <input
                                type="text"
                                name="mainContactLastName"
                                value={commonData.mainContactLastName}
                                onChange={(e) =>
                                  handleCommonData(
                                    "mainContactLastName",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.mainContactLastName
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Sanderz"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.mainContactLastName && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>
                                    {commonDataErrorInfo.mainContactLastName}
                                  </p>
                                </div>
                              )}
                            </>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.textField__wrapper}>
                          <div className={styles["sub-wrapper"]}>
                            <label className={styles.title}>First Name </label>
                            <>
                              <input
                                type="text"
                                name="alternateContactFirstName"
                                value={commonData.alternateContactFirstName}
                                onChange={(e) =>
                                  handleCommonData(
                                    "alternateContactFirstName",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.alternateContactFirstName
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Logan"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.alternateContactFirstName && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>
                                    {
                                      commonDataErrorInfo.alternateContactFirstName
                                    }
                                  </p>
                                </div>
                              )}
                            </>
                          </div>
                          <div className={styles["sub-wrapper"]}>
                            <label className={styles.title}>Last Name </label>
                            <>
                              <input
                                type="text"
                                name="alternateContactLastName"
                                value={commonData.alternateContactLastName}
                                onChange={(e) =>
                                  handleCommonData(
                                    "alternateContactLastName",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.alternateContactLastName
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Sanderz"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.alternateContactLastName && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>
                                    {
                                      commonDataErrorInfo.alternateContactLastName
                                    }
                                  </p>
                                </div>
                              )}
                            </>
                          </div>
                        </div>
                      ))}
                    {(userType === "VENDOR" ||
                      (userType === "CUSTOMER" &&
                        formContactType === "PRIMARY")) &&
                      (formContactType === "PRIMARY" ? (
                        <>
                          <div className={styles.textField}>
                            <label className={styles.title}>
                              Designation *{" "}
                            </label>
                            <>
                              <input
                                type="text"
                                name="mainDesignation"
                                value={commonData.mainDesignation}
                                onChange={(e) =>
                                  handleCommonData(
                                    "mainDesignation",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.mainDesignation
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Cheif Manager"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.mainDesignation && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>{commonDataErrorInfo.mainDesignation}</p>
                                </div>
                              )}
                            </>
                          </div>
                          <div className={styles.textField}>
                            <label className={styles.title}>
                              Office Number *{" "}
                            </label>
                            <>
                              <div
                                className={styles.phoneInput}
                                style={
                                  commonDataErrorInfo.mainOfficeNo
                                    ? {
                                        border: "2px solid red",
                                        borderRadius: "5px",
                                      }
                                    : {}
                                }
                              >
                                <PhoneInput
                                  country={"us"}
                                  value={commonData.mainOfficeNo}
                                  onChange={(value, country) =>
                                    handleCommonData(
                                      "mainOfficeNo",
                                      "+" + value
                                    )
                                  }
                                  inputProps={{
                                    name: "phone",
                                    required: true,
                                    autoFocus: true,
                                    placeholder: "Enter phone number",
                                    style: { width: "100%" },
                                  }}
                                  inputClass="input"
                                />
                              </div>
                              {commonDataErrorInfo.mainOfficeNo && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>{commonDataErrorInfo.mainOfficeNo}</p>
                                </div>
                              )}
                            </>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.textField}>
                            <label className={styles.title}>Designation</label>
                            <>
                              <input
                                type="text"
                                name="alternateDesignation"
                                value={commonData.alternateDesignation}
                                onChange={(e) =>
                                  handleCommonData(
                                    "alternateDesignation",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.alternateDesignation
                                    ? { border: "2px solid red" }
                                    : {}
                                }
                                placeholder="Chief Manager"
                                className={styles.input}
                                spellCheck="false"
                              />
                              {commonDataErrorInfo.alternateDesignation && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>
                                    {commonDataErrorInfo.alternateDesignation}
                                  </p>
                                </div>
                              )}
                            </>
                          </div>
                          <div className={styles.textField}>
                            <label className={styles.title}>
                              Office Number
                            </label>
                            <>
                              <div
                                className={styles.phoneInput}
                                style={
                                  commonDataErrorInfo.alternateOfficeNo
                                    ? {
                                        border: "2px solid red",
                                        borderRadius: "5px",
                                      }
                                    : {}
                                }
                              >
                                <PhoneInput
                                  country={"us"}
                                  value={commonData.alternateOfficeNo}
                                  onChange={(value, country) =>
                                    handleCommonData(
                                      "alternateOfficeNo",
                                      "+" + value
                                    )
                                  }
                                  inputProps={{
                                    name: "phone",
                                    required: true,
                                    autoFocus: true,
                                    placeholder: "Enter phone number",
                                    style: { width: "100%" },
                                  }}
                                  inputClass="input"
                                />
                              </div>
                              {commonDataErrorInfo.alternateOfficeNo && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>{commonDataErrorInfo.alternateOfficeNo}</p>
                                </div>
                              )}
                            </>
                          </div>
                        </>
                      ))}
                    {formContactType === "PRIMARY" ? (
                      <>
                        <div className={styles.textField}>
                          <label className={styles.title}>
                            Mobile Number *{" "}
                          </label>
                          <>
                            <div
                              className={styles.phoneInput}
                              style={
                                commonDataErrorInfo.mainMobileNo
                                  ? {
                                      border: "2px solid red",
                                      borderRadius: "5px",
                                    }
                                  : {}
                              }
                            >
                              <PhoneInput
                                country={"us"}
                                value={commonData.mainMobileNo}
                                // eslint-disable-next-line no-unused-vars
                                onChange={(value, country) =>
                                  handleCommonData("mainMobileNo", "+" + value)
                                }
                                inputProps={{
                                  name: "phone",
                                  required: true,
                                  autoFocus: true,
                                  placeholder: "Enter phone number",
                                  style: { width: "100%" },
                                }}
                                inputClass="input"
                              />
                            </div>
                            {commonDataErrorInfo.mainMobileNo && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{commonDataErrorInfo.mainMobileNo}</p>
                              </div>
                            )}
                          </>
                        </div>
                        <div className={styles.textField}>
                          <label className={styles.title}>
                            Email Address *
                          </label>
                          <>
                            <input
                              type="text"
                              name="mainEmail"
                              value={commonData.mainEmail}
                              onChange={(e) =>
                                handleCommonData("mainEmail", e.target.value)
                              }
                              style={
                                commonDataErrorInfo.mainEmail
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Enter email id"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {commonDataErrorInfo.mainEmail && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{commonDataErrorInfo.mainEmail}</p>
                              </div>
                            )}
                          </>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.textField}>
                          <label className={styles.title}>Mobile Number</label>
                          <>
                            <div
                              className={styles.phoneInput}
                              style={
                                commonDataErrorInfo.alternateMobileNo
                                  ? {
                                      border: "2px solid red",
                                      borderRadius: "5px",
                                    }
                                  : {}
                              }
                            >
                              <PhoneInput
                                country={"us"}
                                value={commonData.alternateMobileNo}
                                // eslint-disable-next-line no-unused-vars
                                onChange={(value, country) =>
                                  handleCommonData(
                                    "alternateMobileNo",
                                    "+" + value
                                  )
                                }
                                inputProps={{
                                  name: "phone",
                                  required: true,
                                  autoFocus: true,
                                  placeholder: "Enter phone number",
                                  style: { width: "100%" },
                                }}
                                inputClass="input"
                              />
                            </div>
                            {commonDataErrorInfo.alternateMobileNo && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{commonDataErrorInfo.alternateMobileNo}</p>
                              </div>
                            )}
                          </>
                        </div>
                        <div className={styles.textField}>
                          <label className={styles.title}>Email Address</label>
                          <>
                            <input
                              type="text"
                              name="alternateEmail"
                              value={commonData.alternateEmail}
                              onChange={(e) =>
                                handleCommonData(
                                  "alternateEmail",
                                  e.target.value
                                )
                              }
                              style={
                                commonDataErrorInfo.alternateEmail
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Enter email id"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {commonDataErrorInfo.alternateEmail && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>{commonDataErrorInfo.alternateEmail}</p>
                              </div>
                            )}
                          </>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {formType === "FORM_FOUR" && (
                  <div
                    className={`${styles.detailedInfo__wrapper}`}
                  >
                    {userType === "VENDOR" && (
                      <>
                        <div className={`${styles.userInput__wrapper} ${styles.images__wrapper}`}>
                          <div
                            className={styles["sub-wrapper"]}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleImageChange(e);
                            }}
                          >
                            <div className={styles.mainImage}>
                              {commonData.images?.[0] ? (
                                <>
                                  <button
                                    title="removeBtn"
                                    type="button"
                                    onClick={(e) => {
                                      const updatedImages = [
                                        ...commonData.images,
                                      ];
                                      updatedImages.splice(0, 1);
                                      handleCommonData("images", updatedImages);
                                    }}
                                    className={styles.removeBtn}
                                  >
                                    <CloseIcon className={styles.icon} />
                                  </button>
                                  <img
                                    src={URL.createObjectURL(
                                      commonData.images?.[0]
                                    )}
                                    alt=""
                                    className={styles.image}
                                  />
                                </>
                              ) : (
                                <div
                                  className={styles.image}
                                  onClick={(e) => {
                                    if (vendorPicturesInputRef.current) {
                                      vendorPicturesInputRef.current.click();
                                    }
                                  }}
                                >
                                  <UploadFileIcon
                                    className={styles.uploadFileIcon}
                                  />
                                  <p className={styles.uploadFileText}>
                                    Drag file to upload or <span>Browse</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className={styles.standbyImages}>
                              <div className={styles.image}>
                                {commonData.images?.[1] ? (
                                  <>
                                    <button
                                      title="closeBtn"
                                      className={styles.removeBtn}
                                      type="button"
                                      onClick={(e) => {
                                        const updatedImages = [
                                          ...commonData.images,
                                        ];
                                        updatedImages.splice(1, 1);
                                        handleCommonData(
                                          "images",
                                          updatedImages
                                        );
                                      }}
                                    >
                                      <CloseIcon className={styles.icon} />
                                    </button>
                                    <img
                                      src={URL.createObjectURL(
                                        commonData.images?.[1]
                                      )}
                                      alt=""
                                      className={styles.img}
                                    />
                                  </>
                                ) : (
                                  <div
                                    className={styles.img}
                                    onClick={(e) => {
                                      if (vendorPicturesInputRef.current) {
                                        vendorPicturesInputRef.current.click();
                                      }
                                    }}
                                  >
                                    <UploadFileIcon
                                      className={styles.uploadFileIcon}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className={styles.image}>
                                {commonData.images?.[2] ? (
                                  <>
                                    <button
                                      title="closeIcon"
                                      className={styles.removeBtn}
                                      type="button"
                                      onClick={(e) => {
                                        const updatedImages = [
                                          ...commonData.images,
                                        ];
                                        updatedImages.splice(2, 1);
                                        handleCommonData(
                                          "images",
                                          updatedImages
                                        );
                                      }}
                                    >
                                      <CloseIcon className={styles.icon} />
                                    </button>
                                    <img
                                      src={URL.createObjectURL(
                                        commonData.images?.[2]
                                      )}
                                      alt=""
                                      className={styles.img}
                                    />
                                  </>
                                ) : (
                                  <div
                                    className={styles.img}
                                    onClick={(e) => {
                                      if (vendorPicturesInputRef.current) {
                                        vendorPicturesInputRef.current.click();
                                      }
                                    }}
                                  >
                                    <UploadFileIcon
                                      className={styles.uploadFileIcon}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className={styles.image}>
                                {commonData.images?.[3] ? (
                                  <>
                                    <button
                                      title="closeIcon"
                                      className={styles.removeBtn}
                                      type="button"
                                      onClick={(e) => {
                                        const updatedImages = [
                                          ...commonData.images,
                                        ];
                                        updatedImages.splice(3, 1);
                                        handleCommonData(
                                          "images",
                                          updatedImages
                                        );
                                      }}
                                    >
                                      <CloseIcon className={styles.icon} />
                                    </button>
                                    <img
                                      src={URL.createObjectURL(
                                        commonData.images?.[3]
                                      )}
                                      alt=""
                                      className={styles.img}
                                    />
                                  </>
                                ) : (
                                  <div
                                    className={styles.img}
                                    onClick={(e) => {
                                      if (vendorPicturesInputRef.current) {
                                        vendorPicturesInputRef.current.click();
                                      }
                                    }}
                                  >
                                    <UploadFileIcon
                                      className={styles.uploadFileIcon}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className={styles.image}>
                                {commonData.images?.[4] ? (
                                  <img
                                    src={URL.createObjectURL(
                                      commonData.images?.[4]
                                    )}
                                    alt=""
                                    className={styles.img}
                                  />
                                ) : (
                                  <div
                                    className={styles.img}
                                    onClick={(e) => {
                                      if (vendorPicturesInputRef.current) {
                                        vendorPicturesInputRef.current.click();
                                      }
                                    }}
                                  >
                                    <UploadFileIcon
                                      className={styles.uploadFileIcon}
                                    />
                                  </div>
                                )}
                                {userType === "VENDOR" &&
                                  vendorType === "Banquet Hall" &&
                                  commonData.images?.length > 5 && (
                                    <div className={styles.moreImagesIndicator}>
                                      <span>
                                        +{commonData.images.length - 4} more
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                          {commonDataErrorInfo.images && (
                            <div className={styles.imagesInputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{commonDataErrorInfo.images}</p>
                            </div>
                          )}
                          <input
                            placeholder="vendorPictures"
                            ref={vendorPicturesInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{
                              opacity: 0,
                              visibility: "hidden",
                              position: "absolute",
                              zIndex: -1,
                            }}
                          />
                          <div className={styles.uploadBtn__wrapper}>
                            <button
                              type="button"
                              className={styles.uploadBtn}
                              onClick={(e) => {
                                if (vendorPicturesInputRef.current) {
                                  vendorPicturesInputRef.current.click();
                                }
                              }}
                            >
                              Choose Files
                            </button>
                            <p className={styles.fileCountText}>
                              {commonData.images
                                ? `(${commonData.images.length}/10) selected`
                                : "(0/10) selected"}
                            </p>
                          </div>
                        </div>
                        <div className={styles.subContents__wrapper}>
                          <div className={styles.textField}>
                            <label className={styles.title}>
                              {userType === "VENDOR" &&
                              vendorType === "Banquet Hall" ? (
                                <span>Hall Description *</span>
                              ) : (
                                <span>Business Description *</span>
                              )}
                            </label>
                            <>
                              <textarea
                                name="description"
                                value={commonData.description}
                                onChange={(e) =>
                                  handleCommonData(
                                    "description",
                                    e.target.value
                                  )
                                }
                                style={
                                  commonDataErrorInfo.description
                                    ? {
                                        border: "2px solid red",
                                        height: "7rem",
                                      }
                                    : { height: "7rem" }
                                }
                                placeholder="Write something ..."
                                className={styles.input}
                                spellCheck={false}
                              />
                              {commonDataErrorInfo.description && (
                                <div className={styles.inputError}>
                                  <ErrorIcon className={styles.icon} />
                                  <p>{commonDataErrorInfo.description}</p>
                                </div>
                              )}
                            </>
                          </div>
                          {userType === "VENDOR" &&
                            vendorType === "Banquet Hall" && (
                              <>
                                <div className={styles.textField__wrapper}>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      Seating Capacity *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallCapacity"
                                        value={hallVendorData.hallCapacity}
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallCapacity",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallCapacity
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="Enter seating capacity"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallCapacity && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {
                                              hallVendorDataErrorInfo.hallCapacity
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      No. of Rooms *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallRooms"
                                        value={hallVendorData.hallRooms}
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallRooms",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallRooms
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="Enter room count"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallRooms && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {hallVendorDataErrorInfo.hallRooms}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                </div>
                                <div className={styles.textField__wrapper}>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      VegFood *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallVegRate"
                                        value={hallVendorData.hallVegRate}
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallVegRate",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallVegRate
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="Veg rate per plate"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallVegRate && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {
                                              hallVendorDataErrorInfo.hallVegRate
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      Non-VegFood *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallNonVegRate"
                                        value={hallVendorData.hallNonVegRate}
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallNonVegRate",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallNonVegRate
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="N-Veg rate per plate"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallNonVegRate && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {
                                              hallVendorDataErrorInfo.hallNonVegRate
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                </div>
                                <div className={styles.textField__wrapper}>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      Parking *
                                    </label>
                                    <div className={styles.radioInput}>
                                      <div className={styles.radio}>
                                        <input
                                          placeholder="hall parking available"
                                          type="radio"
                                          name="parking"
                                          value="AVAILABLE"
                                          checked={
                                            hallVendorData.hallParking ===
                                            "AVAILABLE"
                                          }
                                          onChange={(e) =>
                                            handleHallVendorData(
                                              "hallParking",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <span>Available</span>
                                      </div>
                                      <div className={styles.radio}>
                                        <input
                                          placeholder="hall parking unavailable"
                                          type="radio"
                                          name="parking"
                                          value="UNAVAILABLE"
                                          checked={
                                            hallVendorData.hallParking ===
                                            "UNAVAILABLE"
                                          }
                                          onChange={(e) =>
                                            handleHallVendorData(
                                              "hallParking",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <span>UnAvailable</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      Parking Capacity *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallParkingCapacity"
                                        value={
                                          hallVendorData.hallParkingCapacity
                                        }
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallParkingCapacity",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallParkingCapacity
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="No of days"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallParkingCapacity && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {
                                              hallVendorDataErrorInfo.hallParkingCapacity
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                </div>
                                <div
                                  className={`${styles.textField} ${styles.hallParkingCapacity__wrapper}`}
                                >
                                  <div className={styles["sub-wrapper"]}>
                                    <label className={styles.title}>
                                      Freez Day *
                                    </label>
                                    <>
                                      <input
                                        type="number"
                                        name="hallFreezDay"
                                        value={hallVendorData.hallFreezDay}
                                        onChange={(e) =>
                                          handleHallVendorData(
                                            "hallFreezDay",
                                            e.target.value
                                          )
                                        }
                                        style={
                                          hallVendorDataErrorInfo.hallFreezDay
                                            ? { border: "2px solid red" }
                                            : {}
                                        }
                                        placeholder="No of days"
                                        className={styles.input}
                                      />
                                      {hallVendorDataErrorInfo.hallFreezDay && (
                                        <div className={styles.inputError}>
                                          <ErrorIcon className={styles.icon} />
                                          <p>
                                            {
                                              hallVendorDataErrorInfo.hallFreezDay
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </form>
              <div className={styles.navigation__btns}>
                <button
                  className={styles.btn}
                  type="button"
                  onClick={handlePrevBtnClick}
                >
                  Prev
                </button>
                <button
                  className={styles.btn}
                  onClick={handleNextBtnClick}
                  type="button"
                >
                  {formType === "FORM_FOUR" ||
                  (userType === "CUSTOMER" && formType === "FORM_THREE") ? (
                    <span>Submit</span>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
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

export default UserRegistrationFormComponent;
