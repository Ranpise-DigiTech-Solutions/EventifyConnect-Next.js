/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/lib/hooks';

import {
    Tag,
    Card,
    Row,
    Col,
    Typography,
    Button,
    message,
    Space,
    DatePicker,
  } from "antd";
  
  import Box from "@mui/material/Box";
  import Tabs from "@mui/material/Tabs";
  import Tab from "@mui/material/Tab";
  import Dialog from "@mui/material/Dialog";
  import Select, { SingleValue } from "react-select";
  import Alert from "@mui/material/Alert";
  
  import ShareIcon from "@mui/icons-material/Share";
  import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
  import BusinessIcon from "@mui/icons-material/Business";
  import PlaceIcon from "@mui/icons-material/Place";
  import EventSeatIcon from "@mui/icons-material/EventSeat";
  import BedIcon from "@mui/icons-material/Bed";
  import LocalParkingIcon from "@mui/icons-material/LocalParking";
  import RestaurantIcon from "@mui/icons-material/Restaurant";
  import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
  import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
  import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
  import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
  import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
  import ErrorIcon from "@mui/icons-material/Error";
  import SearchIcon from "@mui/icons-material/Search";
  import { FaLandmark, FaCar } from "react-icons/fa";
  import { GiSandsOfTime } from "react-icons/gi";
  import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
  } from "@ant-design/icons";

import { LoadingScreen } from '@/components/sub-components';
import styles from './booking-details-dialog.module.scss';

import axios from "axios";
import { RootState } from '@/redux/store';

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
    background: state.isDisabled ? "rgba(0, 0, 0, 0.01)" : "#ffffff", // Set background color here
    color: state.isDisabled ? "#d9d9d9" : "#000000", // Set color here
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
  input: (provided: any, state: any) => ({
    ...provided,
    color: state.isDisabled ? "#d9d9d9" : "#000000",
    margin: 0,
    padding: 0,
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    color: state.isDisabled ? "#d9d9d9" : "#000000", // Adjust the text color if necessary
  }),
};

interface bookingDetailsType {
  _id: string | null,
  documentId: string | null,
  bookingStartDateObject: Date | null,
  bookingEndDateObject: Date | null,
  bookingStartDate: string | null,
  bookingEndDate: string | null,
  bookingStartTime: string | null,
  bookingEndTime: string | null,
  bookingDuration: number | null,
  bookingStatus: string | null,
  catererRequirement: {
    label: string | null,
    value: boolean | null,
  },
  guestsCount: number | null,
  roomsCount: number | null,
  parkingRequirement: {
    label: string | null,
    value: boolean | null,
  },
  vehiclesCount: number | null,
  customerVegRate: number | null,
  customerNonVegRate: number | null,
  customerVegItemsList: string | null,
  customerNonVegItemsList: string | null,
  // fields from vendorType collection
  vendorType: string | null,
  //fields from eventType collection
  eventTypeInfo: {
    label: string | null,
    value: string | null,
  },
  //fields from hallMaster collection
  hallData: {
    _id: string | null,
    hallName: string | null,
    hallLocation: string | null,
    hallLandmark: string | null,
    hallCapacity: number | null,
    hallRooms: number | null,
    hallVegRate: number | null,
    hallNonVegRate: number | null,
    hallParking: string | null,
    hallImage: string | null,
  },
  //fields from customer collection
  customerData: {
    _id: string | null,
    customerName: string | null,
    customerEmail: string | null,
    customerContact: string | null,
    customerAddress: string | null,
    customerLandmark: string | null,
    customerProfileImage: string | null,
    customerAlternateMobileNo: string | null,
    customerAlternateEmail: string | null,
  },
}

const bookingDetailsTemplate = {
  _id: null,
  documentId: null,
  bookingStartDateObject: null,
  bookingEndDateObject: null,
  bookingStartDate: null,
  bookingEndDate: null,
  bookingStartTime: null,
  bookingEndTime: null,
  bookingDuration: null,
  bookingStatus: null,
  catererRequirement: {
    label: null,
    value: null,
  },
  guestsCount: 0,
  roomsCount: 0,
  parkingRequirement: {
    label: null,
    value: null,
  },
  vehiclesCount: 0,
  customerVegRate: null,
  customerNonVegRate: null,
  customerVegItemsList: null,
  customerNonVegItemsList: null,
  // fields from vendorType collection
  vendorType: null,
  //fields from eventType collection
  eventTypeInfo: {
    label: null,
    value: null,
  },
  //fields from hallMaster collection
  hallData: {
    _id: null,
    hallName: null,
    hallLocation: null,
    hallLandmark: null,
    hallCapacity: null,
    hallRooms: null,
    hallVegRate: null,
    hallNonVegRate: null,
    hallParking: null,
    hallImage: null,
  },
  customerData: {
    _id: null,
    customerName: null,
    customerAddress: null,
    customerLandmark: null,
    customerEmail: null,
    customerContact: null,
    customerProfileImage: null,
    customerAlternateMobileNo: null,
    customerAlternateEmail: null,
  },
};

type Props = {
    open: boolean;
    handleClose: ()=> void;
    currentBooking: any;
    userType: string;
    vendorType: string;
}

const BookingDetailsDialogComponent = ({ open, handleClose, currentBooking, userType, vendorType }: Props) => {
    const [currentActiveTab, setCurrentActiveTab] = useState<0 | 1 | 2 | 3>(0);
    const dataStore = useAppSelector((state: RootState) => state.dataInfo); // CITIES, EVENT_TYPES & VENDOR_TYPES data
    const [isFormTwoDisabled, setIsFormTwoDisabled] = useState<boolean>(true);
    const [isFormThreeDisabled, setIsFormThreeDisabled] = useState<boolean>(true);
  
    const { Title, Text } = Typography;
    const { RangePicker } = DatePicker;
    const [messageApi, contextHolder] = message.useMessage(); // Message API to display Alert Messages - from Ant Design
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(false); // toggle loading screen
    const [triggerSlotAvailabilityCheck, setTriggerSlotAvailabilityCheck] =
      useState<boolean>(false); // trigger the slot availability check - trigger useEffect
  
    // Refs to keep track of the initial render for each useEffect
    // const isInitialRender1 = useRef(true);
  
    const handleCurrentActiveTabChange = (event: any, newValue: any) => {
      setCurrentActiveTab(newValue);
    };

    // type of react select options
  interface ReactSelectOptionType {
    label: string | null;
    value: string | null;
  }

  interface ReactSelectBooleanOptionType {
    value: boolean | null;
    label: string | null;
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
  
    console.log("CURRENT BOOKING", currentBooking);
  
    // object storing user's booking requirements
    const [bookingDetails, setBookingDetails] = useState<bookingDetailsType>({
      ...bookingDetailsTemplate,
    });

    interface bookingDetailsErrorInfoType extends Omit<bookingDetailsType, 'eventTypeInfo' | 'guestsCount' | 'roomsCount' | 'vehiclesCount'> {
      eventTypeInfo: string;
      guestsCount: string;
      roomsCount: string;
      vehiclesCount: string,
    }
  
    const [bookingDetailsErrorInfo, setBookingDetailsErrorInfo] = useState<bookingDetailsErrorInfoType>({
      ...bookingDetailsTemplate,
      eventTypeInfo: "",
      guestsCount: "",
      roomsCount: "",
      vehiclesCount: "",
    });

    interface bookingStatusMsgType {
      success: string;
      info: string;
      warning: string;
      error: string;
    }
  
    // used to display the current status of the booking slot
    const [bookingStatusMsg, setBookingStatusMsg] = useState<bookingStatusMsgType>({
      success: "",
      info: "",
      warning:
        "By changing the booking date and time, you understand that you will lose your current slot.",
      error: "",
    });
  
    const handleBookingDetailsInfo = (key: string, value: any) => {
      setBookingDetails((previousInfo) => ({
        ...previousInfo,
        [key]: value,
      }));
    };
  
    const handleBookingDetailsErrorInfo = (key: string, value: any) => {
      setBookingDetailsErrorInfo((previousInfo) => ({
        ...previousInfo,
        [key]: value,
      }));
    };
  
    const handleBookingStatusMsg = (key: string, value: any) => {
      setBookingStatusMsg((previousInfo) => ({
        ...previousInfo,
        [key]: value,
      }));
    };
  
    // returns date in yyyy-mm-dd format
    const extractDate = (timeStamp: Date) => {
      if (!timeStamp) {
        return null;
      }
      const date = new Date(timeStamp); // Replace with your Date object
      const year = date.getFullYear(); // Get the year (YYYY)
      const month = date.getMonth() + 1; // Get the month (0-indexed, so add 1)
      const day = date.getDate(); // Get the day of the month (1-31)
  
      // Formatting month and day to ensure two digits (e.g., 03 for March)
      const formattedMonth = month.toString().padStart(2, "0");
      const formattedDay = day.toString().padStart(2, "0");
  
      return `${year}-${formattedMonth}-${formattedDay}`;
    };
  
    // returns time in HH:MM format
    const extractTime = (timeStamp: Date) => {
      if (!timeStamp) {
        return null;
      }
      const date = new Date(timeStamp);
      const hours = date.getHours(); // Get the hour (0-23)
      const minutes = date.getMinutes(); // Get the minute (0-59)
  
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`; // Output: HH:MM
    };
  
    // returns date and time in GMT format
    const getGMTFormattedDateTime = (date: string, time: string): Date | null => {
      if (!date || !time) return null;
  
      const dateObj = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      dateObj.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds
      return dateObj;
    };
  
    useEffect(() => {
      const fetchBookingDetails = async () => {
        try {
          const URL = `/api/routes/${
            currentBooking.bookingStatus === "CONFIRMED"
              ? "hallBookingMaster"
              : "bookingMaster"
          }/getBookingDetailsById/?bookingId=${
            currentBooking._id
          }&userType=${userType}`;
          
          const response = await axios.get(URL);
          console.log(response.data[0]);
          const { bookingStartDateTimestamp, bookingEndDateTimestamp, ...info } =
            response.data[0];
  
          setBookingDetails((previousInfo) => ({
            ...previousInfo,
            ...info,
            bookingStartDate: extractDate(bookingStartDateTimestamp),
            bookingStartTime: extractTime(bookingStartDateTimestamp),
            bookingEndDate: extractDate(bookingEndDateTimestamp),
            bookingEndTime: extractTime(bookingEndDateTimestamp),
          }));
        } catch (error) {
          console.error(error);
          return;
        }
      };
  
      if (currentBooking._id) {
        fetchBookingDetails();
      }
    }, [currentBooking]);
  
    const handleUpdateFormTwo = async () => {
      setIsScreenLoading(true);
  
      if (!bookingDetails._id) {
        // @TODO: handle error condition
        return;
      }
  
      const response = await axios.patch(
        `/api/routes/bookingMaster/updateBookingDetails/${
          bookingDetails._id
        }`,
        {
          eventId: bookingDetails.eventTypeInfo.value,
          catererRequirement: bookingDetails.catererRequirement.value,
          guestsCount: bookingDetails.guestsCount,
          roomsCount: bookingDetails.roomsCount,
          vehiclesCount: bookingDetails.vehiclesCount,
          parkingRequirement: bookingDetails.parkingRequirement.value,
          customerVegRate: bookingDetails.customerVegRate || "",
          customerNonVegRate: bookingDetails.customerNonVegRate || "",
          customerVegItemsList: bookingDetails.customerVegItemsList || "",
          customerNonVegItemsList: bookingDetails.customerNonVegItemsList || "",
        }
      );
  
      if (response.status === 200) {
        setTimeout(() => {
          setIsFormTwoDisabled(true);
          messageApi.open({
            type: "success",
            content: "Booking details updated successfully!",
          });
          setIsScreenLoading(false);
        }, 1000);
      } else {
        // @TODO: Handle error condition here
        setIsScreenLoading(false);
      }
    };
  
    const handleUpdateFormThree = async () => {
      setIsScreenLoading(true);
  
      if (!bookingDetails._id) {
        // @TODO: handle error condition
        console.log(bookingDetails._id);
        return;
      }
      if (
        !bookingDetails.bookingStartDateObject ||
        !bookingDetails.bookingEndDateObject
      ) {
        // @TODO: Handle Error condition here
        setIsFormThreeDisabled(true);
        return;
      }
  
      const response = await axios.patch(
        `/api/routes/bookingMaster/updateBookingDetails/${
          bookingDetails._id
        }`,
        {
          bookingStartDateTimestamp: bookingDetails.bookingStartDateObject,
          bookingEndDateTimestamp: bookingDetails.bookingEndDateObject,
          bookingDuration: bookingDetails.bookingDuration,
        }
      );
  
      if (response.status === 200) {
        setTimeout(() => {
          setIsFormThreeDisabled(true);
          messageApi.open({
            type: "success",
            content: "Booking details updated successfully!",
          });
          setIsScreenLoading(false);
        }, 1000);
      } else {
        // @TODO: Handle error condition here
        setIsScreenLoading(false);
      }
    };
  
    useEffect(() => {
      if (
        (!bookingDetails.hallData._id && !bookingDetails.customerData._id) ||
        bookingStatusMsg.error
      ) {
        return;
      }
  
      const checkBookingSlotAvailability = async () => {
        console.log("ENTERED", bookingDetails);

        if(!bookingDetails.bookingStartDate || !bookingDetails.bookingEndDate || !bookingDetails.bookingStartTime || !bookingDetails.bookingEndTime) {
          return;
        }

        const bookingStartDateObject: Date | null = getGMTFormattedDateTime(
          bookingDetails.bookingStartDate,
          bookingDetails.bookingStartTime
        );
        const bookingEndDateObject: Date | null = getGMTFormattedDateTime(
          bookingDetails.bookingEndDate,
          bookingDetails.bookingEndTime
        );

        if(!bookingStartDateObject || !bookingEndDateObject) {
          return;
        }
  
        console.log(bookingStartDateObject, bookingEndDateObject);
        // Calculate the difference in milliseconds
        const diffInMs = bookingEndDateObject?.getTime() - bookingStartDateObject?.getTime();
        // Convert milliseconds to hours
        const diffInHours = diffInMs / (1000 * 60 * 60);
  
        setBookingDetails((previousInfo) => ({
          ...previousInfo,
          bookingDuration: diffInHours,
          bookingStartDateObject: bookingStartDateObject,
          bookingEndDateObject: bookingEndDateObject,
        }));
  
        try {
          const response = await axios.get(
            `/api/routes/hallBookingMaster/getHallAvailability/?hallId=${
              bookingDetails.hallData._id
            }&startDate=${bookingStartDateObject}&endDate=${bookingEndDateObject}`
          );
          if (response.data.length > 0) {
            handleBookingStatusMsg(
              "error",
              `The chosen booking slot is unavailable. There are already ${response.data.length} confirmed bookings for this slot.`
            );
          } else {
            handleBookingStatusMsg(
              "success",
              "The chosen booking slot is available!"
            );
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      checkBookingSlotAvailability();
    }, [triggerSlotAvailabilityCheck]);
  
    const handleBookingStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBookingStatusMsg(() => ({
        info: "",
        error: "",
        success: "",
        warning: "",
      }));
  
      const bookingStartDate = new Date(event.target.value);
      const bookingEndDate = new Date(bookingDetails.bookingEndDate || event.target.value);
  
      handleBookingDetailsInfo("bookingStartDate", extractDate(bookingStartDate));
  
      if (bookingStartDate > bookingEndDate) {
        handleBookingStatusMsg(
          "error",
          "Invalid Time Frame! Start date cannot be greater than End date."
        );
        return;
      }
  
      setTriggerSlotAvailabilityCheck(!triggerSlotAvailabilityCheck);
    };
  
    const handleBookingStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const bookingStartDate = new Date(bookingDetails.bookingStartDate || "");
      const bookingEndDate = new Date(bookingDetails.bookingEndDate || "");
  
      setBookingStatusMsg(() => ({
        info: "",
        error: "",
        success: "",
        warning: "",
      }));
  
      // Get the hours from the event (start time) and bookingEndTime
      const startHour = Number(event.target.value.split(":")[0]);
      const endHour = Number(bookingDetails.bookingEndTime?.split(":")[0]) || startHour;
  
      // Update the booking start date with the selected hour
      bookingStartDate.setHours(startHour, 0, 0, 0);
      // Update the booking end date with the end hour
      bookingEndDate.setHours(endHour, 0, 0, 0);
  
      handleBookingDetailsInfo("bookingStartTime", startHour + ":00");
  
      if (bookingStartDate >= bookingEndDate) {
        handleBookingStatusMsg(
          "error",
          "Invalid time frame! Start time cannot be greater than End time."
        );
        return;
      }
  
      setTriggerSlotAvailabilityCheck(!triggerSlotAvailabilityCheck);
    };
  
    const handleBookingEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBookingStatusMsg(() => ({
        info: "",
        error: "",
        success: "",
        warning: "",
      }));
  
      const bookingStartDate = new Date(bookingDetails.bookingStartDate || event.target.value);
      const bookingEndDate = new Date(event.target.value);
  
      handleBookingDetailsInfo("bookingEndDate", extractDate(bookingEndDate));
  
      if (bookingEndDate < bookingStartDate) {
        handleBookingStatusMsg(
          "error",
          "Invalid Time Frame! End date cannot be lesser than Start date."
        );
        return;
      }
  
      setTriggerSlotAvailabilityCheck(!triggerSlotAvailabilityCheck);
    };
  
    const handleBookingEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const bookingStartDate = new Date(bookingDetails.bookingStartDate || "");
      const bookingEndDate = new Date(bookingDetails.bookingEndDate || "");
  
      setBookingStatusMsg(() => ({
        info: "",
        error: "",
        success: "",
        warning: "",
      }));
  
      // Get the hours from the event (start time) and bookingEndTime
      const startHour = Number(bookingDetails.bookingStartTime?.split(":")[0]);
      const endHour = Number(event.target.value.split(":")[0]);
  
      // Update the booking start date with the selected hour
      bookingStartDate.setHours(startHour, 0, 0, 0);
      // Update the booking end date with the end hour
      bookingEndDate.setHours(endHour, 0, 0, 0);
  
      handleBookingDetailsInfo("bookingEndTime", endHour + ":00");
  
      if (bookingStartDate >= bookingEndDate) {
        handleBookingStatusMsg(
          "error",
          "Invalid time frame! End time cannot be lesser than Start time."
        );
        return;
      }
  
      setTriggerSlotAvailabilityCheck(!triggerSlotAvailabilityCheck);
    };
  
    const handlePrevBtnClick = () => {
      switch (currentActiveTab) {
        case 0:
          break;
        case 1:
          if (!isFormTwoDisabled) {
            handleUpdateFormTwo();
          }
          handleCurrentActiveTabChange(null, 0);
          break;
        case 2:
          if (!isFormThreeDisabled) {
            handleUpdateFormThree();
          }
          handleCurrentActiveTabChange(null, 1);
          break;
        default:
          break;
      }
    };
  
    const handleNextBtnClick = () => {
      switch (currentActiveTab) {
        case 0:
          handleCurrentActiveTabChange(null, 1);
          break;
        case 1:
          if (!isFormTwoDisabled) {
            handleUpdateFormTwo();
          }
          handleCurrentActiveTabChange(null, 2);
          break;
        case 2:
          break;
        default:
          break;
      }
    };
  
    const handleEditBtnClick = () => {
      switch (currentActiveTab) {
        case 0:
          break;
        case 1:
          setIsFormTwoDisabled(false);
          break;
        case 2:
          setIsFormThreeDisabled(false);
          break;
        default:
          break;
      }
    };
  
    const handleSaveBtnClick = () => {
      switch (currentActiveTab) {
        case 0:
          break;
        case 1:
          handleUpdateFormTwo();
          break;
        case 2:
          handleUpdateFormThree();
          break;
        default:
          break;
      }
    };
  
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: "#2c2c2c",
            color: "#fff",
            minHeight: "90vh",
            borderRadius: "8px",
          },
        }}
        maxWidth="md"
        fullWidth
      >
        {contextHolder}
        {isScreenLoading && <LoadingScreen />}
        <div className={styles.bookingDetailsDialog__mainContainer}>
          <div className={`${styles.wrapper} ${styles.header__wrapper}`}>
            {userType === "CUSTOMER" ? (
              <div className={styles.image}>
                <img src={bookingDetails.hallData.hallImage || ""} alt="" />
              </div>
            ) : (
              <div className={`${styles.image} ${styles.profilePic}`}>
                <img
                  src={bookingDetails.customerData.customerProfileImage || ""}
                  alt=""
                />
              </div>
            )}
            <Card className={styles['booking-card']} bordered={false}>
              <Title level={2} className={styles.name}>
                {userType === "CUSTOMER" ? (
                  <p>
                    {bookingDetails.hallData.hallName}{" "}
                    <span>({bookingDetails.vendorType})</span>
                  </p>
                ) : vendorType === "Banquet Hall" ? (
                  <p>{bookingDetails.customerData.customerName}</p>
                ) : null}
              </Title>
              <div className={styles.description}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text strong style={{ color: "#fff", marginRight: "0.5rem" }}>
                      Booking Id:{" "}
                    </Text>{" "}
                    {bookingDetails.documentId}
                  </Col>
                  <Col span={24}>
                    <Text strong style={{ color: "#fff", marginRight: "0.5rem" }}>
                      Event Type:{" "}
                    </Text>{" "}
                    {bookingDetails.eventTypeInfo.label}
                  </Col>
                  <Col span={24}>
                    <Text strong style={{ color: "#fff", marginRight: "0.5rem" }}>
                      Booking Status:{" "}
                    </Text>
                    {bookingDetails.bookingStatus === "CONFIRMED" ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        CONFIRMED
                      </Tag>
                    ) : bookingDetails.bookingStatus === "PENDING" ? (
                      <Tag icon={<SyncOutlined spin />} color="processing">
                        PENDING
                      </Tag>
                    ) : (
                      <Tag icon={<CloseCircleOutlined />} color="error">
                        CANCELLED
                      </Tag>
                    )}
                  </Col>
                </Row>
              </div>
              <div className={styles.shareIcon}>
                <ShareIcon className={styles.icon} />
              </div>
            </Card>
          </div>
          <div className={`${styles.wrapper} ${styles.body__wrapper}`}>
            <Box
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                backgroundColor: "#2c2c2c",
                color: "#fffff",
              }}
            >
              <Tabs
                value={currentActiveTab}
                onChange={handleCurrentActiveTabChange}
                centered
              >
                <Tab
                  label="Hall Details"
                  sx={{ color: "#fff", fontSize: "14px" }}
                />
                <Tab
                  label="User Requirement"
                  sx={{ color: "#fff", fontSize: "14px" }}
                />
                <Tab
                  label="Date & Time"
                  sx={{ color: "#fff", fontSize: "14px" }}
                />
              </Tabs>
            </Box>
            <div className={styles.form__wrapper}>
              {currentActiveTab === 0 &&
                (userType === "CUSTOMER" ? (
                  <div
                    className={`container hallDetails__container disabledInput__wrapper`}
                  >
                    <div className={styles.inputField__wrapper}>
                      <div className={styles.title}>hall name</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <BusinessIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="text"
                          value={bookingDetails.hallData?.hallName || ""}
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
                            value={bookingDetails.hallData?.hallLocation || ""}
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
                            value={bookingDetails.hallData?.hallLandmark || ""}
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
                            value={bookingDetails.hallData?.hallCapacity || 0}
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
                            value={bookingDetails.hallData?.hallRooms || 0}
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
                            value={bookingDetails.hallData?.hallVegRate || 0}
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
                            value={bookingDetails.hallData?.hallNonVegRate || 0}
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
                          value={bookingDetails.hallData?.hallParking || ""}
                          className={styles.input}
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`container hallDetails__container disabledInput__wrapper`}
                  >
                    <div className={styles.inputField__wrapper}>
                      <div className={styles.title}>customer name</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <BusinessIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="text"
                          value={bookingDetails.customerData?.customerName || ""}
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
                            value={bookingDetails.customerData?.customerAddress || ""}
                            className={styles.input}
                            // disabled
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
                            value={bookingDetails.customerData?.customerLandmark || ""}
                            className={styles.input}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.inputFields__wrapper}>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>mobile no.</div>
                        <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                          <EventSeatIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="text"
                            value={bookingDetails.customerData?.customerContact || ""}
                            className={styles.input}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>email</div>
                        <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                          <BedIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="text"
                            value={bookingDetails.customerData?.customerEmail || ""}
                            className={styles.input}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.inputFields__wrapper}>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>alt mobile no.</div>
                        <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                          <RestaurantIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="text"
                            value={
                              bookingDetails.customerData
                                ?.customerAlternateMobileNo || ""
                            }
                            className={styles.input}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                      <div className={styles.wrapper}>
                        <div className={styles.title}>Alt Email </div>
                        <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                          <RestaurantIcon className={styles.icon} />
                          <div className={styles.divider}></div>
                          <input
                            type="text"
                            value={
                              bookingDetails.customerData?.customerAlternateEmail || ""
                            }
                            className={styles.input}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    {/* <div className="inputField__wrapper half-width">
                      <div className={styles.title}>Parking Availability</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <LocalParkingIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="text"
                          value={bookingDetails.hallData?.hallParking}
                          className={styles.input}
                          disabled
                          readOnly
                        />
                      </div>
                    </div> */}
                  </div>
                ))}
              {currentActiveTab === 1 && (
                <div
                  className={`container preferences__container ${
                    isFormTwoDisabled && "disabledInput__wrapper"
                  }`}
                >
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
                              ? dataStore.eventTypes.data.map((item : { _id: string, eventName: string }) => ({
                                  value: item._id,
                                  label: item.eventName,
                                }))
                              : null
                          }
                          value={bookingDetails.eventTypeInfo}
                          onChange={(selectedOption: SingleValue<ReactSelectOptionType>) => {
                            const updatedInfo = {
                              label: selectedOption?.label || "",
                              value: selectedOption?.value || "",
                            };
                            handleBookingDetailsInfo(
                              "eventTypeInfo",
                              updatedInfo
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
                          isDisabled={isFormTwoDisabled}
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
                          styles={customStyles}
                          options={ReactSelectBooleanOptions}
                          value={bookingDetails.catererRequirement}
                          onChange={(selectedOption: SingleValue<ReactSelectBooleanOptionType>) => {
                            const updatedInfo = {
                              label: selectedOption?.label || "No",
                              value: selectedOption?.value || false,
                            };
                            handleBookingDetailsInfo(
                              "catererRequirement",
                              updatedInfo
                            );
                          }}
                          placeholder="Do you need a caterer ?"
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
                          isDisabled={isFormTwoDisabled}
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
                          readOnly={isFormTwoDisabled}
                          disabled={isFormTwoDisabled}
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
                          readOnly={isFormTwoDisabled}
                          disabled={isFormTwoDisabled}
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
                          styles={customStyles}
                          options={ReactSelectBooleanOptions}
                          value={bookingDetails.parkingRequirement}
                          onChange={(selectedOption: SingleValue<ReactSelectBooleanOptionType>) => {
                            const updatedInfo = {
                              label: selectedOption?.label || "No",
                              value: selectedOption?.value || false,
                            };
                            handleBookingDetailsInfo(
                              "parkingRequirement",
                              updatedInfo
                            );
                          }}
                          placeholder="Do your require parking ?"
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
                          isDisabled={isFormTwoDisabled}
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
                          readOnly={isFormTwoDisabled}
                          disabled={isFormTwoDisabled}
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
                              value={bookingDetails.customerVegRate || 0}
                              className={styles.input}
                              placeholder="enter your expected rate/plate"
                              onChange={(event) =>
                                handleBookingDetailsInfo(
                                  "customerVegRate",
                                  event.target.value
                                )
                              }
                              readOnly={isFormTwoDisabled}
                              disabled={isFormTwoDisabled}
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
                              value={bookingDetails.customerNonVegRate || 0}
                              className={styles.input}
                              placeholder="enter your expected rate/plate"
                              onChange={(event) =>
                                handleBookingDetailsInfo(
                                  "customerNonVegRate",
                                  event.target.value
                                )
                              }
                              readOnly={isFormTwoDisabled}
                              disabled={isFormTwoDisabled}
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
                              value={bookingDetails.customerVegItemsList || ""}
                              placeholder="enter items desired in veg menu"
                              className={`${styles.input} ${styles.textArea}`}
                              onChange={(event) =>
                                handleBookingDetailsInfo(
                                  "customerVegItemsList",
                                  event.target.value
                                )
                              }
                              readOnly={isFormTwoDisabled}
                              disabled={isFormTwoDisabled}
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
                              value={bookingDetails.customerNonVegItemsList || ""}
                              placeholder="enter items desired in veg menu"
                              className={`${styles.input} ${styles.textArea}`}
                              onChange={(event) =>
                                handleBookingDetailsInfo(
                                  "customerNonVegItemsList",
                                  event.target.value
                                )
                              }
                              readOnly={isFormTwoDisabled}
                              disabled={isFormTwoDisabled}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {currentActiveTab === 2 && (
                <div
                  className={`container dateTime__container ${
                    isFormThreeDisabled
                      ? "disabledInput__wrapper"
                      : "container-column-center"
                  }`}
                  style={isFormThreeDisabled ? { width: "50%" } : {}}
                >
                  {!isFormThreeDisabled && (
                    <div className={styles.dateTimePicker}>
                      <RangePicker showTime />
                      <SearchIcon className={styles.icon} />
                    </div>
                  )}
                  <div
                    className={`${
                      !isFormThreeDisabled && "inputFields__wrapper"
                    }`}
                  >
                    <div
                      className={`${
                        isFormThreeDisabled ? "inputField__wrapper" : "wrapper"
                      }`}
                    >
                      <div className={styles.title}>Booking Start Date</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <CalendarMonthIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="date"
                          name="bookingDate"
                          value={bookingDetails?.bookingStartDate || ""}
                          className={styles.input}
                          onChange={handleBookingStartDateChange}
                          readOnly={isFormThreeDisabled}
                          disabled={isFormThreeDisabled}
                        />
                      </div>
                    </div>
                    <div
                      className={`${
                        isFormThreeDisabled ? "inputField__wrapper" : "wrapper"
                      }`}
                    >
                      <div className={styles.title}>Start Time</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <AccessAlarmIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="time"
                          name="startTime"
                          value={bookingDetails?.bookingStartTime || ""}
                          onChange={handleBookingStartTimeChange}
                          className={styles.input}
                          readOnly={isFormThreeDisabled}
                          disabled={isFormThreeDisabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${
                      !isFormThreeDisabled && "inputFields__wrapper"
                    }`}
                  >
                    <div
                      className={`${
                        isFormThreeDisabled ? "inputField__wrapper" : "wrapper"
                      }`}
                    >
                      <div className={styles.title}>Booking End Date</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <CalendarMonthIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="date"
                          name="bookingDate"
                          value={bookingDetails?.bookingEndDate || ""}
                          onChange={handleBookingEndDateChange}
                          className={styles.input}
                          readOnly={isFormThreeDisabled}
                          disabled={isFormThreeDisabled}
                        />
                      </div>
                    </div>
                    <div
                      className={`${
                        isFormThreeDisabled ? "inputField__wrapper" : "wrapper"
                      }`}
                    >
                      <div className={styles.title}>End Time</div>
                      <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                        <AccessAlarmIcon className={styles.icon} />
                        <div className={styles.divider}></div>
                        <input
                          type="time"
                          name="endTime"
                          value={bookingDetails?.bookingEndTime || ""}
                          onChange={handleBookingEndTimeChange}
                          className={styles.input}
                          readOnly={isFormThreeDisabled}
                          disabled={isFormThreeDisabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles.inputField__wrapper}
                    style={!isFormThreeDisabled ? { width: "47%" } : {}}
                  >
                    <div className={styles.title}>Total Duration</div>
                    <div className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}>
                      <GiSandsOfTime className={styles.icon} />
                      <div className={styles.divider}></div>
                      <input
                        name="bookingDuration"
                        type="text"
                        value={`${bookingDetails?.bookingDuration} hour`}
                        className={styles.input}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                  {!isFormThreeDisabled && (
                    <div className={styles.bookingStatusMsg}>
                      {bookingStatusMsg.success ? (
                        <Alert severity="success" className={styles.alert}>
                          {bookingStatusMsg.success}
                        </Alert>
                      ) : bookingStatusMsg.warning ? (
                        <Alert severity="warning" className={styles.alert}>
                          {bookingStatusMsg.warning}
                        </Alert>
                      ) : bookingStatusMsg.error ? (
                        <Alert severity="error" className={styles.alert}>
                          {bookingStatusMsg.error}
                        </Alert>
                      ) : bookingStatusMsg.info ? (
                        <Alert severity="info" className={styles.alert}>
                          {bookingStatusMsg.info}
                        </Alert>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
              <div className={styles.lineSeparator}></div>
              <div className={styles.footer__wrapper}>
                <div className={styles.btns__wrapper}>
                  <div className={styles.caption}>* Mandatory Fields</div>
                  {bookingDetails.bookingStatus === "PENDING" &&
                    currentActiveTab !== 0 &&
                    (isFormTwoDisabled && isFormThreeDisabled ? (
                      <button
                        className={`${styles.btn} ${styles.editBtn}`}
                        onClick={handleEditBtnClick}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className={`${styles.btn} ${styles.saveBtn}`}
                        onClick={handleSaveBtnClick}
                      >
                        Save
                      </button>
                    ))}
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
        </div>
      </Dialog>
    );
}

export default BookingDetailsDialogComponent