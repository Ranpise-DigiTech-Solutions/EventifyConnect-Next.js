/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
// import { useHistory } from 'react-router-dom';
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import {
  Flex,
  Switch,
  Table,
  Tag,
  Transfer,
  GetProp,
  TableColumnsType,
  TableProps,
  TransferProps,
} from "antd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
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
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ErrorIcon from "@mui/icons-material/Error";
import { FaLandmark, FaCar, FaEdit } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { LoadingScreen } from "@/components/sub-components";
import styles from "./booking-details-dialog.module.scss";
import { RootState } from "@/redux/store";
import { photographerBookingDetails } from "@/app/api/schemas/booking-master";
import { FilteredSearchComponent } from "@/components/global";
import { FilteredSearchComponentFiltersType } from "@/lib/types";
import Image from "next/image";

type Props = {
  open: boolean;
  handleClose: () => void;
  hallData: any;
  serviceProviderData: any;
};

// *** START OF OTHER-VENDOR-TRANSFER-LIST RELATED VARIABLES ***

interface OtherVendorsTransferListDataType {
  key: string;
  title: string;
  description: string;
  tag: string;
}

interface OtherVendorsTableTransferProps extends TransferProps<TransferItem> {
  dataSource: OtherVendorsTransferListDataType[];
  leftColumns: TableColumnsType<OtherVendorsTransferListDataType>;
  rightColumns: TableColumnsType<OtherVendorsTransferListDataType>;
}

type TransferItem = GetProp<TransferProps, "dataSource">[number];
type TableRowSelection<T extends object> = TableProps<T>["rowSelection"];

// Customize Table Transfer
const TableTransfer: React.FC<OtherVendorsTableTransferProps> = (props) => {
  const { leftColumns, rightColumns, ...restProps } = props;
  return (
    <Transfer
      style={{ minWidth: "100%", flex: 1 }}
      {...restProps}
      titles={["List of Vendors", "Your Selection"]}
    >
      {({
        direction,
        filteredItems,
        onItemSelect,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;
        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: () => ({ disabled: listDisabled }),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, "replace");
          },
          selectedRowKeys: listSelectedKeys,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        };

        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="large"
            style={{
              width: "100%",
              pointerEvents: listDisabled ? "none" : undefined,
            }}
            onRow={({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) {
                  return;
                }
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
          />
        );
      }}
    </Transfer>
  );
};

// *** END OF OTHER-VENDOR-TRANSFER-LIST RELATED VARIABLES ***

// type of react select options
interface ReactSelectOptionType {
  label: string;
  value: string;
}

interface ReactSelectBooleanOptionType {
  value: boolean;
  label: string;
}

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
  otherVendorRequirement: {
    label: string;
    value: boolean;
  } | null;
  customerSuggestion: string;
  requiredOtherVendors: string[];
  inHouseVendors: string[];
  outsidePartyVendors: {
    [key: string]: photographerBookingDetails;
  };
}

interface bookingDetailsErrorInfoType
  extends Omit<
    bookingDetailsType,
    | "eventTypeInfo"
    | "guestsCount"
    | "roomsCount"
    | "vehiclesCount"
    | "outsidePartyVendors"
  > {
  eventTypeInfo: string;
  guestsCount: string;
  roomsCount: string;
  vehiclesCount: string;
  outsidePartyVendors: string;
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
  otherVendorRequirement: {
    label: "Yes",
    value: true,
  },
  customerSuggestion: "",
  requiredOtherVendors: [],
  inHouseVendors: [],
  outsidePartyVendors: {},
};

const BookingDetailsDialogComponent = ({
  open,
  handleClose,
  hallData,
  serviceProviderData,
}: Props) => {
  //const { executeRecaptcha } = useGoogleReCaptcha();
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
  const [alertDialog, setAlertDialog] = useState(false); // to show error messages
  const [openFilteredSearchComponent, setOpenFilteredSearchComponent] =
    useState<boolean>(false); // to trigger the filtered search component

  const [filteredSearchComponentFilters, setFilteredSearchComponentFilters] =
    useState<FilteredSearchComponentFiltersType>({
      cityName: "",
      date: "",
      eventType: {
        label: "",
        value: "",
      },
      vendorType: {
        label: "",
        value: "",
      },
    });

  // *** START OF VENDOR-TRANSFER-LIST RELATED VARIABLES ***

  const otherVendorTransferListMockData = Array.isArray(
    dataStore.vendorTypes.data
  )
    ? dataStore.vendorTypes.data
        ?.filter(
          (item: { vendorType: string }) => item.vendorType !== "Banquet Hall"
        )
        .map(
          (item: {
            _id: string;
            vendorType: string;
            vendorTypeDesc: string;
            vendorTag: string;
          }) => ({
            key: item._id,
            title: item.vendorType,
            description: item.vendorTypeDesc,
            tag: item.vendorTag,
          })
        )
    : [];

  const otherVendorTransferListColumns: TableColumnsType<OtherVendorsTransferListDataType> =
    [
      {
        dataIndex: "title",
        title: "Name",
      },
      {
        dataIndex: "tag",
        title: "Tag",
        render: (tag: string) => (
          <Tag style={{ marginInlineEnd: 0 }} color="cyan">
            {tag?.toUpperCase()}
          </Tag>
        ),
      },
      {
        dataIndex: "description",
        title: "Description",
      },
    ];

  const otherVendorTransferListFilterOption = (
    input: string,
    item: OtherVendorsTransferListDataType
  ) => item.title?.includes(input) || item.tag?.includes(input);

  const [
    otherVendorTransferListTargetKeys,
    setOtherVendorTransferListTargetKeys,
  ] = useState<string[]>([]);
  const [
    otherVendorTransferListFieldDisabled,
    setOtherVendorTransferListFieldDisabled,
  ] = useState(false);

  const otherVendorTransferListOnChange: OtherVendorsTableTransferProps["onChange"] =
    (nextTargetKeys) => {
      setOtherVendorTransferListTargetKeys(nextTargetKeys as string[]);
    };

  const otherVendorTransferListToggleDisabled = (checked: boolean) => {
    setOtherVendorTransferListFieldDisabled(checked);
  };

  // *** END OF VENDOR-TRANSFER-LIST RELATED VARIABLES ***

  // console.log(otherVendorTransferListTargetKeys ? typeof otherVendorTransferListTargetKeys[0] : null);

  // object storing user's booking requirements
  const [bookingDetails, setBookingDetails] = useState<bookingDetailsType>({
    ...bookingDetailsTemplate,
  });

  const [bookingDetailsErrorInfo, setBookingDetailsErrorInfo] =
    useState<bookingDetailsErrorInfoType>({
      ...bookingDetailsTemplate,
      eventTypeInfo: "",
      guestsCount: "",
      roomsCount: "",
      vehiclesCount: "",
      outsidePartyVendors: "",
    });

  // every time the transfer list is updated.. check whether new item already exists in the current in-house list.. if not push it
  useEffect(() => {
    if (otherVendorTransferListTargetKeys.length === 0) return;

    const set1 = new Set(otherVendorTransferListTargetKeys);
    const set2 = new Set(bookingDetails.requiredOtherVendors);

    // Find elements that are in otherVendorTransferListTargetKeys but not in bookingDetails.requiredOtherVendors
    const itemsAdded = otherVendorTransferListTargetKeys.filter(
      (item) => !set2.has(item)
    );

    // Find elements that are in bookingDetails.requiredOtherVendors but not in otherVendorTransferListTargetKeys
    const itemsRemoved = bookingDetails.requiredOtherVendors.filter(
      (item) => !set1.has(item)
    );

    console.log(itemsRemoved);
    console.log(itemsAdded);

    // Make a copy of bookingDetails
    const updatedBookingDetails = { ...bookingDetails };

    updatedBookingDetails.requiredOtherVendors = [
      ...otherVendorTransferListTargetKeys,
    ];

    // Remove items from outsidePartyVendors or inHouseVendors if they are in itemsRemoved
    itemsRemoved.forEach((item) => {
      if (item in updatedBookingDetails.outsidePartyVendors) {
        const { [item]: _, ...remainingVendors } =
          updatedBookingDetails.outsidePartyVendors;
        updatedBookingDetails.outsidePartyVendors = remainingVendors;
      } else if (updatedBookingDetails.inHouseVendors.includes(item)) {
        updatedBookingDetails.inHouseVendors =
          updatedBookingDetails.inHouseVendors.filter(
            (vendorTypeId: string) => vendorTypeId !== item
          );
      }
    });

    // Ensure no duplicates when adding itemsAdded to inHouseVendors
    updatedBookingDetails.inHouseVendors = Array.from(
      new Set([...updatedBookingDetails.inHouseVendors, ...itemsAdded])
    );

    // Update state
    setBookingDetails(updatedBookingDetails);
  }, [otherVendorTransferListTargetKeys]);

  console.log(otherVendorTransferListTargetKeys);
  console.log(bookingDetails);

  // execute this function when a vendor is moved back and forth btw in-house and outside-party
  const handleOtherVendorsModeChange = (
    modeType: string,
    key: string,
    value?: photographerBookingDetails | any
  ) => {
    setBookingDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };

      if (modeType === "in-house") {
        // Remove from outsidePartyVendors if it exists
        if (key in updatedDetails.outsidePartyVendors) {
          const { [key]: _, ...remainingVendors } =
            updatedDetails.outsidePartyVendors;
          updatedDetails.outsidePartyVendors = remainingVendors;
        }

        // Add to inHouseVendors if not already present
        if (!updatedDetails.inHouseVendors.includes(key)) {
          updatedDetails.inHouseVendors = [
            ...updatedDetails.inHouseVendors,
            key,
          ];
        }
      } else {
        // Remove from inHouseVendors
        updatedDetails.inHouseVendors = updatedDetails.inHouseVendors.filter(
          (vendorTypeId: string) => vendorTypeId !== key
        );

        // Add or update outsidePartyVendors
        updatedDetails.outsidePartyVendors = {
          ...updatedDetails.outsidePartyVendors,
          [key]: value,
        };
      }
      return updatedDetails;
    });
  };

  const setVendorData = (vendorData: photographerBookingDetails | any) => {
    if (filteredSearchComponentFilters.vendorType?.value) {
      handleBookingDetailsInfo("outsidePartyVendors", {
        ...bookingDetails.outsidePartyVendors,
        [filteredSearchComponentFilters.vendorType?.value]: vendorData,
      });
    }
  };

  const handleFilteredSearchComponentOpen = (vendorTypeData: {
    vendorType: string;
    _id: string;
  }) => {
    if (
      Object.keys(bookingDetails.outsidePartyVendors[vendorTypeData._id])
        .length > 0
    )
      return;

    setFilteredSearchComponentFilters({
      ...filteredSearchComponentFilters,
      vendorType: {
        label: vendorTypeData.vendorType,
        value: vendorTypeData._id,
      },
    });
  };

  useEffect(() => {
    if (filteredSearchComponentFilters.vendorType?.label) {
      setOpenFilteredSearchComponent(true);
    }
  }, [filteredSearchComponentFilters]);

  const handleFilteredSearchComponentClose = () => {
    setOpenFilteredSearchComponent(false);
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
      switch (formType) {
        case "FORM_TWO":
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
          return;
        case "FORM_THREE":
          if (bookingDetailsErrorInfo.outsidePartyVendors === "")
            setFormType("FORM_FOUR");
          return;
        default:
          return;
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
    } else if (bookingDetails.guestsCount < 0) {
      handleBookingDetailsErrorInfo(
        "guestsCount",
        "Guest count cannot be less than 0"
      );
    } else {
      handleBookingDetailsErrorInfo("guestsCount", "");
    }
    if (!bookingDetails.roomsCount) {
      handleBookingDetailsErrorInfo("roomsCount", "Rooms count is required");
    } else if (bookingDetails.roomsCount < 0) {
      handleBookingDetailsErrorInfo(
        "roomsCount",
        "Rooms count cannot be less than 0"
      );
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

  const validateFormThree = () => {
    const hasEmptyVendor = Object.values(bookingDetails.outsidePartyVendors).some(
      (item) => Object.keys(item).length === 0
    );
    
    if (hasEmptyVendor) {
      handleBookingDetailsErrorInfo(
        `outsidePartyVendors`,
        "Vendor selection cannot be empty!"
      );
    } else {
      handleBookingDetailsErrorInfo(`outsidePartyVendors`, "");
    }

    setFormErrorUpdateFlag((prevFlag) =>!prevFlag);
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
        setFormProgress(20);
        setFormType("FORM_TWO");
        break;
      case "FORM_FOUR":
        setFormProgress(40);
        setFormType("FORM_THREE");
        break;
      case "FORM_FIVE":
        setFormProgress(60);
        setFormType("FORM_FOUR");
        break;
      default:
        break;
    }
  };

  const handleNextBtnClick = () => {
    switch (formType) {
      case "FORM_ONE":
        setFormProgress(20);
        setFormType("FORM_TWO");
        break;
      case "FORM_TWO":
        setFormProgress(40);
        validateFormTwo();
        break;
      case "FORM_THREE":
        setFormProgress(60);
        validateFormThree();
        // console.log(bookingDetails)
        break;
      case "FORM_FOUR":
        setFormProgress(80);
        setFormType("FORM_FIVE");
        break;
      case "FORM_FIVE":
        handleSubmissionConfirmationDialogOpen();
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async () => {
    // if (!executeRecaptcha) {
    //   return;
    // }

    setIsLoading(true);
    try {
      // const captchaToken = await executeRecaptcha("inquirySubmit");
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

      const postData = {
        hallId: hallData._id,
        hallCity: hallData.hallCity,
        hallUserId: hallData.hallUserId,
        vendorTypeId: serviceProviderData.vendorTypeId,
        eventId: bookingDetails.eventTypeInfo.eventTypeId,
        customerId: userInfoStore.userDetails?.Document?._id,
        bookingType: "HALL",
        otherVendorRequirement: bookingDetails.otherVendorRequirement?.value,
        bookingStartDateTimestamp: parsedStartDateObject,
        bookingEndDateTimestamp: parsedEndDateObject,
        bookingDuration: parseInt(
          bookingInfoStore.bookingDuration.split(":")[0]
        ),
        bookingStatusRemark: "",

        guestsCount: bookingDetails.guestsCount,
        roomsCount: bookingDetails.roomsCount,
        parkingRequirement: bookingDetails.parkingRequirement
          ? bookingDetails.parkingRequirement.value
          : false,
        vehiclesCount: bookingDetails.vehiclesCount,
        requiredOtherVendors: bookingDetails.requiredOtherVendors,
        outsidePartyVendors: bookingDetails.outsidePartyVendors,
        inHouseVendors: bookingDetails.inHouseVendors,
        customerInfo: "",
        customerSuggestion: bookingDetails.customerSuggestion,
      };

      const response = await axios.post(
        `/api/routes/bookingMaster/`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            //"X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );

      setIsLoading(false);
      handleBookingDetailsInfo("bookingId", response.data?.documentId);
    } catch (error) {
      setIsLoading(false);
      setAlertDialog(true);
    }

    setIsLoading(false);
    setBookingConfirmationScreen(true);
    setFormType("FORM_ONE");
  };

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          setFormType("FORM_ONE");
          handleClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      {isLoading && (
        <div>
          <LoadingScreen />
        </div>
      )}
      {filteredSearchComponentFilters && (
        <FilteredSearchComponent
          key={JSON.stringify(filteredSearchComponentFilters)}
          open={openFilteredSearchComponent}
          handleClose={handleFilteredSearchComponentClose}
          setVendorData={setVendorData}
          defaultFilters={filteredSearchComponentFilters}
        />
      )}
      <Dialog
        open={alertDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Unexpected Error Occurred"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            An unexpected error occurred while processing your request. Please
            try again later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAlertDialog(false);
              handleClose();
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
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
                  <div className={styles["sub-wrapper"]}>
                    <div className={styles.key}>Booking Id:</div>
                    <div className={styles.value}>
                      {bookingDetails.bookingId}
                    </div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles["sub-wrapper"]}>
                    <div className={styles.key}>Start Date:</div>
                    <div className={styles.value}>
                      {bookingInfoStore.bookingStartDate}
                    </div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles["sub-wrapper"]}>
                    <div className={styles.key}>End Date:</div>
                    <div className={styles.value}>
                      {bookingInfoStore.bookingEndDate}
                    </div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles["sub-wrapper"]}>
                    <div className={styles.key}>Total:</div>
                    <div className={styles.value}>$0</div>
                  </div>
                  <div className={styles.verticalLineSeparator}></div>
                  <div className={styles["sub-wrapper"]}>
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
          <div onClick={handleClose}>
            <CloseIcon className={styles.closeIcon} />
          </div>
          <div className={styles.headings__wrapper}>
            <h1 className={styles.heading}>booking form</h1>
            <h6 className={styles["sub-heading"]}>
              Fill in the below details to continue
            </h6>
          </div>
          <div className={styles.navigationTabs__wrapper}>
            <div
              className={`${styles.navigationTab} ${
                formType !== "FORM_ONE"
                  ? styles.form__completed
                  : styles.current__form
              }`}
            >
              <div className={styles.tabHeading}>hall details</div>
              <div className={styles.wrapper}>
                <div className={styles["sub-wrapper"]}>
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
                (formType === "FORM_TWO"
                  ? styles.current__form
                  : styles.form__completed)
              }`}
            >
              <div className={styles.tabHeading}>preferences</div>
              <div className={styles.wrapper}>
                <div className={styles["sub-wrapper"]}>
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
                formType !== "FORM_ONE" &&
                formType !== "FORM_TWO" &&
                (formType === "FORM_THREE"
                  ? styles.current__form
                  : styles.form__completed)
              }`}
            >
              <div className={styles.tabHeading}>other vendors</div>
              <div className={styles.wrapper}>
                <div className={styles["sub-wrapper"]}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 3</p>
                </div>
                <div className={styles.btn}>
                  {formType === "FORM_FOUR" || formType === "FORM_FIVE"
                    ? "Completed"
                    : "Pending"}
                </div>
              </div>
            </div>
            <div
              className={`${styles.navigationTab} ${
                formType === "FORM_FOUR"
                  ? styles.current__form
                  : formType === "FORM_FIVE" && styles.form__completed
              }`}
            >
              <div className={styles.tabHeading}>user details</div>
              <div className={styles.wrapper}>
                <div className={styles["sub-wrapper"]}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 4</p>
                </div>
                <div className={styles.btn}>
                  {formType === "FORM_FIVE" ? "Completed" : "Pending"}
                </div>
              </div>
            </div>
            <div
              className={`${styles.navigationTab} ${
                formType === "FORM_FIVE" && styles.current__form
              }`}
            >
              <div className={styles.tabHeading}>date & time</div>
              <div className={styles.wrapper}>
                <div className={styles["sub-wrapper"]}>
                  <PersonIcon className={styles.icon} />
                  <p className={styles.stepCount}>step 5</p>
                </div>
                <div className={styles.btn}>pending</div>
              </div>
            </div>
          </div>
          <div className={styles.form__wrapper}>
            {formType === "FORM_ONE" && (
              <div
                className={`${styles.container} ${styles.hallDetails__container}`}
              >
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>hall name</div>
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                <div
                  className={`${styles.inputField__wrapper} ${styles["half-width"]}`}
                >
                  <div className={styles.title}>Parking Availability</div>
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
              <div
                className={`${styles.container} ${styles.preferences__container}`}
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
                      Other Vendor Requirement <span>*</span>
                    </div>
                    <div className={styles.input__wrapper}>
                      <CurrencyRupeeIcon className={styles.icon} />
                      <div className={styles.divider}></div>
                      <Select
                        options={[
                          {
                            value: true,
                            label: "Yes",
                          },
                          {
                            value: false,
                            label: "No",
                          },
                        ]}
                        value={
                          bookingDetails.otherVendorRequirement
                            ? {
                                label:
                                  bookingDetails.otherVendorRequirement.label,
                                value:
                                  bookingDetails.otherVendorRequirement.value,
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
                            "otherVendorRequirement",
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
                          bookingDetails.parkingRequirement
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
                {bookingDetails.otherVendorRequirement?.value && (
                  <div className={styles.inputField__wrapper}>
                    <div className={styles.title}>
                      Other Vendors Preferences <span>*</span>
                    </div>
                    <div className="transferInput__wrapper">
                      <Flex
                        align="center"
                        gap="middle"
                        vertical
                        style={{ width: "100%", minWidth: "69vw" }}
                      >
                        <TableTransfer
                          dataSource={otherVendorTransferListMockData}
                          targetKeys={otherVendorTransferListTargetKeys}
                          disabled={otherVendorTransferListFieldDisabled}
                          showSearch
                          showSelectAll={true}
                          onChange={otherVendorTransferListOnChange}
                          filterOption={otherVendorTransferListFilterOption}
                          leftColumns={otherVendorTransferListColumns}
                          rightColumns={otherVendorTransferListColumns}
                        />
                      </Flex>
                    </div>
                  </div>
                )}
              </div>
            )}
            {formType === "FORM_THREE" && (
              <div
                className={`${styles.container} ${styles.otherVendors__container}`}
              >
                {bookingDetails && (
                  <>
                    {Object.keys(bookingDetails.outsidePartyVendors).length !==
                      0 && (
                      <div className={styles.outsidePartyList__wrapper}>
                        <h2 className={styles.heading}>Outside Party</h2>
                        {Object.entries(bookingDetails.outsidePartyVendors).map(
                          ([key, value]) => {
                            const currentItem =
                              dataStore.vendorTypes?.data?.filter(
                                (item: { _id: string }) => item._id === key
                              );
                            return (
                              <div key={key} className={styles.list__wrapper}>
                                <div className={styles.header__wrapper}>
                                  <div className={styles.title}>
                                    {currentItem[0]?.vendorType}
                                  </div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <MoreVertOutlinedIcon
                                        className={styles.menuIcon}
                                      />
                                    </PopoverTrigger>
                                    <PopoverContent
                                      onClick={() =>
                                        handleOtherVendorsModeChange(
                                          "in-house",
                                          currentItem[0]?._id
                                        )
                                      }
                                      style={{
                                        zIndex: 1500,
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 4,
                                        width: "fit-content",
                                        color: "red",
                                        fontSize: "15px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <div className={styles.popoverContent}>
                                        <MoveUpIcon />
                                        <span>Move to In-House</span>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                {Object.keys(value).length === 0 ? (
                                  <div
                                    className={styles.selectionBox__wrapper}
                                    onClick={() =>
                                      handleFilteredSearchComponentOpen(
                                        currentItem[0]
                                      )
                                    }
                                  >
                                    <div className={styles.wrapper}>
                                      <PersonAddIcon className={styles.icon} />
                                      <p className={styles.description}>
                                        Click anywhere within the box to select
                                        from a wide range of vendors.
                                      </p>
                                    </div>
                                    <p className={styles.separator__text}>OR</p>
                                    <div className={styles.wrapper}>
                                      <button className={styles.addBtn}>
                                        Add a vendor
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={styles.data__wrapper}>
                                    <div className={styles.img__wrapper}>
                                      <img
                                        src={value.vendorImage}
                                        alt="Vendor Image"
                                        // fill
                                        className={styles.img}
                                      />
                                    </div>
                                    <div className={styles.contents__wrapper}>
                                      <h2 className={styles.title__wrapper}>
                                        <p className={styles.key}>Company :</p>
                                        <p className={styles.value}>
                                          {value.companyName}
                                        </p>
                                      </h2>
                                      <div
                                        className={styles.formFields__wrapper}
                                      >
                                        <div className={styles.wrapper}>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Expected Head Count :
                                            </p>
                                            <p className={styles.value}>
                                              {value.expectedHeadCount}
                                            </p>
                                          </div>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Photo Delivery Format :
                                            </p>
                                            <p className={styles.value}>
                                              {value.photoDeliveryFormat}
                                            </p>
                                          </div>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Photography Style :
                                            </p>
                                            <p className={styles.value}>
                                              {value.photographyStyle}
                                            </p>
                                          </div>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Number of Photographers :
                                            </p>
                                            <p className={styles.value}>
                                              {value.numberOfPhotographers}
                                            </p>
                                          </div>
                                        </div>
                                        <div className={styles.wrapper}>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Special Requests :
                                            </p>
                                            <p className={styles.value}>
                                              {value.specialRequests}
                                            </p>
                                          </div>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Duration of Coverage :
                                            </p>
                                            <p className={styles.value}>
                                              {value.durationOfCoverage}
                                            </p>
                                          </div>
                                          <div className={styles.formField}>
                                            <p className={styles.key}>
                                              Additional Services :
                                            </p>
                                            <p className={styles.value}>
                                              {value.additionalServices}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={styles.cancelIcon}
                                      onClick={() =>
                                        handleBookingDetailsInfo(
                                          "outsidePartyVendors",
                                          {
                                            ...bookingDetails.outsidePartyVendors,
                                            [key]: {},
                                          }
                                        )
                                      }
                                    >
                                      <CloseIcon className={styles.icon} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                    {bookingDetailsErrorInfo.outsidePartyVendors && (
                      <div className={styles.inputError}>
                        <ErrorIcon className={styles.icon} />
                        <p>{bookingDetailsErrorInfo.outsidePartyVendors}</p>
                      </div>
                    )}
                    {bookingDetails.inHouseVendors[0] && (
                      <div className={styles.inHouseList__wrapper}>
                        <h2 className={styles.heading}>In House</h2>
                        <div className={styles.body__wrapper}>
                          {bookingDetails.inHouseVendors.map((key, index) => {
                            const currentItem =
                              dataStore.vendorTypes?.data?.filter(
                                (item: { _id: string }) => item._id === key
                              );
                            return (
                              <div key={index} className={styles.wrapper}>
                                <p>{currentItem[0]?.vendorType}</p>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <MoreVertOutlinedIcon
                                      className={styles.icon}
                                    />
                                  </PopoverTrigger>
                                  <PopoverContent
                                    onClick={() =>
                                      handleOtherVendorsModeChange(
                                        "outside-party",
                                        currentItem[0]?._id,
                                        {}
                                      )
                                    }
                                    style={{
                                      zIndex: 1500,
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 4,
                                      width: "fit-content",
                                      color: "red",
                                      fontSize: "15px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <div className={styles.popoverContent}>
                                      <MoveUpIcon />
                                      <span>Move to Outside-Party</span>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {formType == "FORM_FOUR" && (
              <div
                className={`${styles.container} ${styles.userDetails__container}`}
              >
                <div className={styles.inputFields__wrapper}>
                  <div className={styles.wrapper}>
                    <div className={styles.title}>First Name</div>
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                    <div
                      className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                    >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
            {formType === "FORM_FIVE" && (
              <div
                className={`${styles.container} ${styles.dateTime__container}`}
                style={{ width: "50%" }}
              >
                <div className={styles.inputField__wrapper}>
                  <div className={styles.title}>Booking Start Date</div>
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                  <div
                    className={`${styles.input__wrapper} ${styles.disabledInput__wrapper}`}
                  >
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
                <button
                  className={`${styles.btn} ${styles.prevBtn}`}
                  onClick={handlePrevBtnClick}
                >
                  prev
                </button>
                <button
                  className={`${styles.btn} ${styles.nextBtn}`}
                  onClick={handleNextBtnClick}
                >
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
