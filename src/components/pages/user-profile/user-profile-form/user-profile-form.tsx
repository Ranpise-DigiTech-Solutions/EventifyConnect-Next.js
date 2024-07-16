/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import "react-phone-input-2/lib/style.css";
import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import Select, { SingleValue } from "react-select";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import { Avatar } from "antd";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PlaceIcon from "@mui/icons-material/Place";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import ErrorIcon from "@mui/icons-material/Error";
import StreetviewIcon from "@mui/icons-material/Streetview";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import PersonIcon from "@mui/icons-material/Person";
import { FaEdit } from "react-icons/fa";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { firebaseStorage } from "@/lib/db/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LoadingScreen } from "@/components/sub-components";
import { fetchCitiesOfState, fetchStates } from "@/redux/thunks/data";
import { toggleUserDataUpdateFlag } from "@/redux/slices/user-info";
import styles from "./user-profile-form.module.scss";
import { RootState } from "@/redux/store";

type Props = {};

interface customerDataType {
  _id: string;
  customerFirstName: string;
  customerLastName: string;
  customerCurrentLocation: string;
  customerContact: string;
  customerEmail: string;
  customerPassword: string;
  customerUid: string; // firebase id
  customerAddress: string;
  customerCity: string;
  customerPincode: string;
  customerState: string;
  customerTaluk: string;
  customerCountry: string;
  customerLandmark: string;
  customerDesignation: string;
  customerMainOfficeNo: string;
  customerMainMobileNo: string;
  customerMainEmail: string;
  customerAlternateMobileNo: string;
  customerAlternateEmail: string;
  customerDocumentType: string;
  customerDocumentId: string;
  customerGender: string;
  customerProfileImage: any;
  customerProfileImageURL: string;
  programId: string;
}

const customerDataTemplate = {
  _id: "",
  customerFirstName: "",
  customerLastName: "",
  customerCurrentLocation: "",
  customerContact: "+91",
  customerEmail: "",
  customerPassword: "",
  customerUid: "", // firebase id
  customerAddress: "",
  customerCity: "",
  customerPincode: "",
  customerState: "",
  customerTaluk: "",
  customerCountry: "India",
  customerLandmark: "",
  customerDesignation: "",
  customerMainOfficeNo: "+91",
  customerMainMobileNo: "+91",
  customerMainEmail: "",
  customerAlternateMobileNo: "+91",
  customerAlternateEmail: "",
  customerDocumentType: "",
  customerDocumentId: "",
  customerGender: "",
  customerProfileImage: "",
  customerProfileImageURL: "",
  programId: "",
};

interface serviceProviderDataType {
  _id: string;
  vendorFirstName: string;
  vendorLastName: string;
  vendorTypeId: string;
  vendorCurrentLocation: string;
  vendorContact: string;
  vendorEmail: string;
  vendorPassword: string;
  vendorUid: string; // firebase id
  vendorCompanyName: string;
  vendorLocation: string;
  eventTypes: string[];
  vendorGender: string;
  vendorAlternateMobileNo: string;
  vendorAlternateEmail: string;
  vendorAddress: string;
  vendorLandmark: string;
  vendorCity: string;
  vendorTaluk: string;
  vendorState: string;
  vendorCountry: string;
  vendorPincode: string;
  vendorProfileImage: any;
  vendorProfileImageURL: string;
  programId: string;
}

const serviceProviderDataTemplate = {
  _id: "",
  vendorFirstName: "",
  vendorLastName: "",
  vendorTypeId: "",
  vendorCurrentLocation: "",
  vendorContact: "+91",
  vendorEmail: "",
  vendorPassword: "",
  vendorUid: "", // firebase id
  vendorCompanyName: "",
  vendorLocation: "",
  eventTypes: [],
  vendorGender: "",
  vendorAlternateMobileNo: "+91",
  vendorAlternateEmail: "",
  vendorAddress: "",
  vendorLandmark: "",
  vendorCity: "",
  vendorTaluk: "",
  vendorState: "",
  vendorCountry: "India",
  vendorPincode: "",
  vendorProfileImage: "",
  vendorProfileImageURL: "",
  programId: "",
};

const genderOptions: string[] = ["Male", "Female", "Other"];

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    backgroundColor: state.isDisabled
      ? "var(--secondary-text-color-whiteBg)"
      : "var(--secondary-color)",
    color: state.isDisabled ? "#ffffff" : "#000000",
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

const UserProfileForm = (props: Props) => {
  const profilePicInputRef = useRef<HTMLInputElement | null>(null); // btn used to trigger the hidden input that allows the selection of profile pic image
  const dispatch = useAppDispatch();
  const data = useAppSelector((state: RootState) => state.dataInfo); // COUNTRIES, STATES & CITIES
  const userInfoStore = useAppSelector((state: RootState) => state.userInfo); // details of registered user.

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<customerDataType>({
    ...customerDataTemplate,
  });
  const [serviceProviderData, setServiceProviderData] =
    useState<serviceProviderDataType>({
      ...serviceProviderDataTemplate,
    });

  const userType = userInfoStore.userDetails.userType;
  const vendorType = userInfoStore.userDetails.vendorType || "";
  // Refs to keep track of the initial render for each useEffect
  const isInitialRender1 = useRef(true);

  const [personalInfoFormEnabled, setPersonalInfoFormEnabled] =
    useState<boolean>(false);
  const [contactInfoFormEnabled, setContactInfoFormEnabled] =
    useState<boolean>(false);
  const [addressInfoFormEnabled, setAddressInfoFormEnabled] =
    useState<boolean>(false);
  const [isDataUpdated, setIsDataUpdated] = useState<boolean>(false);

  const handleCustomerData = (key: string, value: any) => {
    setCustomerData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleServiceProviderData = (key: string, value: any) => {
    setServiceProviderData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const handleSnackBarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsDataUpdated(false);
  };

  const snackBarAction = (
    <React.Fragment>
      <Button color="primary" size="small" onClick={handleSnackBarClose}>
        Undo
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackBarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  useEffect(() => {
    if (
      userInfoStore.userDetails.length === 0 ||
      !userInfoStore.userDetails.Document
    ) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);

    const { customerName, vendorName, ...info } =
      userInfoStore.userDetails.Document;

    if (userType === "CUSTOMER") {
      setCustomerData({
        ...info,
        customerFirstName: customerName.split(" ")[0],
        customerLastName: customerName.split(" ")[1],
      });
    } else if (userType === "VENDOR") {
      setServiceProviderData({
        ...info,
        vendorFirstName: vendorName.split(" ")[0],
        vendorLastName: vendorName.split(" ")[1],
      });
    }
  }, [userInfoStore.userDetails]);

  //fetch states data when a country is selected
  useEffect(() => {
    if (isInitialRender1.current) {
      // Skip the first execution
      isInitialRender1.current = false;
      return;
    }
    try {
      setIsLoading(true);
      dispatch(
        fetchStates({
          countryName:
            userType === "CUSTOMER"
              ? customerData.customerCountry
              : serviceProviderData.vendorCountry,
        })
      );
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    userType,
    customerData.customerCountry,
    serviceProviderData.vendorCountry,
  ]);

  //fetch cities data when a state is selected
  useEffect(() => {
    if (!customerData.customerState && !serviceProviderData.vendorState) {
      return;
    }
    try {
      setIsLoading(true);
      if (userType === "CUSTOMER") {
        dispatch(
          fetchCitiesOfState({
            countryName:
            customerData.customerCountry,
            stateName:
            customerData.customerState
      })
        );
      } else {
        dispatch(
          fetchCitiesOfState({
            countryName:
            serviceProviderData.vendorCountry,
            stateName:
            serviceProviderData.vendorState
                }          )
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userType, customerData.customerState, serviceProviderData.vendorState]);

  // call uploadFiles() method whenever user uploads a new profle pic
  useEffect(() => {
    if (
      (userType === "CUSTOMER" &&
        (typeof customerData.customerProfileImage === "string" ||
          customerData.customerProfileImage === "")) ||
      (userType === "VENDOR" &&
        (typeof serviceProviderData.vendorProfileImage === "string" ||
          serviceProviderData.vendorProfileImage === ""))
    ) {
      return;
    }
    uploadFiles();
  }, [
    customerData.customerProfileImage,
    serviceProviderData.vendorProfileImage,
  ]);

  // code to upload files to firebase
  const uploadFiles = async () => {
    setIsLoading(true);
    try {
      if (userType === "VENDOR") {
        const vendorProfileImageRef = ref(
          firebaseStorage,
          `VENDOR/${vendorType}/${userInfoStore.userDetails.UID}/ProfileImage/${serviceProviderData.vendorProfileImage.name}`
        );
        const snapshot = await uploadBytes(
          vendorProfileImageRef,
          serviceProviderData.vendorProfileImage
        );
        const vendorProfileImageUrl = await getDownloadURL(snapshot.ref);
        handleServiceProviderData(
          "vendorProfileImageURL",
          vendorProfileImageUrl
        );

        // update the file in mongodb
        await axios.patch(
          `/api/routes/serviceProviderMaster/${serviceProviderData._id}`,
          {
            vendorProfileImage: vendorProfileImageUrl,
          }
        );
      } else if (userType === "CUSTOMER") {
        const customerProfileImageRef = ref(
          firebaseStorage,
          `CUSTOMER/${userInfoStore.userDetails.UID}/ProfileImage/${customerData.customerProfileImage?.name}`
        );
        const snapshot = await uploadBytes(
          customerProfileImageRef,
          customerData.customerProfileImage
        );
        const customerProfileImageUrl = await getDownloadURL(snapshot.ref);
        handleCustomerData("customerProfileImageURL", customerProfileImageUrl);

        //update the file in mongodb
        await axios.patch(
          `/api/routes/customerMaster/${
            customerData._id
          }`,
          {
            customerProfileImage: customerProfileImageUrl,
          }
        );
      }
      setIsLoading(false);
      setIsDataUpdated(true);
    } catch (error: any) {
      setIsLoading(false);
      console.error(error.message);
    }
  };

  const handleSavePersonalInfo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (userType === "CUSTOMER") {
        const response = await axios.patch(
          `/api/routes/customerMaster/${
            customerData._id
          }`,
          {
            customerName:
              customerData.customerFirstName +
              " " +
              customerData.customerLastName,
            customerGender: customerData.customerGender,
          }
        );
        console.log("CUSTOMER PERSONAL INFO UPDATE ", response.data);
      } else if (userType === "VENDOR") {
        const response = await axios.patch(
          `/api/routes/serviceProviderMaster/${serviceProviderData._id}`,
          {
            vendorName:
              serviceProviderData.vendorFirstName +
              " " +
              serviceProviderData.vendorLastName,
            vendorGender: serviceProviderData.vendorGender,
          }
        );
        console.log("VENDOR PERSONAL INFO UPDATE ", response.data);
      }
      dispatch(toggleUserDataUpdateFlag());
      setIsDataUpdated(true);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setPersonalInfoFormEnabled(!personalInfoFormEnabled);
    }
  };

  const handleSaveContactInfo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (userType === "CUSTOMER") {
        const response = await axios.patch(
          `/api/routes/customerMaster/${
            customerData._id
          }`,
          {
            customerMainMobileNo: customerData.customerMainMobileNo,
            customerMainEmail: customerData.customerMainEmail,
            customerAlternateMobileNo: customerData.customerAlternateMobileNo,
            customerAlternateEmail: customerData.customerAlternateEmail,
          }
        );
        console.log("CUSTOMER PERSONAL INFO UPDATE ", response.data);
      } else if (userType === "VENDOR") {
        const response = await axios.patch(
          `/api/routes/serviceProviderMaster/${serviceProviderData._id}`,
          {
            vendorMainMobileNo: serviceProviderData.vendorContact,
            vendorMainEmail: serviceProviderData.vendorEmail,
            vendorAlternateMobileNo:
              serviceProviderData.vendorAlternateMobileNo,
            vendorAlternateEmail: serviceProviderData.vendorAlternateEmail,
          }
        );
        console.log("VENDOR PERSONAL INFO UPDATE ", response.data);
      }
      dispatch(toggleUserDataUpdateFlag());
      setIsDataUpdated(true);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setContactInfoFormEnabled(!personalInfoFormEnabled);
    }
  };

  const handleSaveAddressInfo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (userType === "CUSTOMER") {
        const response = await axios.patch(
          `/api/routes/customerMaster/${
            customerData._id
          }`,
          {
            customerAddress: customerData.customerAddress,
            customerLandmark: customerData.customerLandmark,
            customerCountry: customerData.customerCountry,
            customerState: customerData.customerState,
            customerCity: customerData.customerCity,
            customerTaluk: customerData.customerTaluk,
            customerPincode: customerData.customerPincode,
          }
        );
        console.log("CUSTOMER PERSONAL INFO UPDATE ", response.data);
      } else if (userType === "VENDOR") {
        const response = await axios.patch(
          `/api/routes/serviceProviderMaster/${serviceProviderData._id}`,
          {
            vendorAddress: serviceProviderData.vendorAddress,
            vendorLandmark: serviceProviderData.vendorLandmark,
            vendorCountry: serviceProviderData.vendorCountry,
            vendorState: serviceProviderData.vendorState,
            vendorCity: serviceProviderData.vendorCity,
            vendorTaluk: serviceProviderData.vendorTaluk,
            vendorPincode: serviceProviderData.vendorPincode,
          }
        );
        console.log("VENDOR PERSONAL INFO UPDATE ", response.data);
      }
      dispatch(toggleUserDataUpdateFlag());
      setIsDataUpdated(true);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setAddressInfoFormEnabled(!personalInfoFormEnabled);
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Snackbar
        open={isDataUpdated}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        message="User profile updated successfully!!"
        action={snackBarAction}
      />
      <div className={styles.UserProfileForm__container}>
        {userType === "CUSTOMER" ? (
          <div className={styles.wrapper}>
            <div className={styles.coverPage}>
              <EditOutlinedIcon className={styles.icon} />
            </div>
            <div className={styles['image-upload-container']}>
              <div className={styles['profile-image']}>
                {!customerData.customerProfileImage ? (
                  <Avatar
                    size="large"
                    className={styles.img}
                    src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                  />
                ) : (
                  <img
                    src={
                      typeof customerData.customerProfileImage === "string"
                        ? customerData.customerProfileImage
                        : URL.createObjectURL(
                            customerData.customerProfileImage
                          ) || ""
                    }
                    alt=""
                    className={styles.img}
                  />
                )}
                <button className={styles.addIcon} title="addIcon">
                  <AddIcon
                    className={styles.icon}
                    onClick={() => profilePicInputRef.current?.click()}
                  />
                </button>
                <div
                  className={styles.overlay}
                  onClick={() => profilePicInputRef.current?.click()}
                >
                  <FaEdit className={styles.editIcon} />
                  <span>Edit</span>
                </div>
              </div>
              <div className={styles['user-name']}>
                <strong>
                  {customerData.customerFirstName +
                    " " +
                    customerData.customerLastName}
                </strong>
                <br />
                <small className={styles['user-type']}>( customer )</small>
              </div>
              <input
                ref={profilePicInputRef}
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length > 0) {
                        handleCustomerData("customerProfileImage", e.target.files[0]);
                      }
                }}
                className={styles.profilePicInput}
                style={{ display: "none" }}
                accept="image/*"
              />
            </div>
            <div className={styles['personal-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setPersonalInfoFormEnabled(!personalInfoFormEnabled)
                }
              >
                {personalInfoFormEnabled ? "Cancel" : "Edit Personal Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setPersonalInfoFormEnabled(!personalInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Personal Information</h2>
              </strong>
              <p>Update your personal details here</p>
              <div
                className={`${styles.customForm} ${
                  personalInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="firstName">First Name:</label>
                    <div className={styles.wrapper}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="firstName"
                        value={customerData.customerFirstName || ""}
                        onChange={(e) =>
                          handleCustomerData(
                            "customerFirstName",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!personalInfoFormEnabled}
                        placeholder="Logan"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="lastName">Last Name:</label>
                    <div className={styles.wrapper}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="lastName"
                        value={customerData.customerLastName || ""}
                        onChange={(e) =>
                          handleCustomerData("customerLastName", e.target.value)
                        }
                        className={styles.input}
                        disabled={!personalInfoFormEnabled}
                        placeholder="Sanders"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="gender">Gender:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <Select
                        styles={customSelectStyles}
                        options={genderOptions.map((gender) => ({
                          value: gender,
                          label: gender,
                        }))}
                        value={
                          customerData.customerGender
                            ? {
                                value: customerData.customerGender,
                                label: customerData.customerGender,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleCustomerData(
                            "customerGender",
                            selectedOption?.value
                          )
                        }
                        placeholder="select your gender"
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
                        isDisabled={!personalInfoFormEnabled}
                      />
                    </div>
                  </div>
                </div>
                {personalInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSavePersonalInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
            <hr />
            <div className={styles['contact-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setContactInfoFormEnabled(!contactInfoFormEnabled)
                }
              >
                {contactInfoFormEnabled ? "Cancel" : "Edit Contact Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setContactInfoFormEnabled(!contactInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Contact Information</h2>
              </strong>
              <p>Update your contact details here</p>
              <div
                className={`${styles.customForm} ${
                  contactInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="mobileNumber">Mobile Number:</label>
                    <div className={`${styles.wrapper} ${styles['phoneInput-wrapper']}`}>
                      <PhoneInput
                        country={"us"}
                        value={customerData.customerMainMobileNo}
                        // eslint-disable-next-line no-unused-vars
                        onChange={(value, country) =>
                          handleCustomerData(
                            "customerMainMobileNo",
                            "+" + value
                          )
                        }
                        disabled={!contactInfoFormEnabled}
                        inputProps={{
                          name: "phone",
                          required: true,
                          autoFocus: true,
                          placeholder: "Enter phone number",
                        }}
                        inputClass="input"
                        containerClass="phoneInput"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="email">Email:</label>
                    <div className={styles.wrapper}>
                      <EmailIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="email"
                        name="email"
                        value={customerData.customerMainEmail || ""}
                        onChange={(e) =>
                          handleCustomerData(
                            "customerMainEmail",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!contactInfoFormEnabled}
                        placeholder="info@gmail.com"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="altMobileNumber">Alt Mobile Number:</label>
                    <div className={`${styles.wrapper} ${styles['phoneInput-wrapper']}`}>
                      <PhoneInput
                        country={"us"}
                        value={customerData.customerAlternateMobileNo}
                        // eslint-disable-next-line no-unused-vars
                        onChange={(value, country) =>
                          handleCustomerData(
                            "customerAlternateMobileNo",
                            "+" + value
                          )
                        }
                        disabled={!contactInfoFormEnabled}
                        inputProps={{
                          name: "phone",
                          required: true,
                          autoFocus: true,
                          placeholder: "Enter phone number",
                        }}
                        inputClass="input"
                        containerClass="phoneInput"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="altEmail">Alt Email:</label>
                    <div className={styles.wrapper}>
                      <EmailIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="email"
                        name="altEmail"
                        value={customerData.customerAlternateEmail || ""}
                        onChange={(e) =>
                          handleCustomerData(
                            "customerAlternateEmail",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!contactInfoFormEnabled}
                        placeholder="info@gmail.com"
                      />
                    </div>
                  </div>
                </div>
                {contactInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSaveContactInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
            <hr />
            <div className={styles['address-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setAddressInfoFormEnabled(!addressInfoFormEnabled)
                }
              >
                {addressInfoFormEnabled ? "Cancel" : "Edit Address Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setAddressInfoFormEnabled(!addressInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Address Information</h2>
              </strong>
              <p>Update your address details here</p>
              <div
                className={`${styles.customForm} ${
                  addressInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="address">Address:</label>
                    <div className={styles.wrapper}>
                      <HomeIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        className={styles.input}
                        name="address"
                        value={customerData.customerAddress || ""}
                        onChange={(e) =>
                          handleCustomerData("customerAddress", e.target.value)
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="enter address"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="landmark">Landmark:</label>
                    <div className={styles.wrapper}>
                      <PlaceIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="landmark"
                        className={styles.input}
                        value={customerData.customerLandmark || ""}
                        onChange={(e) =>
                          handleCustomerData("customerLandmark", e.target.value)
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="enter landmark"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="city">Country:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <PublicIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
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
                          customerData.customerCountry
                            ? {
                                value: customerData.customerCountry,
                                label: customerData.customerCountry,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleCustomerData(
                            "customerCountry",
                            selectedOption?.value
                          )
                        }
                        placeholder="Select your country"
                        components={{
                          DropdownIndicator: () => (
                            <KeyboardArrowDownIcon
                              style={{ color: "#007bff" }}
                            />
                          ),
                        }}
                        className={styles.selectInput}
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="taluk">State:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <LocationCityIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
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
                          customerData.customerState
                            ? {
                                value: customerData.customerState,
                                label: customerData.customerState,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleCustomerData(
                            "customerState",
                            selectedOption?.value
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
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="state">City:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <LocationCityIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <Select
                        styles={customSelectStyles}
                        options={
                          data.citiesOfState.data &&
                          Array.isArray(data.citiesOfState.data)
                            ? data.citiesOfState.data?.map((city: string) => ({
                                value: city,
                                label: city,
                              }))
                            : null
                        }
                        value={
                          customerData.customerCity
                            ? {
                                value: customerData.customerCity,
                                label: customerData.customerCity,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleCustomerData(
                            "customerCity",
                            selectedOption?.value
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
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="country">Taluk:</label>
                    <div className={styles.wrapper}>
                      <StreetviewIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="taluk"
                        className={styles.input}
                        value={customerData.customerTaluk || ""}
                        onChange={(e) =>
                          handleCustomerData("customerTaluk", e.target.value)
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="Enter the taluk"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="pincode">Pincode:</label>
                    <div className={styles.wrapper}>
                      <GpsFixedIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="pincode"
                        className={styles.input}
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
                        value={customerData.customerPincode || ""}
                        onChange={(e) =>
                          handleCustomerData("customerPincode", e.target.value)
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="Enter the pincode"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                {addressInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSaveAddressInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.wrapper}>
            <div className={styles.coverPage}>
              <EditOutlinedIcon className={styles.icon} />
            </div>
            <div className={styles['image-upload-container']}>
              <div className={styles['profile-image']}>
                <img
                  src={
                    typeof serviceProviderData.vendorProfileImage === "string"
                      ? serviceProviderData.vendorProfileImage
                      : URL.createObjectURL(
                          serviceProviderData.vendorProfileImage
                        ) || ""
                  }
                  alt="Avatar"
                  className={styles.img}
                />
                <button className={styles.addIcon} title="addIcon">
                  <AddIcon
                    className={styles.icon}
                    onClick={() => profilePicInputRef.current?.click()}
                  />
                </button>
                <div
                  className={styles.overlay}
                  onClick={() => profilePicInputRef.current?.click()}
                >
                  <FaEdit className={styles.editIcon} />
                  <span>Edit</span>
                </div>
              </div>
              <div className={styles['user-name']}>
                <strong>
                  {serviceProviderData.vendorFirstName +
                    " " +
                    serviceProviderData.vendorLastName}
                </strong>
                <br />
                <small className={styles['user-type']}>( vendor )</small>
              </div>
              <input
                ref={profilePicInputRef}
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length > 0) {
                  handleServiceProviderData(
                    "vendorProfileImage",
                    e.target.files[0]
                  );}
                }}
                className={styles.profilePicInput}
                style={{ display: "none" }}
                accept="image/*"
              />
            </div>
            <div className={styles['personal-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setPersonalInfoFormEnabled(!personalInfoFormEnabled)
                }
              >
                {personalInfoFormEnabled ? "Cancel" : "Edit Personal Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setPersonalInfoFormEnabled(!personalInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Personal Information</h2>
              </strong>
              <p>Update your information about you and details here</p>
              <div
                className={`${styles.customForm} ${
                  personalInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="firstName">First Name:</label>
                    <div className={styles.wrapper}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="firstName"
                        value={serviceProviderData.vendorFirstName || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorFirstName",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!personalInfoFormEnabled}
                        placeholder="Logan"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="lastName">Last Name:</label>
                    <div className={styles.wrapper}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="lastName"
                        value={serviceProviderData.vendorLastName || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorLastName",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!personalInfoFormEnabled}
                        placeholder="Sanders"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="gender">Gender:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <Select
                        styles={customSelectStyles}
                        options={genderOptions.map((gender) => ({
                          value: gender,
                          label: gender,
                        }))}
                        value={
                          serviceProviderData.vendorGender
                            ? {
                                value: serviceProviderData.vendorGender,
                                label: serviceProviderData.vendorGender,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleServiceProviderData(
                            "vendorGender",
                            selectedOption?.value
                          )
                        }
                        placeholder="select your gender"
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
                        isDisabled={!personalInfoFormEnabled}
                      />
                    </div>
                  </div>
                </div>
                {personalInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSavePersonalInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
            <hr />
            <div className={styles['contact-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setContactInfoFormEnabled(!contactInfoFormEnabled)
                }
              >
                {contactInfoFormEnabled ? "Cancel" : "Edit Contact Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setContactInfoFormEnabled(!contactInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Contact Information</h2>
              </strong>
              <p>Update your contact details here</p>
              <div
                className={`${styles.customForm} ${
                  contactInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="mobileNumber">Mobile Number:</label>
                    <div className={`${styles.wrapper} ${styles['phoneInput-wrapper']}`}>
                      <PhoneInput
                        country={"us"}
                        value={serviceProviderData.vendorContact}
                        // eslint-disable-next-line no-unused-vars
                        onChange={(value, country) =>
                          handleServiceProviderData(
                            "vendorContact",
                            "+" + value
                          )
                        }
                        disabled={!contactInfoFormEnabled}
                        inputProps={{
                          name: "phone",
                          required: true,
                          autoFocus: true,
                          placeholder: "Enter phone number",
                        }}
                        inputClass="input"
                        containerClass="phoneInput"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="email">Email:</label>
                    <div className={styles.wrapper}>
                      <EmailIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="email"
                        name="email"
                        value={serviceProviderData.vendorEmail || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorEmail",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!contactInfoFormEnabled}
                        placeholder="info@gmail.com"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="altMobileNumber">Alt Mobile Number:</label>
                    <div className={`${styles.wrapper} ${styles['phoneInput-wrapper']}`}>
                      <PhoneInput
                        country={"us"}
                        value={serviceProviderData.vendorAlternateMobileNo}
                        // eslint-disable-next-line no-unused-vars
                        onChange={(value, country) =>
                          handleServiceProviderData(
                            "vendorAlternateMobileNo",
                            "+" + value
                          )
                        }
                        disabled={!contactInfoFormEnabled}
                        inputProps={{
                          name: "phone",
                          required: true,
                          autoFocus: true,
                          placeholder: "Enter phone number",
                        }}
                        inputClass="input"
                        containerClass="phoneInput"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="altEmail">Alt Email:</label>
                    <div className={styles.wrapper}>
                      <EmailIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="email"
                        name="altEmail"
                        value={serviceProviderData.vendorAlternateEmail || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorAlternateEmail",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        disabled={!contactInfoFormEnabled}
                        placeholder="info@gmail.com"
                      />
                    </div>
                  </div>
                </div>
                {contactInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSaveContactInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
            <hr />
            <div className={styles['address-information']}>
              <button
                className={styles.editText}
                onClick={() =>
                  setAddressInfoFormEnabled(!addressInfoFormEnabled)
                }
              >
                {addressInfoFormEnabled ? "Cancel" : "Edit Address Info"}
              </button>
              <button
              title="editTxt"
                className={styles.editTextIcon}
                onClick={() =>
                  setAddressInfoFormEnabled(!addressInfoFormEnabled)
                }
              >
                <FaEdit className={styles.icon} />
              </button>
              <strong>
                <h2 className={styles.sideHeading}>Address Information</h2>
              </strong>
              <p>Update your address details here</p>
              <div
                className={`${styles.customForm} ${
                  addressInfoFormEnabled && styles["input-enabled"]
                }`}
              >
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="address">Address:</label>
                    <div className={styles.wrapper}>
                      <HomeIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        className={styles.input}
                        name="address"
                        value={serviceProviderData.vendorAddress || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorAddress",
                            e.target.value
                          )
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="enter address"
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="landmark">Landmark:</label>
                    <div className={styles.wrapper}>
                      <PlaceIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="landmark"
                        className={styles.input}
                        value={serviceProviderData.vendorLandmark || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorLandmark",
                            e.target.value
                          )
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="enter landmark"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="city">Country:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <PublicIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
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
                          serviceProviderData.vendorCountry
                            ? {
                                value: serviceProviderData.vendorCountry,
                                label: serviceProviderData.vendorCountry,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleServiceProviderData(
                            "vendorCountry",
                            selectedOption?.value
                          )
                        }
                        placeholder="Select your country"
                        components={{
                          DropdownIndicator: () => (
                            <KeyboardArrowDownIcon
                              style={{ color: "#007bff" }}
                            />
                          ),
                        }}
                        className={styles.selectInput}
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="taluk">State:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <LocationCityIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
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
                          serviceProviderData.vendorState
                            ? {
                                value: serviceProviderData.vendorState,
                                label: serviceProviderData.vendorState,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleServiceProviderData(
                            "vendorState",
                            selectedOption?.value
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
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="state">City:</label>
                    <div className={`${styles.wrapper} ${styles['selectInput-wrapper']}`}>
                      <LocationCityIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <Select
                        styles={customSelectStyles}
                        options={
                          data.citiesOfState.data &&
                          Array.isArray(data.citiesOfState.data)
                            ? data.citiesOfState.data?.map((city: string) => ({
                                value: city,
                                label: city,
                              }))
                            : null
                        }
                        value={
                          serviceProviderData.vendorCity
                            ? {
                                value: serviceProviderData.vendorCity,
                                label: serviceProviderData.vendorCity,
                              }
                            : { value: "", label: "" }
                        }
                        onChange={(selectedOption) =>
                          handleServiceProviderData(
                            "vendorCity",
                            selectedOption?.value
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
                        menuShouldScrollIntoView={false}
                        hideSelectedOptions={false}
                        closeMenuOnSelect
                        isClearable={false}
                        isSearchable
                        isDisabled={!addressInfoFormEnabled}
                      />
                    </div>
                  </div>
                  <div className={styles['input-group']}>
                    <label htmlFor="country">Taluk:</label>
                    <div className={styles.wrapper}>
                      <StreetviewIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="taluk"
                        className={styles.input}
                        value={serviceProviderData.vendorTaluk || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorTaluk",
                            e.target.value
                          )
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="Enter the taluk"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['input-row']}>
                  <div className={styles['input-group']}>
                    <label htmlFor="pincode">Pincode:</label>
                    <div className={styles.wrapper}>
                      <GpsFixedIcon className={styles.icon} />
                      <div className={styles['vertical-divider']}></div>
                      <input
                        type="text"
                        name="pincode"
                        className={styles.input}
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
                        value={serviceProviderData.vendorPincode || ""}
                        onChange={(e) =>
                          handleServiceProviderData(
                            "vendorPincode",
                            e.target.value
                          )
                        }
                        disabled={!addressInfoFormEnabled}
                        placeholder="Enter the pincode"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                {addressInfoFormEnabled && (
                  <button
                    type="submit"
                    className={styles['save-button']}
                    onClick={handleSaveAddressInfo}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfileForm;
