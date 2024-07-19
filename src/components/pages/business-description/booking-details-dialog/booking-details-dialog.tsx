"use client"

import React, { useEffect, useState } from "react";
// import { useHistory } from 'react-router-dom';
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import axios from "axios";
import Select, { SingleValue } from "react-select";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import PersonIcon from "@mui/icons-material/Person";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BusinessIcon from "@mui/icons-material/Business";
import PlaceIcon from "@mui/icons-material/Place";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import BedIcon from "@mui/icons-material/Bed";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ErrorIcon from "@mui/icons-material/Error";
import { FaLandmark, FaCar } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";

import { LoadingScreen } from "@/components/sub-components";
import emailjs from "emailjs-com";
import styles from "./booking-details-dialog.module.scss";
import { RootState } from "@/redux/store";

type Props = {
  open: boolean;
  handleClose: () => void;
  hallData: any;
  serviceProviderData: any;
};

const BookingDetailsDialogComponent = ({
  open,
  handleClose,
  hallData,
  serviceProviderData,
}: Props) => {
  // const history = useHistory();
  const dataStore = useAppSelector((state: RootState) => state.dataInfo); // CITIES, EVENT_TYPES & VENDOR_TYPES data
  const bookingInfoStore = useAppSelector(
    (state: RootState) => state.bookingInfo
  ); // user Booking information
  const userInfoStore = useAppSelector((state: RootState) => state.userInfo); // user Authentication information

  const [isLoading, setIsLoading] = useState(false); // toggle loading screen
  const [formProgress, setFormProgress] = useState(0);
  const [formType, setFormType] = useState("FORM_ONE"); // FORM_ONE, FORM_TWO, FORM_THREE, FORM_FOUR
  const [submissionConfirmationDialog, setSubmissionConfirmationDialog] =
    useState(false);
  const [formErrorUpdateFlag, setFormErrorUpdateFlag] = useState(false); // error update flag for form
  const [bookingConfirmationScreen, setBookingConfirmationScreen] =
    useState(false); // toggle booking confirmation screen

  // type of react select options
  interface ReactSelectOptionType {
    label: string;
    value: string;
  }

  interface ReactSelectBooleanOptionType {
    value: boolean;
    label: string;
  }

  const ReactSelectBooleanOptions: ReactSelectBooleanOptionType[] = [
    {
      value: true,
      label: "Yes",
    },
    {
      value: false,
      label: "No",
    },
  ];

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      fontSize: "15px",
      minHeight: "32px",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      border: "none",
      outline: "none",
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
      padding: 10,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999999", // Change the placeholder color here
    }),
  };

  interface bookingDetailsType {
    bookingId: string;
    eventTypeInfo: {
      eventType: string;
      eventTypeId: string;
    };
    guestsCount: number | null;
    roomsCount: number | null;
    parkingRequirement: {
      label: string;
      value: boolean;
    } | null;
    vehiclesCount: number | null;
    expectedVegRate: number | null;
    expectedNonVegRate: number | null;
    vegMenu: string;
    nonVegMenu: string;
    catererRequirement: {
      label: string;
      value: boolean;
    } | null;
    customerSuggestion: string;
  }

  const bookingDetailsTemplate = {
    bookingId: "",
    eventTypeInfo: {
      eventType: "",
      eventTypeId: "",
    },
    guestsCount: null,
    roomsCount: null,
    parkingRequirement: {
      label: "Yes",
      value: true,
    },
    vehiclesCount: null,
    expectedVegRate: null,
    expectedNonVegRate: null,
    vegMenu: "",
    nonVegMenu: "",
    catererRequirement: {
      label: "Yes",
      value: true,
    },
    customerSuggestion: "",
  };

  // object storing user's booking requirements
  const [bookingDetails, setBookingDetails] = useState({
    ...bookingDetailsTemplate,
  });

  interface bookingDetailsErrorInfoType
    extends Omit<
      bookingDetailsType,
      "eventTypeInfo" | "guestsCount" | "roomsCount" | "vehiclesCount"
    > {
    eventTypeInfo: string;
    guestsCount: string;
    roomsCount: string;
    vehiclesCount: string;
  }

  const [bookingDetailsErrorInfo, setBookingDetailsErrorInfo] = useState({
    ...bookingDetailsTemplate,
    eventTypeInfo: "",
    guestsCount: "",
    roomsCount: "",
    vehiclesCount: "",
  });

  const sendConfirmationEmail = (bookingId: string, type: string) => {
    // Configure the email service, template, and user ID
    const service_id = "service_2fup20o";
    let template_id;
    if (type == "sendtocustomer") {
      template_id = "template_l4np6ir";
    } else {
      template_id = "template_4t80nyc";
    }
    const user_id = "0oIWr5bjMsZhioM54";
    const customerEmail = userInfoStore.userDetails.Document.customerEmail;
    const vendorEmail = serviceProviderData.vendorEmail;
    // Prepare the email parameters
    const emailParams = {
      service_id: service_id,
      template_id: template_id,
      user_id: user_id,
      template_params: {
        // Add the relevant details from the `bookingDetails` object and other data sources
        to_email: customerEmail, // Replace with the recipient's email
        vendor_email: vendorEmail, // Replace with the sender's email
        vendor_name: serviceProviderData.vendorName,
        to_name: userInfoStore.userDetails.Document.customerName,
        bookingId: bookingId,
        hallName: hallData.hallName,
      },
    };

    // Send the email
    emailjs
      .send(
        emailParams.service_id,
        emailParams.template_id,
        emailParams.template_params,
        emailParams.user_id
      )
      .then((response) => {
        console.log("Email sent successfully", response.status, response.text);
        // Handle successful email send
      })
      .catch((error) => {
        console.error("Failed to send email", error);
        // Handle email send failure
      });
  };

  const handleSubmissionConfirmationDialogOpen = () => {
    setSubmissionConfirmationDialog(true);
  };

  const handleSubmissionConfirmationDialogClose = () => {
    setSubmissionConfirmationDialog(false);
  };

  const handleBookingDetailsInfo = (key: string, value: any) => {
    setBookingDetails((previousInfo) => ({
      ...previousInfo,
      [key]: value,
    }));
  };

  const handleBookingDetailsErrorInfo = (key: string, value: string) => {
    setBookingDetailsErrorInfo((previousInfo) => ({
      ...previousInfo,
      [key]: value,
    }));
  };

  console.log(serviceProviderData);
  console.log(hallData);

  function parseDate(dateString: string, splitCriteria: string): Date | null {
    if (splitCriteria === "/") {
      // DD/MM/YYYY
      const parts: string[] = dateString.split("/");
      // Month is 0-based, so we subtract 1 from the month value
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10)
      );
    } else if (splitCriteria === "-") {
      // YYYY-MM-DD
      const parts: string[] = dateString.split("-");
      // Month is 0-based, so we subtract 1 from the month value
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2])
      );
    }
    return null;
  }

  useEffect(() => {
    if (!bookingDetails.eventTypeInfo.eventTypeId) {
      return;
    }

    try {
      const requiredFields = [
        bookingDetailsErrorInfo.eventTypeInfo,
        bookingDetailsErrorInfo.guestsCount,
        bookingDetailsErrorInfo.roomsCount,
        bookingDetailsErrorInfo.vehiclesCount,
      ];

      const isFormValid = requiredFields.every((field) => field === "");

      if (isFormValid) {
        setFormType("FORM_THREE");
      }
    } catch (error) {
      console.error(error);
    }
  }, [formErrorUpdateFlag]);

  const validateFormTwo = () => {
    if (!bookingDetails.eventTypeInfo.eventType) {
      handleBookingDetailsErrorInfo("eventTypeInfo", "Event type is required");
    } else {
      handleBookingDetailsErrorInfo("eventTypeInfo", "");
    }
    if (!bookingDetails.guestsCount) {
      handleBookingDetailsErrorInfo("guestsCount", "Guests count is required");
    } else {
      handleBookingDetailsErrorInfo("guestsCount", "");
    }
    if (!bookingDetails.roomsCount) {
      handleBookingDetailsErrorInfo("roomsCount", "Rooms count is required");
    } else {
      handleBookingDetailsErrorInfo("roomsCount", "");
    }
    if (!bookingDetails.vehiclesCount) {
      handleBookingDetailsErrorInfo(
        "vehiclesCount",
        "Vehicles count is required"
      );
    } else {
      handleBookingDetailsErrorInfo("vehiclesCount", "");
    }

    setFormErrorUpdateFlag((prevFlag) => !prevFlag);
  };

  const handlePrevBtnClick = () => {
    switch (formType) {
      case "FORM_ONE":
        break;
      case "FORM_TWO":
        setFormProgress(0);
        setFormType("FORM_ONE");
        break;
      case "FORM_THREE":
        setFormProgress(25);
        setFormType("FORM_TWO");
        break;
      case "FORM_FOUR":
        setFormProgress(50);
        setFormType("FORM_THREE");
        break;
      default:
        break;
    }
  };

  const handleNextBtnClick = () => {
    switch (formType) {
      case "FORM_ONE":
        setFormProgress(25);
        setFormType("FORM_TWO");
        break;
      case "FORM_TWO":
        setFormProgress(50);
        validateFormTwo();
        break;
      case "FORM_THREE":
        setFormProgress(75);
        setFormType("FORM_FOUR");
        break;
      case "FORM_FOUR":
        handleSubmissionConfirmationDialogOpen();
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async () => {
    // setIsLoading(true);
    try {
      const parsedStartDateObject: Date | null = parseDate(
        bookingInfoStore.bookingStartDate,
        "-"
      );
      const parsedEndDateObject: Date | null = parseDate(
        bookingInfoStore.bookingEndDate,
        "-"
      );
      parsedStartDateObject?.setHours(
        parseInt(bookingInfoStore.startTime.split(":")[0]),
        0,
        0,
        0
      );
      parsedEndDateObject?.setHours(
        parseInt(bookingInfoStore.endTime.split(":")[0]),
        0,
        0,
        0
      );

      console.log("FINAL BOOKING START DATE: " + parsedStartDateObject);
      console.log("FINAL BOOKING END DATE: " + parsedEndDateObject);

      const postData = {
        hallId: hallData._id,
        hallCity: hallData.hallCity,
        hallUserId: hallData.hallUserId,
        vendorTypeId: serviceProviderData.vendorTypeId,
        eventId: bookingDetails.eventTypeInfo.eventTypeId,
        customerId: userInfoStore.userDetails?.Document?._id,
        bookingType: "HALL",
        bookCaterer: bookingDetails.catererRequirement.value,
        bookingStartDateTimestamp: parsedStartDateObject,
        bookingEndDateTimestamp: parsedEndDateObject,
        bookingDuration: parseInt(
          bookingInfoStore.bookingDuration.split(":")[0]
        ),
        bookingStatusRemark: "",

        guestsCount: bookingDetails.guestsCount
          ? parseInt(bookingDetails.guestsCount)
          : 0,
        roomsCount: bookingDetails.roomsCount
          ? parseInt(bookingDetails.roomsCount)
          : 0,
        parkingRequirement: bookingDetails.parkingRequirement
          ? bookingDetails.parkingRequirement.value
          : false,
        vehiclesCount: bookingDetails.vehiclesCount
          ? parseInt(bookingDetails.vehiclesCount)
          : 0,
        customerVegRate: bookingDetails.expectedVegRate
          ? parseInt(bookingDetails.expectedVegRate)
          : 0,
        customerNonVegRate: bookingDetails.expectedNonVegRate
          ? parseInt(bookingDetails.expectedNonVegRate)
          : 0,
        customerVegItemsList: bookingDetails.vegMenu,
        customerNonVegItemsList: bookingDetails.nonVegMenu,
        customerInfo: "",
        customerSuggestion: bookingDetails.customerSuggestion,
      };

      const response = await axios.post(`/api/routes/bookingMaster/`, postData);
      console.log(response);
      sendConfirmationEmail(response.data?.documentId, "sendtocustomer");
      //sendConfirmationEmail(response.data?.documentId,"sendtovendor");

      handleBookingDetailsInfo("bookingId", response.data?.documentId);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }

    setIsLoading(false);
    setBookingConfirmationScreen(true);
    setFormType("FORM_ONE");
  };

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={() => {
        setFormType("FORM_ONE");
        handleClose();
      }}
      maxWidth="md"
      fullWidth
    >
      {isLoading && (
        <div>
          <LoadingScreen />
        </div>
      )}
      <Dialog
        open={submissionConfirmationDialog}
        onClose={handleSubmissionConfirmationDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Booking ?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Before proceeding, please verify that the details entered are
            correct to the best of your knowledge. Click &apos;OK&apos; to
            confirm and proceed with the booking, or &apos;Cancel&apos; to
            review your details once again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmissionConfirmationDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSubmissionConfirmationDialogClose();
              handleFormSubmit();
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      {bookingConfirmationScreen ? (
        <div className={styles.bookingConfirmationScreen__container}>
          <div className={styles.wrapper}>
            <div className={styles.contents__wrapper}>
              <img src={"/images/successLogo.png"} alt="" />
              <h2 className={styles.title}>Your booking was successful !!</h2>
              <div className={styles.description}>
                Your booking is on hold, pending confirmation from the vendor.
                We&lsquo;ve notified the vendor about your request. Once they
                confirm your booking, we&apos;ll send you a confirmation.
              </div>
              <div className={styles.bookingDetails__wrapper}>
                <h2 className={styles.title}>Booking Details</h2>
                <div className={styles.details__wrapper}>
                  <div className={styles['sub-wrapper']}>
                    <div className={styles.key}>Booking Id:</div>
                    <div className={styles.value}>{bookingDetails.bookingId}</div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles['sub-wrapper']}>
                    <div className={styles.key}>Start Date:</div>
                    <div className={styles.value}>
                      {bookingInfoStore.bookingStartDate}
                    </div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles['sub-wrapper']}>
                    <div className={styles.key}>End Date:</div>
                    <div className={styles.value}>
                      {bookingInfoStore.bookingEndDate}
                    </div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles['sub-wrapper']}>
                    <div className={styles.key}>Total:</div>
                    <div className={styles.value}>$0</div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles['sub-wrapper']}>
                    <div className={styles.key}>Status:</div>
                    <div className={styles.value}>PENDING</div>
                  </div>
                </div>
              </div>
              <button
                className={styles.continueBtn}
                onClick={() => {
                  handleClose();
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.bookingDetailsMain__container}>
          <div className={styles.headings__wrapper}>
            <h1 className={styles.heading}>booking form</h1>
            <h6 className={styles['sub-heading']}>
              Fill in the below details to continue
            </h6>
          </div>
          <div className={styles.navigationTabs__wrapper}>
            <div
              className={`${styles.navigationTab} ${
                formType !== "FORM_ONE" ? styles.form__completed : styles.current__form
              }`}
            >
              <div className={styles.tabHeading}>hall details</div>
              <div className={styles.wrapper}>
                <div className={styles['sub-wrapper']}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 1</p>
                </div>
                <div className={styles.btn}>
                  {formType !== "FORM_ONE" ? "Completed" : "Pending"}
                </div>
              </div>
            </div>
            <div
              className={`${styles.navigationTab} ${
                formType !== "FORM_ONE" &&
                (formType === "FORM_TWO" ? styles.current__form : styles.form__completed)
              }`}
            >
              <div className={styles.tabHeading}>preferences</div>
              <div className={styles.wrapper}>
                <div className={styles['sub-wrapper']}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 2</p>
                </div>
                <div className={styles.btn}>
                  {formType === "FORM_THREE" || formType === "FORM_FOUR"
                    ? "Completed"
                    : "Pending"}
                </div>
              </div>
            </div>
            <div
              className={`${styles.navigationTab} ${
                formType === "FORM_THREE"
                  ? styles.current__form
                  : formType === "FORM_FOUR" && styles.form__completed
              }`}
            >
              <div className={styles.tabHeading}>user details</div>
              <div className={styles.wrapper}>
                <div className={styles['sub-wrapper']}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 3</p>
                </div>
                <div className={styles.btn}>
                  {formType === "FORM_FOUR" ? "Completed" : "Pending"}
                </div>
              </div>
            </div>
            <div
              className={`${styles.navigationTab} ${
                formType === "FORM_FOUR" && styles.current__form
              }`}
            >
              <div className={styles.tabHeading}>date & time</div>
              <div className={styles.wrapper}>
                <div className={styles['sub-wrapper']}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 4</p>
                </div>
                <div className={styles.btn}>pending</div>
              </div>
            </div>
          </div>
          <div className={styles.form__wrapper}>
            {formType === "FORM_ONE" && (
              <div className={`${styles.container} ${styles.hallDetails__container}`}>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>hall name</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <BusinessIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      value={hallData?.hallName}
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>location</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <PlaceIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={`${hallData?.hallTaluk}, ${hallData?.hallCity}, ${hallData?.hallState}`}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>landmark</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <FaLandmark className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={hallData?.hallLandmark}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>seating capacity</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <EventSeatIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={hallData?.hallCapacity}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>No. of Rooms</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <BedIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={hallData?.hallRooms}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>veg food rate</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <RestaurantIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={hallData?.hallVegRate}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>Non-Veg food rate</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <RestaurantIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={hallData?.hallNonVegRate}
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className={`${styles.inputField__wrapper} ${styles['half-width']}`}>
                  <div className={styles.title}>Parking Availability</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <LocalParkingIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      value={
                        hallData?.hallParking ? "Available" : "Unavailable"
                      }
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
            {formType === "FORM_TWO" && (
              <div className={`${styles.container} ${styles.preferences__container}`}>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      Event Type <span>*</span>
                    </div>
                    <div
                      className={styles.input__wrapper}
                      style={
                        bookingDetailsErrorInfo.eventTypeInfo
                          ? { border: "2px solid red" }
                          : {}
                      }
                    >
                      <CurrencyRupeeIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <Select
                        styles={customStyles}
                        options={
                          Array.isArray(dataStore.eventTypes.data)
                            ? dataStore.eventTypes.data.map(
                                (item: { _id: string; eventName: string }) => ({
                                  value: item._id,
                                  label: item.eventName,
                                })
                              )
                            : null
                        }
                        value={
                          bookingDetails.eventTypeInfo.eventTypeId
                            ? {
                                label: bookingDetails.eventTypeInfo.eventType,
                                value: bookingDetails.eventTypeInfo.eventTypeId,
                              }
                            : null
                        }
                        onChange={(
                          selectedOption: SingleValue<ReactSelectOptionType>
                        ) => {
                          const updatedEventInfo = {
                            eventType: selectedOption?.label || "",
                            eventTypeId: selectedOption?.value || "",
                          };
                          handleBookingDetailsInfo(
                            "eventTypeInfo",
                            updatedEventInfo
                          );
                        }}
                        placeholder="Choose Event Type"
                        components={{
                          DropdownIndicator: () => (
                            <KeyboardArrowDownIcon
                              style={{ color: "#007bff" }}
                            />
                          ),
                        }}
                        className={`${styles.input} ${styles.selectInput}`}
                        menuShouldScrollIntoView={false}
                        closeMenuOnSelect
                        isSearchable
                      />
                    </div>
                    {bookingDetailsErrorInfo.eventTypeInfo && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{bookingDetailsErrorInfo.eventTypeInfo}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      Caterer Requirement <span>*</span>
                    </div>
                    <div className={styles.input__wrapper}>
                      <CurrencyRupeeIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <Select
                        options={ReactSelectBooleanOptions}
                        value={
                          bookingDetails.catererRequirement.value
                            ? {
                                label: bookingDetails.catererRequirement.label,
                                value: bookingDetails.catererRequirement.value,
                              }
                            : null
                        }
                        onChange={(
                          selectedOption: SingleValue<ReactSelectBooleanOptionType>
                        ) => {
                          const updatedInfo = {
                            label: selectedOption?.label || "No",
                            value: selectedOption?.value || false,
                          };
                          handleBookingDetailsInfo(
                            "catererRequirement",
                            updatedInfo
                          );
                        }}
                        placeholder="Do you need a caterer?"
                        components={{
                          DropdownIndicator: () => (
                            <KeyboardArrowDownIcon
                              style={{ color: "#007bff" }}
                            />
                          ),
                        }}
                        className={`${styles.input} ${styles.selectInput}`}
                        menuShouldScrollIntoView={false}
                        closeMenuOnSelect
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      No. of Guests Required <span>*</span>
                    </div>
                    <div
                      className={styles.input__wrapper}
                      style={
                        bookingDetailsErrorInfo.guestsCount
                          ? { border: "2px solid red" }
                          : {}
                      }
                    >
                      <PeopleAltIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="number"
                        name="guestsCount"
                        value={bookingDetails.guestsCount || 0}
                        className={styles.input}
                        placeholder="Enter guest count"
                        onChange={(event) =>
                          handleBookingDetailsInfo(
                            "guestsCount",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    {bookingDetailsErrorInfo.guestsCount && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{bookingDetailsErrorInfo.guestsCount}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      No. of Rooms Required <span>*</span>
                    </div>
                    <div
                      className={styles.input__wrapper}
                      style={
                        bookingDetailsErrorInfo.roomsCount
                          ? { border: "2px solid red" }
                          : {}
                      }
                    >
                      <BedIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="number"
                        name="roomCount"
                        value={bookingDetails.roomsCount || 0}
                        className={styles.input}
                        placeholder="Enter room count"
                        onChange={(event) =>
                          handleBookingDetailsInfo(
                            "roomsCount",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    {bookingDetailsErrorInfo.roomsCount && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{bookingDetailsErrorInfo.roomsCount}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      Parking Requirement <span>*</span>
                    </div>
                    <div className={styles.input__wrapper}>
                      <LocalParkingIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <Select
                        options={ReactSelectBooleanOptions}
                        value={
                          bookingDetails.parkingRequirement.value
                            ? {
                                label: bookingDetails.parkingRequirement.label,
                                value: bookingDetails.parkingRequirement.value,
                              }
                            : null
                        }
                        onChange={(
                          selectedOption: SingleValue<ReactSelectBooleanOptionType>
                        ) => {
                          const updatedInfo = {
                            label: selectedOption?.label || "",
                            value: selectedOption?.value || false,
                          };
                          handleBookingDetailsInfo(
                            "parkingRequirement",
                            updatedInfo
                          );
                        }}
                        placeholder="Do you require parking?"
                        components={{
                          DropdownIndicator: () => (
                            <KeyboardArrowDownIcon
                              style={{ color: "#007bff" }}
                            />
                          ),
                        }}
                        className={`${styles.input} ${styles.selectInput}`}
                        menuShouldScrollIntoView={false}
                        closeMenuOnSelect
                        isSearchable={false}
                      />
                    </div>
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>
                      No. Of Vehicles <span>*</span>
                    </div>
                    <div
                      className={styles.input__wrapper}
                      style={
                        bookingDetailsErrorInfo.vehiclesCount
                          ? { border: "2px solid red" }
                          : {}
                      }
                    >
                      <FaCar className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="number"
                        name="vehiclesCount"
                        value={bookingDetails.vehiclesCount || 0}
                        className={styles.input}
                        placeholder="Enter vehicle count"
                        onChange={(event) =>
                          handleBookingDetailsInfo(
                            "vehiclesCount",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    {bookingDetailsErrorInfo.vehiclesCount && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{bookingDetailsErrorInfo.vehiclesCount}</p>
                      </div>
                    )}
                  </div>
                </div>
                {bookingDetails.catererRequirement.value && (
                  <>
                    <div className={styles.inputFields__wrapper}>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>Expected Veg Rate/plate</div>
                        <div className={styles.input__wrapper}>
                          <CurrencyRupeeIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="number"
                            name="expectedVegRate"
                            value={bookingDetails.expectedVegRate || 0}
                            className={styles.input}
                            placeholder="enter your expected rate/plate"
                            onChange={(event) =>
                              handleBookingDetailsInfo(
                                "expectedVegRate",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>Expected Non-Veg Rate/plate</div>
                        <div className={styles.input__wrapper}>
                          <CurrencyRupeeIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="number"
                            name="expectedNonVegRate"
                            value={bookingDetails.expectedNonVegRate || 0}
                            className={styles.input}
                            placeholder="enter your expected rate/plate"
                            onChange={(event) =>
                              handleBookingDetailsInfo(
                                "expectedNonVegRate",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.inputFields__wrapper}>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>Veg Menu Required</div>
                        <div className={styles.input__wrapper}>
                          <RestaurantMenuIcon className={styles.icon} />
                          <div className={styles.textAreaDivider}></div>
                          <textarea
                            name="vegMenu"
                            value={bookingDetails.vegMenu}
                            placeholder="enter items desired in veg menu"
                            className={`${styles.input} ${styles.textArea}`}
                            onChange={(event) =>
                              handleBookingDetailsInfo(
                                "vegMenu",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>Non-Veg Menu Required</div>
                        <div className={styles.input__wrapper}>
                          <RestaurantMenuIcon className={styles.icon} />
                          <div className={styles.textAreaDivider}></div>
                          <textarea
                            name="nonVegMenu"
                            value={bookingDetails.nonVegMenu}
                            placeholder="enter items desired in veg menu"
                            className={`${styles.input} ${styles.textArea}`}
                            onChange={(event) =>
                              handleBookingDetailsInfo(
                                "nonVegMenu",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {formType == "FORM_THREE" && (
              <div className={`${styles.container} ${styles.userDetails__container}`}>
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>First Name</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={
                          userInfoStore.userDetails?.Document?.customerName.includes(
                            " "
                          )
                            ? userInfoStore.userDetails?.Document?.customerName.split(
                                " "
                              )[0]
                            : userInfoStore.userDetails?.Document?.customerName
                        }
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>Last Name</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <PersonIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        type="text"
                        value={
                          userInfoStore.userDetails?.Document?.customerName.includes(
                            " "
                          )
                            ? userInfoStore.userDetails?.Document?.customerName.split(
                                " "
                              )[1]
                            : ""
                        }
                        className={styles.input}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Office Contact</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <BusinessIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      value={
                        userInfoStore.userDetails?.Document?.customerContact
                      }
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Personal Contact</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <BusinessIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      value={
                        userInfoStore.userDetails?.Document?.customerContact
                      }
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Email Id</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <EmailIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      value={userInfoStore.userDetails?.Document?.customerEmail}
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Your Message</div>
                  <div className={styles.input__wrapper}>
                    <MessageIcon className={styles.icon} />
                    <div className={styles.textAreaDivider}></div>
                    <textarea
                      name="customerSuggestion"
                      value={bookingDetails.customerSuggestion}
                      className={`${styles.input} ${styles.textArea}`}
                      placeholder="your message to the hall owner..."
                      onChange={(event) =>
                        handleBookingDetailsInfo(
                          "customerSuggestion",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            {formType === "FORM_FOUR" && (
              <div
                className={`${styles.container} ${styles.dateTime__container}`}
                style={{ width: "50%" }}
              >
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Booking Start Date</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <CalendarMonthIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      name="bookingDate"
                      value={bookingInfoStore.bookingStartDate}
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Start Time</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <AccessAlarmIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      placeholder="startTime"
                      type="text"
                      name="startTime"
                      value={
                        bookingInfoStore.startTime
                          ? bookingInfoStore.startTime
                          : "HH:MM"
                      }
                      className={styles.input}
                      disabled
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Booking End Date</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <CalendarMonthIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      type="text"
                      name="bookingDate"
                      value={bookingInfoStore.bookingEndDate}
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>End Time</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <AccessAlarmIcon className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      placeholder="endTime"
                      type="text"
                      name="endTime"
                      value={
                        bookingInfoStore.endTime
                          ? bookingInfoStore.endTime
                          : "HH:MM"
                      }
                      className={styles.input}
                      disabled
                    />
                  </div>
                </div>
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Total Duration</div>
                  <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                    <GiSandsOfTime className={styles.icon} />
                    <div className={styles.divider}></div>
                    <input
                      placeholder="bookingDuration"
                      name="bookingDuration"
                      type="text"
                      value={
                        bookingInfoStore.bookingDuration
                          ? `${
                              bookingInfoStore.bookingDuration.split(":")[0]
                            } hour`
                          : "HH:MM"
                      }
                      className={styles.input}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
            <div className={styles.lineSeparator}></div>
            <div className={styles.footer__wrapper}>
              <div className={styles.progressBar__wrapper}>
                <div className={styles.title}>
                  <p className={styles.mainTitle}>Form progress</p>
                  <p className={styles.subTitle}>{formProgress} % Completed</p>
                </div>
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-valuenow={formProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{
                    width: `${formProgress}%`,
                    backgroundColor: "#007bff",
                    height: "4px",
                  }}
                ></div>
              </div>
              <div className={styles.btns__wrapper}>
                <div className={styles.caption}>* Mandatory Fields</div>
                <button className={`${styles.btn} ${styles.prevBtn}`} onClick={handlePrevBtnClick}>
                  prev
                </button>
                <button className={`${styles.btn} ${styles.nextBtn}`} onClick={handleNextBtnClick}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default BookingDetailsDialogComponent;
