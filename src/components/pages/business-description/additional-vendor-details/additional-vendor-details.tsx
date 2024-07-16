"use client"

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import PlaceIcon from "@mui/icons-material/Place";
import ErrorIcon from "@mui/icons-material/Error";
import VerifiedIcon from "@mui/icons-material/Verified";

import { firebaseAuth } from "@/lib/db/firebase";
import { setBookingInfoData } from "@/redux/slices/booking-info";
import { onAuthStateChanged } from "firebase/auth";
import { ContactForm } from "@/components/sub-components";
import styles from "./additional-vendor-details.module.scss";

type Props = {
  handleBookingDetailsDialogOpen: () => void;
  hallData: any;
};

const similarVendorsData = [
  {
    brandName: "Sun Hotel & Resort",
    location: "Abu Road, Udaipur",
    ratings: 4.9,
    reviews: 41,
    availability: "AVAILABLE",
    Image: "/images/Hall_05.jpg",
  },
  {
    brandName: "Sun Hotel & Resort",
    location: "Abu Road, Udaipur",
    ratings: 4.9,
    reviews: 41,
    availability: "AVAILABLE",
    Image: "/images/Hall_04.jpg",
  },
  {
    brandName: "Sun Hotel & Resort",
    location: "Abu Road, Udaipur",
    ratings: 4.9,
    reviews: 41,
    availability: "AVAILABLE",
    Image: "/images/Hall_06.jpg",
  },
];

const AdditionalVendorDetailsComponent = ({
  handleBookingDetailsDialogOpen,
  hallData,
}: Props) => {
  const dispatch = useAppDispatch();
  const bookingInfoStore = useAppSelector((state) => state.bookingInfo);
  const userInfoStore = useAppSelector((state) => state.userInfo);

  const [openSignInAlertDialog, setOpenSignInAlertDialog] =
    useState<boolean>(false);
  const [openSendMessageDialog, setOpenSendMessageDialog] =
    useState<boolean>(false);
  const [openContactInfoDialog, setOpenContactInfoDialog] =
    useState<boolean>(false);
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false); // to toggle snackBar
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); //user login status

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  function getDayOfWeek(date: Date): string {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  }

  const handleSignInAlertDialogOpen = () => {
    setOpenSignInAlertDialog(true);
  };

  const handleSignInAlertDialogClose = () => {
    setOpenSignInAlertDialog(false);
  };

  const handleSendMessageDialogOpen = () => {
    setOpenSendMessageDialog(true);
  };

  const handleSendMessageDialogClose = () => {
    setOpenSendMessageDialog(false);
  };

  const handleContactInfoDialogOpen = () => {
    setOpenContactInfoDialog(true);
  };

  const handleContactInfoDialogClose = () => {
    setOpenContactInfoDialog(false);
  };

  const handleSnackBarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsMessageSent(false);
  };

  const snackBarAction = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleSnackBarClose}>
        Un-Send
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
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      try {
        if (currentUser) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userInfoStore.userAuthStateChangeFlag]);

  const handleBookingStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const bookingStartDate = new Date(event.target.value);
    const bookingEndDate = new Date(bookingInfoStore.bookingEndDate);
    dispatch(setBookingInfoData({ key: "comments", value: "" }));

    if (bookingStartDate > bookingEndDate) {
      dispatch(
        setBookingInfoData({
          key: "errorInfo",
          value:
            "Invalid Time Frame! Start date cannot be greater than end date.",
        })
      );
      return;
    }

    dispatch(
      setBookingInfoData({ key: "bookingStartDate", value: event.target.value })
    );
    dispatch(
      setBookingInfoData({
        key: "bookingStartDay",
        value: getDayOfWeek(new Date(event.target.value)),
      })
    );
    dispatch(setBookingInfoData({ key: "errorInfo", value: "" }));
  };

  const handleBookingEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const bookingStartDate = new Date(bookingInfoStore.bookingStartDate);
    const bookingEndDate = new Date(event.target.value);

    if (bookingEndDate < bookingStartDate) {
      dispatch(
        setBookingInfoData({
          key: "errorInfo",
          value:
            "Invalid Time Frame! End date cannot be lesser than start date.",
        })
      );
      return;
    }

    dispatch(
      setBookingInfoData({ key: "bookingEndDate", value: event.target.value })
    );
    dispatch(
      setBookingInfoData({
        key: "bookingEndDay",
        value: getDayOfWeek(new Date(event.target.value)),
      })
    );
    dispatch(setBookingInfoData({ key: "errorInfo", value: "" }));
  };

  const handleBookingStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [HH, MM] = event.target.value.split(":");
    const endHour = parseInt(HH) < 23 ? parseInt(HH) + 1 : "00";
    dispatch(
      setBookingInfoData({ key: "startTime", value: event.target.value })
    );
    dispatch(
      setBookingInfoData({
        key: "endTime",
        value: `${endHour.toString().padStart(2, "0")}:${MM}`,
      })
    );
    dispatch(setBookingInfoData({ key: "errorInfo", value: "" }));
  };

  const handleBookingEndTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!bookingInfoStore.startTime) {
      dispatch(
        setBookingInfoData({
          key: "errorInfo",
          value: "Sorry! Please choose a start time first!",
        })
      );
      return;
    }
    if (bookingInfoStore.bookingStartDate === bookingInfoStore.bookingEndDate) {
      if (event.target.value === bookingInfoStore.startTime) {
        dispatch(
          setBookingInfoData({
            key: "errorInfo",
            value: "End time cannot be same as Start time.",
          })
        );
        return;
      } else if (
        parseInt(event.target.value.substring(0, 2)) <
        parseInt(bookingInfoStore.startTime.substring(0, 2))
      ) {
        dispatch(
          setBookingInfoData({
            key: "errorInfo",
            value: "End time cannot be less than Start time.",
          })
        );
        return;
      }
    }
    dispatch(setBookingInfoData({ key: "endTime", value: event.target.value }));
    dispatch(setBookingInfoData({ key: "errorInfo", value: "" }));
  };

  const handleBookBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const currentUser = firebaseAuth.currentUser;
    console.log("CURRENT USER", currentUser);
    if (!currentUser) {
      handleSignInAlertDialogOpen();
      return;
    }

    if (!bookingInfoStore.startTime || !bookingInfoStore.endTime) {
      dispatch(
        setBookingInfoData({
          key: "errorInfo",
          value: "Sorry! Please choose a start time and end time first!",
        })
      );
      return;
    }

    handleBookingDetailsDialogOpen();
  };

  return (
    <div className={styles.additionalVendorDetails__container}>
      {/* SnackBar */}
      <Snackbar
        open={isMessageSent}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        message="Thank you for connecting! We'll get back to you soon!!"
        action={snackBarAction}
      />
      {/* Sign-In Alert Dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openSignInAlertDialog}
        onClose={handleSignInAlertDialogClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-description"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Sign-In Required"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To access this feature, please sign in to your account. Signing in
            will allow you to continue using the application and access
            additional functionalities. Thank you for your cooperation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSignInAlertDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      {/* Send Message Dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openSendMessageDialog}
        onClose={handleSendMessageDialogClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <div
          className={styles.sendMessageDialog__wrapper}
          style={{ padding: "2rem", backgroundColor: "#333333" }}
        >
          <ContactForm setIsSuccess={setIsMessageSent} />
        </div>
      </Dialog>
      {/* Contact Info Dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openContactInfoDialog}
        onClose={handleContactInfoDialogClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <div
            className={styles.sendMessageDialog__wrapper}
            style={{ padding: "2rem", backgroundColor: "#f7f7f7" }}
          >
            {/* <ContactInfoDialog
              profilePic=""
              name={hallData?.hallMainContactName}
              designation={hallData?.hallMainDesignation}
              personalContact={hallData?.hallMainMobileNo}
              officeContact={hallData?.hallMainOfficeNo}
              emailId={hallData?.hallMainEmail}
            /> */}
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleContactInfoDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <div className={styles.pricingInformation__wrapper}>
        <div className={styles.title__wrapper}>
          <p className={styles.title}>Starting price</p>
          <div className={styles.dropDown__wrapper}>
            <p className={styles.dropDown__title}>Pricing Info</p>
            <KeyboardArrowDownIcon className={styles.icon} />
          </div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.pricing__wrapper}>
          <div className={styles.rate__wrapper}>
            <CurrencyRupeeIcon className={styles.icon} />
            <p>
              {hallData.hallVegRate ? hallData.hallVegRate : 0} per plate{" "}
              <span>(taxes extra)</span>
            </p>
          </div>
          <div className={styles["sub-title"]}>Veg</div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.pricing__wrapper}>
          <div className={styles.rate__wrapper}>
            <CurrencyRupeeIcon className={styles.icon} />
            <p>
              {hallData.hallNonVegRate ? hallData.hallNonVegRate : 0} per plate{" "}
              <span>(taxes extra)</span>
            </p>
          </div>
          <div className={styles["sub-title"]}>Non-Veg</div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.contactBtn__wrapper}>
          <button className={styles.btn} onClick={handleSendMessageDialogOpen}>
            <MailOutlineIcon className={styles.icon} />
            <p className={styles['btn-caption']}>Send Message</p>
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              if (isUserLoggedIn) {
                handleContactInfoDialogOpen();
              } else {
                handleSignInAlertDialogOpen();
              }
            }}
          >
            <PhoneIcon className={styles.icon} />
            <p className={styles['btn-caption']}>View Contact</p>
          </button>
        </div>
      </div>
      <div className={styles.similarVendors__wrapper}>
        <div className={styles.title__wrapper}>
          <p className={styles.title}>Browse similar vendors</p>
          <button className={styles.btn}>View All</button>
        </div>
        <div className={styles.vendorList__wrapper}>
          {similarVendorsData.map((data, index) => (
            <div className={styles.vendor} key={index}>
              <div className={styles.img__wrapper}>
                <img src={data.Image} alt="" />
              </div>
              <div className={styles.contents__wrapper}>
                <div className={styles['sub-contents__wrapper']}>
                  <div className={`${styles.wrapper} ${styles['wrapper-1']}`}>
                    <p className={styles.title}>{data.brandName}</p>
                    <div className={styles.ratings__wrapper}>
                      <StarIcon className={styles.icon} />
                      <p className={styles.rating}>{data.ratings}</p>
                    </div>
                  </div>
                  <div className={`${styles.wrapper} ${styles['wrapper-2']}`}>
                    <div className={styles.location__wrapper}>
                      <PlaceIcon className={styles.icon} />
                      <p className={styles.location}>{data.location}</p>
                    </div>
                    <p className={styles.reviews}>41 reviews</p>
                  </div>
                </div>
                <div className={styles['sub-contents__wrapper']}>
                  <div className={`${styles.wrapper} ${styles['wrapper-3']}`}>
                    <p>{data.availability}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.navigationBtns__wrapper}>
          <button className={styles.btn} title={styles.leftIcon}>
            <KeyboardArrowLeftIcon className={styles.icon} />
          </button>
          <button className={styles.btn} title={styles.rightIcon}>
            <KeyboardArrowRightIcon className={styles.icon} />
          </button>
        </div>
      </div>
      <div className={styles.advertisement__wrapper}>
        <div className={styles.img__wrapper}>
          <img src={"/images/advertisement2.jpg"} alt="" />
        </div>
      </div>
      <div className={styles.availabilityChecker__wrapper}>
        <div className={styles.title__wrapper}>
          <p className={styles.title}>Check availability</p>
        </div>
        <div className={styles.inputFields__wrapper}>
          <div className={styles.wrapper}>
            <p className={styles.inputTitle}>Start Date of booking</p>
            <div className={styles.input}>
              <input
                type="date"
                value={
                  bookingInfoStore.bookingStartDate
                    ? bookingInfoStore.bookingStartDate
                    : ""
                }
                placeholder="dd/mm/yyyy"
                onChange={handleBookingStartDateChange}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p className={styles.inputTitle}>Start Time</p>
            <div className={styles.input}>
              <input
                type="time"
                placeholder="dd/mm/yyyy"
                value={
                  bookingInfoStore.startTime ? bookingInfoStore.startTime : ""
                }
                onChange={handleBookingStartTimeChange}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p className={styles.inputTitle}>End Date of booking</p>
            <div className={styles.input}>
              <input
                type="date"
                value={
                  bookingInfoStore.bookingEndDate
                    ? bookingInfoStore.bookingEndDate
                    : ""
                }
                placeholder="dd/mm/yyyy"
                onChange={handleBookingEndDateChange}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p className={styles.inputTitle}>End Time</p>
            <div className={styles.input}>
              <input
                type="time"
                value={bookingInfoStore.endTime ? bookingInfoStore.endTime : ""}
                placeholder="dd/mm/yyyy"
                onChange={handleBookingEndTimeChange}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p className={styles.inputTitle}>Booking Duration</p>
            <div className={styles.input__wrapper}>
              <div className={styles['sub-wrapper']}>
                <label htmlFor="hoursInput" className={styles.label}>
                  Hours:
                </label>
                <input
                  type="number"
                  name="hoursInput"
                  value={
                    bookingInfoStore.bookingDuration
                      ? parseInt(bookingInfoStore.bookingDuration.split(":")[0])
                      : ""
                  }
                  className={styles['sub-input']}
                  disabled
                />
              </div>
              <div className={styles['sub-wrapper']}>
                <label htmlFor="minutesInput" className={styles.label}>
                  Minutes:
                </label>
                <input
                  type="number"
                  name="minutesInput"
                  value={
                    bookingInfoStore.bookingDuration
                      ? parseInt(
                          bookingInfoStore?.bookingDuration.split(":")[1]
                        )
                      : ""
                  }
                  className={styles['sub-input']}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className={styles.userInfo__wrapper}>
            {bookingInfoStore.errorInfo && (
              <div className={`${styles.inputError} ${styles.comments}`}>
                <ErrorIcon className={styles.icon} />
                <p>{bookingInfoStore.errorInfo}</p>
              </div>
            )}
            {bookingInfoStore.comments && (
              <div className={`${styles.inputSuccess} ${styles.comments}`}>
                <VerifiedIcon className={styles.icon} />
                <p>{bookingInfoStore.comments}</p>
              </div>
            )}
            {/* <p className="desc">* Please read the terms and conditions carefully</p> */}
          </div>
          <div className={styles.btn__wrapper}>
            <button className={styles.btn}>Check Slot</button>
            <button className={styles.btn} onClick={handleBookBtnClick}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalVendorDetailsComponent;
