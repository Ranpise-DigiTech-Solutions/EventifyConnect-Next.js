/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import { DatePicker, Tag, Modal, Skeleton, Empty } from "antd";
import TablePagination from "@mui/material/TablePagination";
import axios from "axios";

import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { BookingDetailsDialog } from "..";
import { RootState } from "@/redux/store";
import styles from "./booking-history.module.scss";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Props = {
  hallId: string;
};

const BookingHistoryComponent = ({ hallId }: Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const userInfoStore = useAppSelector((state: RootState) => state.userInfo);
  const userType = userInfoStore.userDetails.userType || "";
  const vendorType = userInfoStore.userDetails.vendorType || "";

  const { RangePicker } = DatePicker;
  const bookingCancelDialogFormRef = useRef<HTMLFormElement>(null);
  const bookingConfirmDialogFormRef = useRef<HTMLFormElement>(null);

  interface anchorElMapType {
    [key: string]: any;
  }
  const [anchorElMap, setAnchorElMap] = useState<anchorElMapType>({});

  const [startDate, setStartDate] = useState<Date>(new Date()); // represents current date
  const [startDateOfMonth, setStartDateOfMonth] = useState<Date | null>(null); // represents start date of current month
  const [endDateOfMonth, setEndDateOfMonth] = useState<Date | null>(null); // represents end date of current month
  const [userBookings, setUserBookings] = useState([]); // stores all the user bookings according to the given constraints
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false); // toggle page loading animation
  const [dataSortCriteria, setDataSortCriteria] =
    useState<string>("bookingStartDate"); // sort the data based on chosen criteria
  const [currentTab, setCurrentTab] = useState<string>("ALL"); // indicates the current tab that the user is viewing - Options = ALL, PENDING, UPCOMING, COMPLETED
  const [reloadData, setReloadData] = useState<boolean>(false); // to trigger the reload
  const [isBookingDetailsDialogOpen, setIsBookingDetailsDialogOpen] =
    useState<boolean>(false); // trigger the booking details dialog
  const [selectedBooking, setSelectedBooking] = useState<any>({}); // current booking selection
  const [
    openBookingCancelConfirmationDialog,
    setOpenBookingCancelConfirmationDialog,
  ] = useState<boolean>(false); // toggle booking cancellation screen
  const [
    openBookingConfirmConfirmationDialog,
    setOpenBookingConfirmConfirmationDialog,
  ] = useState<boolean>(false); // toggle booking confirmation screen
  const [alertDialog, setAlertDialog] = useState<boolean>(false); // to display error messages

  const [pageNo, setPageNo] = useState<number>(0); // current page no.
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0); // set it according to data fetched from database

  const handleMoreVertIconClick = (
    event: React.SyntheticEvent | Event,
    booking: {
      _id: string;
      documentId: string;
      hallName: string;
      vendorType: string;
      customerName: string;
      customerType: string;
      eventName: string;
      bookingStartDateTimestamp: string;
      bookingDuration: number;
      bookingStatus: string;
    }
  ) => {
    setAnchorElMap({
      ...anchorElMap,
      [booking._id]: event.currentTarget,
    });
    setSelectedBooking(booking); // Set the selected booking
  };

  const handleMoreVertIconClose = () => {
    setAnchorElMap({});
  };
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) => {
    setPageNo(newPage);
  };

  const handleBookingDetailsDialogClose = () => {
    setIsBookingDetailsDialogOpen(false);
    setSelectedBooking({}); // Reset the selected booking
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPageNo(0);
  };

  const handleBookingCancelConfirmationDialogClose = () => {
    setOpenBookingCancelConfirmationDialog(false);
    handleMoreVertIconClose();
  };

  const handleBookingCancelConfirmationDialogOpen = () => {
    setOpenBookingCancelConfirmationDialog(true);
  };

  const handleBookingConfirmConfirmationDialogOpen = () => {
    setOpenBookingConfirmConfirmationDialog(true);
  };

  const handleBookingConfirmConfirmationDialogClose = () => {
    setOpenBookingConfirmConfirmationDialog(false);
    handleMoreVertIconClose();
  };

  const startOfMonth = (date: Date) => {
    const d = new Date(date);
    d.setDate(1); // Set to the first day of the month
    d.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    return d;
  };

  const endOfMonth = (date: Date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1); // Move to the next month
    d.setDate(0); // Set to the last day of the previous month (current month)
    d.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
    return d;
  };

  // set time of any given date to 00:00:00:000
  const setStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // set time of any given date to 23:59:59:999
  const setEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  useEffect(() => {
    if (!startDate) {
      return;
    }
    setStartDateOfMonth(startOfMonth(startDate));
    setEndDateOfMonth(endOfMonth(startDate));
  }, [startDate]);

  useEffect(() => {
    if (!startDateOfMonth || !endDateOfMonth || !executeRecaptcha) {
      return;
    }

    const getUserBookings = async () => {
      setIsPageLoading(true);
      const captchaToken = await executeRecaptcha("inquirySubmit");

      setTimeout(async () => {
        try {
          
          const URL =
            userType === "CUSTOMER"
              ? `/api/routes/bookingMaster/getUserBookings/?customerId=${userInfoStore.userDetails.Document._id}&startDateOfMonth=${startDateOfMonth}&endDateOfMonth=${endDateOfMonth}&page=${pageNo}&limit=${rowsPerPage}&sortCriteria=${dataSortCriteria}&bookingCategory=${currentTab}`
              : vendorType === "Banquet Hall" &&
                `/api/routes/bookingMaster/getHallBookings/?hallId=${hallId}&startDateOfMonth=${startDateOfMonth}&endDateOfMonth=${endDateOfMonth}&page=${pageNo}&limit=${rowsPerPage}&sortCriteria=${dataSortCriteria}&bookingCategory=${currentTab}`;

          if (!URL) return;

          const response = await axios.get(URL, {
            headers: {
              "Content-Type": "application/json",
              "X-Captcha-Token": captchaToken,
            },
            withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
          });

          
          setUserBookings(response.data[0].bookings);
          setTotalPages(response.data[0].total[0]?.count || 1);

          setIsPageLoading(false);
        } catch (error) {
          
        }
      }, 2000);
    };

    getUserBookings();
  }, [
    executeRecaptcha,
    startDateOfMonth,
    endDateOfMonth,
    dataSortCriteria,
    rowsPerPage,
    pageNo,
    reloadData,
    currentTab,
    userInfoStore.userDetails,
  ]);

  // trigger the booking details dialog only after the current selection data is loaded
  // useEffect(()=> {
  //   if(selectedBooking.length === 0) {
  //     return;
  //   }
  //   setIsBookingDetailsDialogOpen(true);
  // }, [selectedBooking])

  const handleDateChange = (dates: any, dateStrings: string[]) => {
    if (!dates || dates.length === 0) {
      setStartDate(new Date());
    } else {
      setStartDateOfMonth(setStartOfDay(dates[0].toDate()));
      setEndDateOfMonth(setEndOfDay(dates[1].toDate()));
    }
  };

  const getFormattedBookingStartDate = (date: string) => {
    const bookingStDate = new Date(date);
    const month = bookingStDate.getMonth() + 1;
    const day = bookingStDate.getDate();
    const year = bookingStDate.getFullYear();
    return `${day.toString().padStart(2, "0")} / ${month
      .toString()
      .padStart(2, "0")} / ${year}`;
  };

  const handleViewDetailsClick = () => {
    
    // setSelectedBooking(selectedBooking);
    setIsBookingDetailsDialogOpen(true);
    handleMoreVertIconClose();
  };

  const handleCancelBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    // Handle cancel booking logic
    event.preventDefault();

    if (!selectedBooking || !executeRecaptcha || !bookingCancelDialogFormRef.current) {
      console.log("ENTERED ")
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("inquirySubmit");
      handleBookingCancelConfirmationDialogClose();
      setIsPageLoading(true);

      const formData = new FormData(bookingCancelDialogFormRef.current);
      const formJson =Object.fromEntries((formData as any).entries());
      const message = formJson.message;

      const response = await axios.patch(
        `/api/routes/bookingMaster/${selectedBooking._id}`,
        {
          bookingStatus: "CANCELLED",
          bookingStatusRemark: message,
          customerEmail: selectedBooking.customerEmail || "",
          hallMainEmail: selectedBooking.hallMainEmail || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );

      setIsPageLoading(false);

      handleMoreVertIconClose(); // Close menu after action
      setReloadData(!reloadData);
    } catch (error) {
      
      setIsPageLoading(false);
      handleMoreVertIconClose(); // Close menu after action
      setAlertDialog(true);
    }
  };

  const handleConfirmBooking = async (event: any) => {
    event.preventDefault();

    if (!selectedBooking || !executeRecaptcha) {
      return;
    }

    try {
      handleBookingConfirmConfirmationDialogClose();
      setIsPageLoading(true);

      // const formData = new FormData(event.currentTarget);
      // const formJson =Object.fromEntries((formData as any).entries());
      // const message = formJson.message;
      const captchaToken = await executeRecaptcha("inquirySubmit");
      const bookingMasterRes = await axios.get(
        `/api/routes/bookingMaster/${selectedBooking._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );

      const bookingDetails = bookingMasterRes.data;
      const {
        bookingType,
        createdAt,
        updatedAt,
        customerInfo,
        customerNonVegItemsList,
        customerVegItemsList,
        customerNonVegRate,
        customerVegRate,
        guestsCount,
        parkingRequirement,
        roomsCount,
        vehiclesCount,
        _v,
        ...info
      } = bookingDetails;

      const captchaToken2 = await executeRecaptcha("inquirySubmit");
      // set the status as confirmed in bookingMaster
      await axios.patch(
        `/api/routes/bookingMaster/${selectedBooking._id}`,
        {
          bookingStatus: "CONFIRMED",
          bookingStatusRemark: "",
          customerEmail: selectedBooking.customerEmail || "",
          hallMainEmail: selectedBooking.hallMainEmail || "",
          documentId: selectedBooking.documentId || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken2,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );

      const captchaToken3 = await executeRecaptcha("inquirySubmit");
      // push the confirmed booking to hallBookingMaster
      await axios.post(
        `api/routes/hallBookingMaster/`,
        {
          ...info,
          finalVegRate: customerVegRate,
          finalNonVegRate: customerNonVegRate,
          finalVegItemsList: customerVegItemsList,
          finalNonVegItemsList: customerNonVegItemsList,
          finalGuestCount: guestsCount,
          finalHallParkingRequirement: parkingRequirement,
          bookingStatus: "CONFIRMED",
          finalRoomCount: roomsCount,
          finalVehicleCount: vehiclesCount,
          bookingStatusRemark: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken3,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );

      setIsPageLoading(false);
      handleMoreVertIconClose(); // Close menu after action
      setReloadData(!reloadData);
    } catch (error) {
      console.log(error);
      setIsPageLoading(false);
      handleMoreVertIconClose(); // Close menu after action
      setAlertDialog(true);
    }
  };

  const BookingItemSkeleton = () => (
    <div className={styles.bookingItem}>
      <div className={styles["items-list"]}>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Input
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <Skeleton.Button
            style={{ width: 100, backgroundColor: "#666" }}
            active
          />
        </div>
        <div className={styles.item}>
          <MoreVertIcon className={styles.menuIcon} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.bookingHistory__container}>
      {isBookingDetailsDialogOpen && (
        <BookingDetailsDialog
          open={isBookingDetailsDialogOpen}
          handleClose={handleBookingDetailsDialogClose}
          currentBooking={selectedBooking}
          userType={userType}
          vendorType={vendorType}
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
            <Button onClick={() => setAlertDialog(false)} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      <Dialog
        open={openBookingCancelConfirmationDialog}
        onClose={handleBookingCancelConfirmationDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: handleCancelBooking,
          ref: bookingCancelDialogFormRef
        }}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure, you want to cancel your booking? Please note that this
            action is irreversible.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="message"
            name="message"
            label="Your Message"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingCancelConfirmationDialogClose}>
            Cancel
          </Button>
          <Button type="submit">Proceed</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openBookingConfirmConfirmationDialog}
        onClose={handleBookingConfirmConfirmationDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: handleConfirmBooking,
        }}
      >
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure, you want to confirm this booking? Please note that
            this action is irreversible.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="message"
            name="message"
            label="Your Message"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingConfirmConfirmationDialogClose}>
            Cancel
          </Button>
          <Button type="submit">Proceed</Button>
        </DialogActions>
      </Dialog>
      <div className={styles.wrapper}>
        <div className={styles.secondaryNavbar}>
          <div className={styles["items-list"]}>
            <p
              className={`${styles.item} ${
                currentTab === "ALL" && styles.currentTab
              }`}
              onClick={() => setCurrentTab("ALL")}
            >
              All Orders
            </p>
            <p
              className={`${styles.item} ${
                currentTab === "PENDING" && styles.currentTab
              }`}
              onClick={() => setCurrentTab("PENDING")}
            >
              Pending
            </p>
            <p
              className={`${styles.item} ${
                currentTab === "UPCOMING" && styles.currentTab
              }`}
              onClick={() => setCurrentTab("UPCOMING")}
            >
              Upcoming
            </p>
            <p
              className={`${styles.item} ${
                currentTab === "COMPLETED" && styles.currentTab
              }`}
              onClick={() => setCurrentTab("COMPLETED")}
            >
              Completed
            </p>
          </div>
          <div className={styles.calendar}>
            <RangePicker
              className={styles.datePicker}
              onChange={handleDateChange}
            />
            <button
              onClick={() => setReloadData(!reloadData)}
              className={styles.icon}
              title="reloadBtn"
            >
              <SearchIcon />
            </button>
          </div>
        </div>
        <div className={styles.tagList}>
          <div
            className={styles.tag}
            onClick={() => setDataSortCriteria("bookingId")}
          >
            <p>Id</p>
            <ArrowDropDownOutlinedIcon className={styles.icon} />
          </div>
          {userType === "CUSTOMER" ? (
            <>
              <div
                className={styles.tag}
                onClick={() => setDataSortCriteria("hallName")}
              >
                <p>Vendor Name</p>
                <ArrowDropDownOutlinedIcon className={styles.icon} />
              </div>
              <div
                className={styles.tag}
                onClick={() => setDataSortCriteria("vendorType")}
              >
                <p>Vendor</p>
                <ArrowDropDownOutlinedIcon className={styles.icon} />
              </div>
            </>
          ) : (
            <>
              <div
                className={styles.tag}
                onClick={() => setDataSortCriteria("customerName")}
              >
                <p>Cust Name</p>
                <ArrowDropDownOutlinedIcon className={styles.icon} />
              </div>
              <div
                className={styles.tag}
                onClick={() => setDataSortCriteria("customerType")}
              >
                <p>Cust Type</p>
                <ArrowDropDownOutlinedIcon className={styles.icon} />
              </div>
            </>
          )}
          <div
            className={styles.tag}
            onClick={() => setDataSortCriteria("eventType")}
          >
            <p>Event</p>
            <ArrowDropDownOutlinedIcon className={styles.icon} />
          </div>
          <div
            className={styles.tag}
            onClick={() => setDataSortCriteria("bookingStartDate")}
          >
            <p>Booking Date</p>
            <ArrowDropDownOutlinedIcon className={styles.icon} />
          </div>
          <div
            className={styles.tag}
            onClick={() => setDataSortCriteria("bookingDuration")}
          >
            <p>Duration</p>
            <ArrowDropDownOutlinedIcon className={styles.icon} />
          </div>
          <div
            className={styles.tag}
            onClick={() => setDataSortCriteria("bookingStatus")}
          >
            <p>Status</p>
            <ArrowDropDownOutlinedIcon className={styles.icon} />
          </div>
          <div className={styles.tag}>Actions</div>
        </div>
        <div className={styles["bookings-wrapper"]}>
          {isPageLoading ? (
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <BookingItemSkeleton key={index} />
            ))
          ) : userBookings.length !== 0 ? (
            userBookings.map(
              (
                booking: {
                  _id: string;
                  documentId: string;
                  hallName: string;
                  vendorType: string;
                  customerName: string;
                  customerType: string;
                  eventName: string;
                  bookingStartDateTimestamp: string;
                  bookingDuration: number;
                  bookingStatus: string;
                },
                index
              ) => (
                <div className={styles.bookingItem} key={index}>
                  <div className={styles["items-list"]}>
                    <div className={styles.item}>{booking.documentId}</div>
                    {userType === "CUSTOMER" ? (
                      <>
                        <div className={styles.item}>{booking.hallName}</div>
                        <div className={styles.item}>{booking.vendorType}</div>
                      </>
                    ) : (
                      <>
                        <div className={styles.item}>
                          {booking.customerName}
                        </div>
                        <div className={styles.item}>
                          {booking.customerType}
                        </div>
                      </>
                    )}
                    <div className={styles.item}>{booking.eventName}</div>
                    <div className={styles.item}>
                      {getFormattedBookingStartDate(
                        booking.bookingStartDateTimestamp
                      )}
                    </div>
                    <div className={styles.item}>{booking.bookingDuration}</div>
                    <div className={styles.item}>
                      {booking.bookingStatus === "CONFIRMED" ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          CONFIRMED
                        </Tag>
                      ) : booking.bookingStatus === "PENDING" ? (
                        <Tag icon={<SyncOutlined spin />} color="processing">
                          PENDING
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                          CANCELLED
                        </Tag>
                      )}
                    </div>
                    <div className={styles.item}>
                      <Button
                        id={`basic-button-${index}`} // Ensure unique ID
                        aria-controls={`basic-menu-${index}`} // Ensure unique ID
                        aria-haspopup="true"
                        aria-expanded={Boolean(anchorElMap[booking._id])}
                        onClick={(event) =>
                          handleMoreVertIconClick(event, booking)
                        }
                      >
                        <MoreVertIcon className={styles.menuIcon} />
                      </Button>
                      <Menu
                        id={`basic-menu-${index}`} // Ensure unique ID
                        anchorEl={anchorElMap[booking._id]}
                        open={Boolean(anchorElMap[booking._id])}
                        onClose={handleMoreVertIconClose}
                        MenuListProps={{
                          "aria-labelledby": `basic-button-${index}`, // Ensure unique ID
                        }}
                      >
                        <MenuItem onClick={handleViewDetailsClick}>
                          View Details
                        </MenuItem>
                        <MenuItem
                          style={{ color: "green" }}
                          onClick={handleBookingConfirmConfirmationDialogOpen}
                          disabled={
                            userType === "CUSTOMER" ||
                            booking.bookingStatus !== "PENDING"
                          }
                        >
                          Confirm Booking
                        </MenuItem>
                        <MenuItem
                          style={{ color: "red" }}
                          onClick={handleBookingCancelConfirmationDialogOpen}
                          disabled={booking.bookingStatus !== "PENDING"}
                        >
                          Cancel Booking
                        </MenuItem>
                      </Menu>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <img
              src={"/images/noBookingsFound.jpg"}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          )}
        </div>
      </div>
      <TablePagination
        component="div"
        count={totalPages}
        page={pageNo}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className={styles.pagination}
        classes={{ toolbar: styles["pagination-toolbar"] }} // Override toolbar styles
      />
    </div>
  );
};

export default BookingHistoryComponent;
