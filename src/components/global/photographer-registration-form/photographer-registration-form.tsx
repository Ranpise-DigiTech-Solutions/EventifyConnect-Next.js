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
import { PhotographerMasterSchemaType } from "@/app/api/schemas/photographer-master";
import {
  PhotographerDataErrorInfoType,
  PhotographerDataType,
  ReactSelectOptionType,
} from "@/lib/types";
import { RootState } from "@/redux/store";
import { fetchCitiesOfState, fetchStates } from "@/redux/thunks/data";

import "react-phone-input-2/lib/style.css";
import styles from "./photographer-registration-form.module.scss";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { firebaseStorage } from "@/lib/db/firebase";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";

type Props = {
  open: boolean;
  handleClose: () => void;
};

const photographerDataTemplate: PhotographerDataType = {
  companyName: "",
  companyAddress: "",
  companyCity: "",
  companyPincode: 0,
  companyState: "",
  companyTaluk: "",
  companyCountry: "India",
  companyLandmark: "",
  vendorRegisterNo: "",
  vendorRegisterDate: "",
  vendorRegisterDocument: "",
  vendorRegisterDocumentUrl: "",
  vendorMainContactFirstName: "",
  vendorMainContactLastName: "",
  vendorMainDesignation: "",
  vendorMainOfficeNo: "+91",
  vendorMainMobileNo: "+91",
  vendorMainEmail: "",
  vendorAlternateContactFirstName: "",
  vendorAlternateContactLastName: "",
  vendorAlternateDesignation: "",
  vendorAlternateOfficeNo: "+91",
  vendorAlternateMobileNo: "+91",
  vendorAlternateEmail: "",
  vendorDescription: "",
  vendorEventTypes: [],
  vendorImages: [],
  vendorImagesUrl: [],
  vendorExperience: 0,
  vendorPortfolioURL: "",
  vendorSocialMediaLinks: {
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  },
  vendorCertificates: [],
  vendorServiceAreas: [],
  vendorEquipment: [],
  vendorPackagesOffered: [],
  vendorTravelAvailability: "",
};

const photographerDataErrorInfoTemplate: PhotographerDataErrorInfoType = {
  ...photographerDataTemplate,
  companyPincode: "",
  vendorRegisterDate: "",
  vendorEventTypes: "",
  vendorImages: "",
  vendorExperience: "",
  vendorSocialMediaLinks: "",
  vendorMainOfficeNo: "",
  vendorMainMobileNo: "",
  vendorAlternateOfficeNo: "",
  vendorAlternateMobileNo: "",
  vendorCertificates: "",
  vendorServiceAreas: "",
  vendorEquipment: "",
  vendorPackagesOffered: "",
  companyCountry: "",
};

const PhotographerRegistrationForm = ({ open, handleClose }: Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const dispatch = useAppDispatch();
  const data = useAppSelector((state: RootState) => state.dataInfo); // COUNTRIES, STATES & CITIES
  const userInfo = useAppSelector((state: RootState) => state.userInfo); // details of registered user.

  const [loadingScreen, setLoadingScreen] = useState<boolean>(false); // toggle Loading Screen
  const [formType, setFormType] = useState("FORM_ONE"); //  FORM_ONE, FORM_TWO, FORM_THREE, FORM_FOUR
  const [formContactType, setFormContactType] = useState("PRIMARY"); // PRIMARY or SECONDARY
  const [formErrorUpdateFlag, setFormErrorUpdateFlag] =
    useState<boolean>(false);
  const [userConfirmationDialog, setUserConfirmationDialog] =
    useState<boolean>(false); // toggle user confirmation dialog
  const [userConfirmation, setUserConfirmation] = useState<boolean>(false); // ask user whether the entered details are correct to the best of his/her knowledge.
  const [isFileUploadComplete, setIsFileUploadComplete] =
    useState<boolean>(false); // to toggle submit

  const userType = userInfo.userDetails.userType;
  const vendorType = userInfo.userDetails.vendorType;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vendorPicturesInputRef = useRef<HTMLInputElement | null>(null);

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

  const [photographerData, setPhotographerData] =
    useState<PhotographerDataType>({
      ...photographerDataTemplate,
    });

  const [photographerDataErrorInfo, setPhotographerDataErrorInfo] =
    useState<PhotographerDataErrorInfoType>({
      ...photographerDataErrorInfoTemplate,
    });

  const handlePhotographerData = (
    key: keyof PhotographerDataType,
    value: PhotographerDataType[keyof PhotographerDataType]
  ) => {
    setPhotographerData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handlePhotographerDataErrorInfo = (
    key: keyof PhotographerDataErrorInfoType,
    value: PhotographerDataErrorInfoType[keyof PhotographerDataErrorInfoType]
  ) => {
    setPhotographerDataErrorInfo((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  //fetch states data when a country is selected
  useEffect(() => {
    try {
      setLoadingScreen(true);
      dispatch(fetchStates({ countryName: photographerData.companyCountry }));
      setLoadingScreen(false);
    } catch (error: any) {
      setLoadingScreen(false);
      console.error(error.message);
    } finally {
      setLoadingScreen(false);
    }
  }, [photographerData.companyCountry]);

  //fetch cities data when a state is selected
  useEffect(() => {
    try {
      setLoadingScreen(true);
      dispatch(
        fetchCitiesOfState({
          countryName: photographerData.companyCountry,
          stateName: photographerData.companyState,
        })
      );
    } catch (error: any) {
      setLoadingScreen(false);
      console.error(error.message);
    } finally {
      setLoadingScreen(false);
    }
  }, [photographerData.companyState]);

  useEffect(() => {
    try {
      switch (formType) {
        case "FORM_ONE":
          if (photographerData.companyAddress) {
            // ensuring that form is filled before proceeding
            setLoadingScreen(true);
            const requiredFields = [
              photographerDataErrorInfo.companyName,
              photographerDataErrorInfo.companyLandmark,
              photographerDataErrorInfo.companyState,
              photographerDataErrorInfo.companyCity,
              photographerDataErrorInfo.companyTaluk,
              photographerDataErrorInfo.companyPincode,
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
              photographerDataErrorInfo.vendorMainContactFirstName,
              photographerDataErrorInfo.vendorMainContactLastName,
              photographerDataErrorInfo.vendorMainDesignation,
              photographerDataErrorInfo.vendorMainEmail,
              photographerDataErrorInfo.vendorMainMobileNo,
              photographerDataErrorInfo.vendorMainOfficeNo,
              photographerDataErrorInfo.vendorAlternateEmail,
              photographerDataErrorInfo.vendorAlternateMobileNo,
              photographerDataErrorInfo.vendorAlternateOfficeNo,
            ];

            const isFormValid = requiredFields.every((field) => field === "");

            if (isFormValid) {
              setFormType("FORM_FOUR");
            }
          }
          break;
        case "FORM_FOUR":
          {
            const requiredFields = [
              photographerDataErrorInfo.vendorImages,
              photographerDataErrorInfo.vendorDescription,
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

  useEffect(() => {
    try {
      if (userConfirmation && !userConfirmationDialog) {
        uploadFiles();
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }, [userConfirmation, userConfirmationDialog]);

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

  const validateFormOne = () => {
    if (!photographerData.companyName) {
      handlePhotographerDataErrorInfo(
        "companyName",
        "Company name is required"
      );
    } else {
      handlePhotographerDataErrorInfo("companyName", "");
    }

    if (!photographerData.companyAddress) {
      handlePhotographerDataErrorInfo("companyAddress", "Address is required");
    } else {
      handlePhotographerDataErrorInfo("companyAddress", "");
    }
    if (!photographerData.companyLandmark) {
      handlePhotographerDataErrorInfo(
        "companyLandmark",
        "Landmark is required"
      );
    } else {
      handlePhotographerDataErrorInfo("companyLandmark", "");
    }
    if (!photographerData.companyState) {
      handlePhotographerDataErrorInfo("companyState", "State is required");
    } else {
      handlePhotographerDataErrorInfo("companyState", "");
    }
    if (!photographerData.companyCity) {
      handlePhotographerDataErrorInfo("companyCity", "City is required");
    } else {
      handlePhotographerDataErrorInfo("companyCity", "");
    }
    if (!photographerData.companyTaluk) {
      handlePhotographerDataErrorInfo("companyTaluk", "Taluk is required");
    } else {
      handlePhotographerDataErrorInfo("companyTaluk", "");
    }
    if (!photographerData.companyPincode) {
      handlePhotographerDataErrorInfo("companyPincode", "Pincode is required");
    } else {
      handlePhotographerDataErrorInfo("companyPincode", "");
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const validateFormThree = () => {
    if (!photographerData.vendorMainDesignation) {
      handlePhotographerDataErrorInfo(
        "vendorMainDesignation",
        "Designation is required"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainDesignation", "");
    }
    if (!photographerData.vendorMainOfficeNo) {
      handlePhotographerDataErrorInfo(
        "vendorMainOfficeNo",
        "Main office number is required"
      );
    } else if (
      !/^\+(?:[0-9] ?){6,14}[0-9]$/.test(photographerData.vendorMainOfficeNo)
    ) {
      handlePhotographerDataErrorInfo(
        "vendorMainOfficeNo",
        "Please enter a valid phone number"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainOfficeNo", "");
    }
    if (!photographerData.vendorMainMobileNo) {
      handlePhotographerDataErrorInfo(
        "vendorMainMobileNo",
        "Main mobile number is required"
      );
    } else if (
      !/^\+(?:[0-9] ?){6,14}[0-9]$/.test(photographerData.vendorMainMobileNo)
    ) {
      handlePhotographerDataErrorInfo(
        "vendorMainMobileNo",
        "Please enter a valid phone number"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainMobileNo", "");
    }
    if (!photographerData.vendorMainEmail) {
      handlePhotographerDataErrorInfo("vendorMainEmail", "Email is required");
    } else if (!/\S+@\S+\.\S+/.test(photographerData.vendorMainEmail)) {
      handlePhotographerDataErrorInfo(
        "vendorMainEmail",
        "Please enter a valid email address"
      );
    } else if (!photographerData.vendorMainEmail.endsWith("@gmail.com")) {
      handlePhotographerDataErrorInfo(
        "vendorMainEmail",
        "Couldn't find your account"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainEmail", "");
    }

    if (!photographerData.vendorMainContactFirstName) {
      handlePhotographerDataErrorInfo(
        "vendorMainContactFirstName",
        "First name is required"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainContactFirstName", "");
    }
    if (!photographerData.vendorMainContactLastName) {
      handlePhotographerDataErrorInfo(
        "vendorMainContactLastName",
        "Last name is required"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorMainContactLastName", "");
    }

    if (photographerData.vendorAlternateOfficeNo !== "+91") {
      if (
        !/^\+(?:[0-9] ?){6,14}[0-9]$/.test(
          photographerData.vendorAlternateOfficeNo
        )
      ) {
        handlePhotographerDataErrorInfo(
          "vendorAlternateOfficeNo",
          "Please enter a valid phone number"
        );
      } else {
        handlePhotographerDataErrorInfo("vendorAlternateOfficeNo", "");
      }
    }

    if (photographerData.vendorAlternateMobileNo !== "+91") {
      if (
        !/^\+(?:[0-9] ?){6,14}[0-9]$/.test(
          photographerData.vendorAlternateMobileNo
        )
      ) {
        handlePhotographerDataErrorInfo(
          "vendorAlternateMobileNo",
          "Please enter a valid phone number"
        );
      } else {
        handlePhotographerDataErrorInfo("vendorAlternateMobileNo", "");
      }
    }

    if (photographerData.vendorAlternateEmail) {
      if (!/\S+@\S+\.\S+/.test(photographerData.vendorAlternateEmail)) {
        handlePhotographerDataErrorInfo(
          "vendorAlternateEmail",
          "Please enter a valid email address"
        );
      } else if (
        !photographerData.vendorAlternateEmail.endsWith("@gmail.com")
      ) {
        handlePhotographerDataErrorInfo(
          "vendorAlternateEmail",
          "Couldn't find your account"
        );
      } else {
        handlePhotographerDataErrorInfo("vendorAlternateEmail", "");
      }
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const validateFormFour = () => {
    if (photographerData.vendorImages.length === 0) {
      handlePhotographerDataErrorInfo(
        "vendorImages",
        "Please select atleast one image"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorImages", "");
    }

    if (!photographerData.vendorDescription) {
      handlePhotographerDataErrorInfo(
        "vendorDescription",
        "Description is required"
      );
    } else {
      handlePhotographerDataErrorInfo("vendorDescription", "");
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const uploadFiles = async () => {
    setLoadingScreen(true);
    try {
      // Business Images Upload
      const uploadBusinessImages = photographerData.vendorImages.map(
        async (file) => {
          const vendorImagesRef = ref(
            firebaseStorage,
            `VENDOR/${vendorType}/${userInfo.userDetails.UID}/BusinessImages/${file.name}`
          );
          const snapshot = await uploadBytes(vendorImagesRef, file);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          return downloadUrl;
        }
      );

      const businessImagesUrl = await Promise.all(uploadBusinessImages);
      handlePhotographerData("vendorImagesUrl", businessImagesUrl);

      // Registration Document Upload
      const vendorRegisterDocumentRef = ref(
        firebaseStorage,
        `VENDOR/${vendorType}/${userInfo.userDetails.UID}/RegistrationDocument/${photographerData.vendorRegisterDocument.name}`
      );
      const snapshot = await uploadBytes(
        vendorRegisterDocumentRef,
        photographerData.vendorRegisterDocument
      );
      const registrationDocumentUrl = await getDownloadURL(snapshot.ref);
      handlePhotographerData(
        "vendorRegisterDocumentUrl",
        registrationDocumentUrl
      );

      setIsFileUploadComplete(true);
      setLoadingScreen(false);
    } catch (err) {
      setLoadingScreen(false);
      console.error(err);
    }
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

  const getRegisterDocumentType = () => {
    const fileExtension = photographerData.vendorRegisterDocument?.name
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

  const handleFormContactTypeChange = () => {
    if (formContactType === "PRIMARY") {
      setFormContactType("SECONDARY");
    } else {
      setFormContactType("PRIMARY");
    }
  };

  const handleImageChange = (event: any) => {
    const selectedFiles = Array.from(event.target.files);
    let finalImageList: Array<any> = [];
    let finalImageListCount = 0;
    let requiredImageCount = 5;

    if (photographerData.vendorImages) {
      finalImageList = [...photographerData.vendorImages];
      finalImageListCount = photographerData.vendorImages.length;
    }

    if (selectedFiles.length + finalImageListCount > requiredImageCount) {
      handlePhotographerDataErrorInfo(
        "vendorImages",
        "You can set at most 5 images!"
      );
      return;
    }

    finalImageList = [...finalImageList, ...selectedFiles];

    handlePhotographerData("vendorImages", finalImageList);
  };

  const handleFormSubmit = async () => {
    if (!executeRecaptcha) {
      return;
    }

    setLoadingScreen(true);
    const captchaToken = await executeRecaptcha("inquirySubmit");

    const {
      vendorRegisterDocument,
      vendorRegisterDocumentUrl,
      vendorImages,
      vendorImagesUrl,
      vendorMainContactFirstName,
      vendorMainContactLastName,
      vendorAlternateContactFirstName,
      vendorAlternateContactLastName,
      ...otherFields
    } = photographerData;

    const data = {
      ...otherFields,
      vendorRegisterDocument: vendorRegisterDocumentUrl,
      vendorImages: vendorImagesUrl,
      vendorMainContactName:
        vendorMainContactFirstName + " " + vendorMainContactLastName,
      vendorAlternateContactLastName:
        vendorAlternateContactFirstName + " " + vendorAlternateContactLastName,
    };

    const URL = `/api/routes/photographerMaster/`;

    try {
      await axios.post(URL, data, {
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
        <div className={styles.registrationFormMain__wrapper}>
          <div className={styles.img__wrapper}>
            <div className={styles.companyInfo}>
              <img src={"/images/logo.png"} alt="EventifyConnect" />
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
                <span>Photographer Information</span>
              </h2>
              <p className={styles["form__sub-title"]}>
                <span>Fill the from to become a part of the team</span>
              </p>
            </div>
            <div className={styles.progressIndicator__wrapper}>
              <div className={`${styles["sub-wrapper"]} ${styles.currentForm}`}>
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
              <div className={styles.progressBar} style={progressBarStyle}>
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
            </div>
            <form className={styles.form__container}>
              {formType === "FORM_ONE" && (
                <div className={styles.userInput__wrapper}>
                  <div className={styles.textField}>
                    <label className={styles.title}>
                      Company Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="hallName"
                      value={photographerData.companyName}
                      onChange={(e) =>
                        handlePhotographerData("companyName", e.target.value)
                      }
                      style={
                        photographerDataErrorInfo.companyName
                          ? { border: "2px solid red" }
                          : {}
                      }
                      placeholder={"Enter company name"}
                      className={styles.input}
                      spellCheck={false}
                    />
                    {photographerDataErrorInfo.companyName && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{photographerDataErrorInfo.companyName}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.textField}>
                    <label className={styles.title}>
                      Address <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={photographerData.companyAddress}
                      onChange={(e) =>
                        handlePhotographerData("companyAddress", e.target.value)
                      }
                      style={
                        photographerDataErrorInfo.companyAddress
                          ? { border: "2px solid red" }
                          : {}
                      }
                      placeholder={"Enter address"}
                      className={styles.input}
                      spellCheck={false}
                    />
                    {photographerDataErrorInfo.companyAddress && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{photographerDataErrorInfo.companyAddress}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.textField}>
                    <label className={styles.title}>
                      Landmark <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="companyLandmark"
                      value={photographerData.companyLandmark}
                      onChange={(e) =>
                        handlePhotographerData(
                          "companyLandmark",
                          e.target.value
                        )
                      }
                      style={
                        photographerDataErrorInfo.companyLandmark
                          ? { border: "2px solid red" }
                          : {}
                      }
                      placeholder={"Enter landmark"}
                      className={styles.input}
                      spellCheck={false}
                    />
                    {photographerDataErrorInfo.companyLandmark && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{photographerDataErrorInfo.companyLandmark}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.textField__wrapper}>
                    <div className={styles["sub-wrapper"]}>
                      <div className={styles.title}>
                        Country <span>*</span>
                      </div>
                      <div
                        style={
                          photographerDataErrorInfo.companyCountry
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
                              ? data.countries.data?.map((country: string) => ({
                                  value: country,
                                  label: country,
                                }))
                              : null
                          }
                          value={
                            photographerData.companyCountry
                              ? {
                                  value: photographerData.companyCountry,
                                  label: photographerData.companyCountry,
                                }
                              : null
                          }
                          onChange={(
                            selectedOption: SingleValue<ReactSelectOptionType>
                          ) =>
                            handlePhotographerData(
                              "companyCountry",
                              selectedOption?.value || ""
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
                          menuPlacement="top"
                          menuShouldScrollIntoView={false}
                          hideSelectedOptions={false}
                          closeMenuOnSelect
                          isClearable={false}
                          isSearchable
                        />
                      </div>
                      {photographerDataErrorInfo.companyCountry && (
                        <div className={styles.inputError}>
                          <ErrorIcon className={styles.icon} />
                          <p>{photographerDataErrorInfo.companyCountry}</p>
                        </div>
                      )}
                    </div>
                    <div className={styles["sub-wrapper"]}>
                      <div className={styles.title}>
                        State <span>*</span>
                      </div>
                      <div
                        style={
                          photographerDataErrorInfo.companyState
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
                            data.states.data && Array.isArray(data.states.data)
                              ? data.states.data?.map((state: string) => ({
                                  value: state,
                                  label: state,
                                }))
                              : null
                          }
                          value={
                            photographerData.companyState
                              ? {
                                  value: photographerData.companyState,
                                  label: photographerData.companyState,
                                }
                              : null
                          }
                          onChange={(
                            selectedOption: SingleValue<ReactSelectOptionType>
                          ) =>
                            handlePhotographerData(
                              "companyState",
                              selectedOption?.value || ""
                            )
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
                          menuPlacement="top"
                          menuShouldScrollIntoView={false}
                          hideSelectedOptions={false}
                          closeMenuOnSelect
                          isClearable={false}
                          isSearchable
                        />
                      </div>
                      {photographerDataErrorInfo.companyState && (
                        <div className={styles.inputError}>
                          <ErrorIcon className={styles.icon} />
                          <p>{photographerDataErrorInfo.companyState}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.textField__wrapper}>
                    <div className={styles["sub-wrapper"]}>
                      <div className={styles.title}>
                        City <span>*</span>
                      </div>
                      <div
                        style={
                          photographerDataErrorInfo.companyCity
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
                            photographerData.companyCity
                              ? {
                                  value: photographerData.companyCity,
                                  label: photographerData.companyCity,
                                }
                              : null
                          }
                          onChange={(
                            selectedOption: SingleValue<ReactSelectOptionType>
                          ) =>
                            handlePhotographerData(
                              "companyCity",
                              selectedOption?.value || ""
                            )
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
                          menuPlacement="top"
                          menuShouldScrollIntoView={false}
                          hideSelectedOptions={false}
                          closeMenuOnSelect
                          isClearable={false}
                          isSearchable
                        />
                      </div>
                      {photographerDataErrorInfo.companyCity && (
                        <div className={styles.inputError}>
                          <ErrorIcon className={styles.icon} />
                          <p>{photographerDataErrorInfo.companyCity}</p>
                        </div>
                      )}
                    </div>
                    <div className={`${styles.taluk} ${styles["sub-wrapper"]}`}>
                      <div className={styles.title}>
                        Taluk <span>*</span>
                      </div>
                      <input
                        type="text"
                        name="taluk"
                        value={photographerData.companyTaluk}
                        onChange={(e) =>
                          handlePhotographerData("companyTaluk", e.target.value)
                        }
                        style={
                          photographerDataErrorInfo.companyTaluk
                            ? { border: "2px solid red" }
                            : {}
                        }
                        placeholder="Enter the taluk"
                        className={styles.input}
                        spellCheck={false}
                      />
                      {photographerDataErrorInfo.companyTaluk && (
                        <div className={styles.inputError}>
                          <ErrorIcon className={styles.icon} />
                          <p>{photographerDataErrorInfo.companyTaluk}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`${styles.textField} ${styles.pinCode__wrapper}`}
                  >
                    <div className={styles.title}>
                      Pincode <span>*</span>
                    </div>
                    <>
                      <input
                        type="text"
                        name="pincode"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter, and .
                          if (
                            [46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
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
                            (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                            (e.keyCode < 96 || e.keyCode > 105)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        value={photographerData.companyPincode}
                        onChange={(e) =>
                          handlePhotographerData(
                            "companyPincode",
                            e.target.value
                          )
                        }
                        style={
                          photographerDataErrorInfo.companyPincode
                            ? { border: "2px solid red" }
                            : {}
                        }
                        placeholder="Enter your pincode"
                        className={styles.input}
                        spellCheck={false}
                      />
                      {photographerDataErrorInfo.companyPincode && (
                        <div className={styles.inputError}>
                          <ErrorIcon className={styles.icon} />
                          <p>{photographerDataErrorInfo.companyPincode}</p>
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
                  <div className={styles.textField}>
                    <label className={styles.title}>Registration No</label>
                    <input
                      type="text"
                      name="vendorRegisterNo"
                      value={photographerData.vendorRegisterNo}
                      onChange={(e) =>
                        handlePhotographerData(
                          "vendorRegisterNo",
                          e.target.value
                        )
                      }
                      placeholder={"Enter registration number"}
                      className={styles.input}
                      spellCheck={false}
                    />
                  </div>
                  <div className={styles.textField}>
                    <label className={styles.title}>Registration Date</label>
                    <input
                      type="date"
                      value={photographerData.vendorRegisterDate}
                      placeholder="dd-mm-yyyy"
                      className={styles.input}
                      onChange={(e) =>
                        handlePhotographerData(
                          "vendorRegisterDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className={styles.img__dropZone}>
                    <label className={styles.title}>
                      Registration Document{" "}
                    </label>
                    {!photographerData.vendorRegisterDocument ? (
                      <div
                        className={styles.imgUploadArea}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handlePhotographerData(
                            "vendorRegisterDocument",
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
                              handlePhotographerData(
                                "vendorRegisterDocument",
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
                            handlePhotographerData("vendorRegisterDocument", "")
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
                          {photographerData.vendorRegisterDocument?.name}
                        </label>
                      </div>
                    )}
                  </div>
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
                  {formContactType === "PRIMARY" ? (
                    <>
                      <div className={styles.textField__wrapper}>
                        <div className={styles["sub-wrapper"]}>
                          <label className={styles.title}>
                            First Name <span>*</span>{" "}
                          </label>
                          <>
                            <input
                              type="text"
                              name="vendorMainContactFirstName"
                              value={
                                photographerData.vendorMainContactFirstName
                              }
                              onChange={(e) =>
                                handlePhotographerData(
                                  "vendorMainContactFirstName",
                                  e.target.value
                                )
                              }
                              style={
                                photographerDataErrorInfo.vendorMainContactFirstName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Logan"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {photographerDataErrorInfo.vendorMainContactFirstName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>
                                  {
                                    photographerDataErrorInfo.vendorMainContactFirstName
                                  }
                                </p>
                              </div>
                            )}
                          </>
                        </div>
                        <div className={styles["sub-wrapper"]}>
                          <label className={styles.title}>
                            Last Name <span>*</span>{" "}
                          </label>
                          <>
                            <input
                              type="text"
                              name="mainContactLastName"
                              value={photographerData.vendorMainContactLastName}
                              onChange={(e) =>
                                handlePhotographerData(
                                  "vendorMainContactLastName",
                                  e.target.value
                                )
                              }
                              style={
                                photographerDataErrorInfo.vendorMainContactLastName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Sanderz"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {photographerDataErrorInfo.vendorMainContactLastName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>
                                  {
                                    photographerDataErrorInfo.vendorMainContactLastName
                                  }
                                </p>
                              </div>
                            )}
                          </>
                        </div>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>
                          Designation <span>*</span>{" "}
                        </label>
                        <>
                          <input
                            type="text"
                            name="vendorMainDesignation"
                            value={photographerData.vendorMainDesignation}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorMainDesignation",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorMainDesignation
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Cheif Manager"
                            className={styles.input}
                            spellCheck="false"
                          />
                          {photographerDataErrorInfo.vendorMainDesignation && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {
                                  photographerDataErrorInfo.vendorMainDesignation
                                }
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>
                          Office Number <span>*</span>{" "}
                        </label>
                        <>
                          <div
                            className={styles.phoneInput}
                            style={
                              photographerDataErrorInfo.vendorMainOfficeNo
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <PhoneInput
                              country={"us"}
                              value={photographerData.vendorMainOfficeNo}
                              onChange={(value, country) =>
                                handlePhotographerData(
                                  "vendorMainOfficeNo",
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
                          {photographerDataErrorInfo.vendorMainOfficeNo && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {photographerDataErrorInfo.vendorMainOfficeNo}
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>
                          Mobile Number <span>*</span>{" "}
                        </label>
                        <>
                          <div
                            className={styles.phoneInput}
                            style={
                              photographerDataErrorInfo.vendorMainMobileNo
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <PhoneInput
                              country={"us"}
                              value={photographerData.vendorMainMobileNo}
                              // eslint-disable-next-line no-unused-vars
                              onChange={(value, country) =>
                                handlePhotographerData(
                                  "vendorMainMobileNo",
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
                          {photographerDataErrorInfo.vendorMainMobileNo && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {photographerDataErrorInfo.vendorMainMobileNo}
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>
                          Email Address <span>*</span>
                        </label>
                        <>
                          <input
                            type="text"
                            name="vendorMainEmail"
                            value={photographerData.vendorMainEmail}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorMainEmail",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorMainEmail
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Enter email id"
                            className={styles.input}
                            spellCheck="false"
                          />
                          {photographerDataErrorInfo.vendorMainEmail && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>{photographerDataErrorInfo.vendorMainEmail}</p>
                            </div>
                          )}
                        </>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.textField__wrapper}>
                        <div className={styles["sub-wrapper"]}>
                          <label className={styles.title}>First Name </label>
                          <>
                            <input
                              type="text"
                              name="vendorAlternateContactFirstName"
                              value={
                                photographerData.vendorAlternateContactFirstName
                              }
                              onChange={(e) =>
                                handlePhotographerData(
                                  "vendorAlternateContactFirstName",
                                  e.target.value
                                )
                              }
                              style={
                                photographerDataErrorInfo.vendorAlternateContactFirstName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Logan"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {photographerDataErrorInfo.vendorAlternateContactFirstName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>
                                  {
                                    photographerDataErrorInfo.vendorAlternateContactFirstName
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
                              name="vendorAlternateContactLastName"
                              value={
                                photographerData.vendorAlternateContactLastName
                              }
                              onChange={(e) =>
                                handlePhotographerData(
                                  "vendorAlternateContactLastName",
                                  e.target.value
                                )
                              }
                              style={
                                photographerDataErrorInfo.vendorAlternateContactLastName
                                  ? { border: "2px solid red" }
                                  : {}
                              }
                              placeholder="Sanderz"
                              className={styles.input}
                              spellCheck="false"
                            />
                            {photographerDataErrorInfo.vendorAlternateContactLastName && (
                              <div className={styles.inputError}>
                                <ErrorIcon className={styles.icon} />
                                <p>
                                  {
                                    photographerDataErrorInfo.vendorAlternateContactLastName
                                  }
                                </p>
                              </div>
                            )}
                          </>
                        </div>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>Designation</label>
                        <>
                          <input
                            type="text"
                            name="alternateDesignation"
                            value={photographerData.vendorAlternateDesignation}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorAlternateDesignation",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorAlternateDesignation
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Chief Manager"
                            className={styles.input}
                            spellCheck="false"
                          />
                          {photographerDataErrorInfo.vendorAlternateDesignation && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {
                                  photographerDataErrorInfo.vendorAlternateDesignation
                                }
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>Office Number</label>
                        <>
                          <div
                            className={styles.phoneInput}
                            style={
                              photographerDataErrorInfo.vendorAlternateOfficeNo
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <PhoneInput
                              country={"us"}
                              value={photographerData.vendorAlternateOfficeNo}
                              onChange={(value, country) =>
                                handlePhotographerData(
                                  "vendorAlternateOfficeNo",
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
                          {photographerDataErrorInfo.vendorAlternateOfficeNo && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {
                                  photographerDataErrorInfo.vendorAlternateOfficeNo
                                }
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>Mobile Number</label>
                        <>
                          <div
                            className={styles.phoneInput}
                            style={
                              photographerDataErrorInfo.vendorAlternateMobileNo
                                ? {
                                    border: "2px solid red",
                                    borderRadius: "5px",
                                  }
                                : {}
                            }
                          >
                            <PhoneInput
                              country={"us"}
                              value={photographerData.vendorAlternateMobileNo}
                              // eslint-disable-next-line no-unused-vars
                              onChange={(value, country) =>
                                handlePhotographerData(
                                  "vendorAlternateMobileNo",
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
                          {photographerDataErrorInfo.vendorAlternateMobileNo && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {
                                  photographerDataErrorInfo.vendorAlternateMobileNo
                                }
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles.textField}>
                        <label className={styles.title}>Email Address</label>
                        <>
                          <input
                            type="text"
                            name="vendorAlternateEmail"
                            value={photographerData.vendorAlternateEmail}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorAlternateEmail",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorAlternateEmail
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Enter email id"
                            className={styles.input}
                            spellCheck="false"
                          />
                          {photographerDataErrorInfo.vendorAlternateEmail && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {photographerDataErrorInfo.vendorAlternateEmail}
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                    </>
                  )}
                </div>
              )}
              {formType === "FORM_FOUR" && (
                <div className={styles.detailedInfo__wrapper}>
                  <div className={styles.images__wrapper}>
                    <div
                      className={styles["sub-wrapper"]}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleImageChange(e);
                      }}
                    >
                      <div className={styles.mainImage}>
                        {photographerData.vendorImages?.[0] ? (
                          <>
                            <button
                              title="removeBtn"
                              type="button"
                              onClick={(e) => {
                                const updatedImages = [
                                  ...photographerData.vendorImages,
                                ];
                                updatedImages.splice(0, 1);
                                handlePhotographerData(
                                  "vendorImages",
                                  updatedImages
                                );
                              }}
                              className={styles.removeBtn}
                            >
                              <CloseIcon className={styles.icon} />
                            </button>
                            <img
                              src={URL.createObjectURL(
                                photographerData.vendorImages?.[0]
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
                            <UploadFileIcon className={styles.uploadFileIcon} />
                            <p className={styles.uploadFileText}>
                              Drag file to upload or <span>Browse</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className={styles.standbyImages}>
                        <div className={styles.image}>
                          {photographerData.vendorImages?.[1] ? (
                            <>
                              <button
                                title="closeBtn"
                                className={styles.removeBtn}
                                type="button"
                                onClick={(e) => {
                                  const updatedImages = [
                                    ...photographerData.vendorImages,
                                  ];
                                  updatedImages.splice(1, 1);
                                  handlePhotographerData(
                                    "vendorImages",
                                    updatedImages
                                  );
                                }}
                              >
                                <CloseIcon className={styles.icon} />
                              </button>
                              <img
                                src={URL.createObjectURL(
                                  photographerData.vendorImages?.[1]
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
                          {photographerData.vendorImages?.[2] ? (
                            <>
                              <button
                                title="closeIcon"
                                className={styles.removeBtn}
                                type="button"
                                onClick={(e) => {
                                  const updatedImages = [
                                    ...photographerData.vendorImages,
                                  ];
                                  updatedImages.splice(2, 1);
                                  handlePhotographerData(
                                    "vendorImages",
                                    updatedImages
                                  );
                                }}
                              >
                                <CloseIcon className={styles.icon} />
                              </button>
                              <img
                                src={URL.createObjectURL(
                                  photographerData.vendorImages?.[2]
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
                          {photographerData.vendorImages?.[3] ? (
                            <>
                              <button
                                title="closeIcon"
                                className={styles.removeBtn}
                                type="button"
                                onClick={(e) => {
                                  const updatedImages = [
                                    ...photographerData.vendorImages,
                                  ];
                                  updatedImages.splice(3, 1);
                                  handlePhotographerData(
                                    "vendorImages",
                                    updatedImages
                                  );
                                }}
                              >
                                <CloseIcon className={styles.icon} />
                              </button>
                              <img
                                src={URL.createObjectURL(
                                  photographerData.vendorImages?.[3]
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
                          {photographerData.vendorImages?.[4] ? (
                            <img
                              src={URL.createObjectURL(
                                photographerData.vendorImages?.[4]
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
                        </div>
                      </div>
                    </div>
                    {photographerDataErrorInfo.vendorImages && (
                      <div className={styles.imagesInputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{photographerDataErrorInfo.vendorImages}</p>
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
                        {photographerData.vendorImages
                          ? `(${photographerData.vendorImages.length}/5) selected`
                          : "(0/5) selected"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`${styles.userInput__wrapper} ${styles.subContents__wrapper}`}
                  >
                    <div className={styles.textField}>
                      <label className={styles.title}>
                        Vendor Description <span>*</span>
                      </label>
                      <>
                        <textarea
                          name="description"
                          value={photographerData.vendorDescription}
                          onChange={(e) =>
                            handlePhotographerData(
                              "vendorDescription",
                              e.target.value
                            )
                          }
                          style={
                            photographerDataErrorInfo.vendorDescription
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
                        {photographerDataErrorInfo.vendorDescription && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>{photographerDataErrorInfo.vendorDescription}</p>
                          </div>
                        )}
                      </>
                    </div>
                    <div className={styles.textField__wrapper}>
                      <div className={styles["sub-wrapper"]}>
                        <label className={styles.title}>
                          Vendor Experience
                        </label>
                        <>
                          <input
                            type="number"
                            name="hallCapacity"
                            value={photographerData.vendorExperience}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorExperience",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorExperience
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Enter your experience in years"
                            className={styles.input}
                          />
                          {photographerDataErrorInfo.vendorExperience && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {photographerDataErrorInfo.vendorExperience}
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                      <div className={styles["sub-wrapper"]}>
                        <label className={styles.title}>
                          Vendor Portfolio URL
                        </label>
                        <>
                          <input
                            type="number"
                            name="hallRooms"
                            value={photographerData.vendorPortfolioURL}
                            onChange={(e) =>
                              handlePhotographerData(
                                "vendorPortfolioURL",
                                e.target.value
                              )
                            }
                            style={
                              photographerDataErrorInfo.vendorPortfolioURL
                                ? { border: "2px solid red" }
                                : {}
                            }
                            placeholder="Paste your portfolio URL"
                            className={styles.input}
                          />
                          {photographerDataErrorInfo.vendorPortfolioURL && (
                            <div className={styles.inputError}>
                              <ErrorIcon className={styles.icon} />
                              <p>
                                {photographerDataErrorInfo.vendorPortfolioURL}
                              </p>
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                    <div className={styles.textField}>
                      <label className={styles.title}>
                        Vendor Service Areas
                      </label>
                      <>
                        <div
                          style={
                            photographerDataErrorInfo.vendorServiceAreas
                              ? {
                                  border: "2px solid red",
                                  borderRadius: "5px",
                                  width: "100%",
                                }
                              : { width: "100%" }
                          }
                        >
                          <Select
                            styles={customSelectStyles}
                            value={
                              photographerData.vendorServiceAreas &&
                              photographerData.vendorServiceAreas[0]
                                ? photographerData.vendorServiceAreas.map(
                                    (option) => ({
                                      value: option,
                                      label: option,
                                    })
                                  )
                                : null
                            }
                            onChange={(selectedOptions) => {
                              const updatedEventInfo = selectedOptions.map(
                                (option) => option.value
                              );
                              handlePhotographerData(
                                "vendorServiceAreas",
                                updatedEventInfo
                              );
                            }}
                            options={
                              Array.isArray(data.citiesOfCountry.data)
                                ? data.citiesOfCountry.data.map(
                                    (city: string) => ({
                                      value: city,
                                      label: city,
                                    })
                                  )
                                : null
                            }
                            placeholder="Select all your service areas"
                            className={styles.selectInput}
                            components={{
                              DropdownIndicator: () => (
                                <KeyboardArrowDownIcon
                                  style={{ color: "#007bff" }}
                                />
                              ),
                            }}
                            menuPlacement="top"
                            menuShouldScrollIntoView={false}
                            hideSelectedOptions={false}
                            closeMenuOnSelect
                            isSearchable
                            isClearable={false}
                            isMulti
                          />
                        </div>
                        {photographerDataErrorInfo.vendorServiceAreas && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>
                              {photographerDataErrorInfo.vendorServiceAreas}
                            </p>
                          </div>
                        )}
                      </>
                    </div>
                    <div className={styles.textField}>
                      <label className={styles.title}>
                        Vendor Travel Availability
                      </label>
                      <>
                        <div
                          style={
                            photographerDataErrorInfo.vendorTravelAvailability
                              ? {
                                  border: "2px solid red",
                                  borderRadius: "5px",
                                }
                              : {}
                          }
                        >
                          <Select
                            styles={customSelectStyles}
                            options={["Local", "National", "International"].map(
                              (option: string) => ({
                                value: option,
                                label: option,
                              })
                            )}
                            value={
                              photographerData.vendorTravelAvailability
                                ? {
                                    value:
                                      photographerData.vendorTravelAvailability,
                                    label:
                                      photographerData.vendorTravelAvailability,
                                  }
                                : null
                            }
                            onChange={(
                              selectedOption: SingleValue<ReactSelectOptionType>
                            ) =>
                              handlePhotographerData(
                                "vendorTravelAvailability",
                                selectedOption?.value || ""
                              )
                            }
                            placeholder="Select your travel availability"
                            className={styles.selectInput}
                            components={{
                              DropdownIndicator: () => (
                                <KeyboardArrowDownIcon
                                  style={{ color: "#007bff" }}
                                />
                              ),
                            }}
                            menuPlacement="top"
                            menuShouldScrollIntoView={false}
                            hideSelectedOptions={false}
                            closeMenuOnSelect
                            isClearable={false}
                            isSearchable
                          />
                        </div>
                        {photographerDataErrorInfo.vendorTravelAvailability && (
                          <div className={styles.inputError}>
                            <ErrorIcon className={styles.icon} />
                            <p>
                              {
                                photographerDataErrorInfo.vendorTravelAvailability
                              }
                            </p>
                          </div>
                        )}
                      </>
                    </div>
                  </div>
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
                {formType === "FORM_FOUR" ? (
                  <span>Submit</span>
                ) : (
                  <span>Next</span>
                )}
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

export default PhotographerRegistrationForm;
