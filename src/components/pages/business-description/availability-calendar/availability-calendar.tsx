"use client"
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/use-redux-store";

import Tooltip from "@mui/material/Tooltip";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockIcon from "@mui/icons-material/Lock";

import "react-datepicker/dist/react-datepicker.css";
import "react-multi-carousel/lib/styles.css";
import styles from "./availability-calendar.module.scss";
import { setBookingInfoData } from "@/redux/slices/booking-info";
import { firebaseAuth } from "@/lib/db/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Props = {
  hallData: any;
};

const AvailabilityCalendarComponent = ({ hallData }: Props) => {
  interface timeSlotsType {
    [key: number]: boolean;
  }

  const timeSlots = {
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
    13: false,
    14: false,
    15: false,
    16: false,
    17: false,
    18: false,
    19: false,
    20: false,
    21: false,
    22: false,
    23: false,
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };

  interface calendarType {
    [key: string]: {
      date: string;
      timeSlots: timeSlotsType;
    };
  }

  const calendar = {
    Monday: { date: "", timeSlots: { ...timeSlots } },
    Tuesday: { date: "", timeSlots: { ...timeSlots } },
    Wednesday: { date: "", timeSlots: { ...timeSlots } },
    Thursday: { date: "", timeSlots: { ...timeSlots } },
    Friday: { date: "", timeSlots: { ...timeSlots } },
    Saturday: { date: "", timeSlots: { ...timeSlots } },
    Sunday: { date: "", timeSlots: { ...timeSlots } },
  };
  const [availabilityCalendar, setAvailabilityCalendar] =
    useState<calendarType>(calendar);
  const containerRef = useRef<HTMLInputElement | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startDateOfWeek, setStartDateOfWeek] = useState<Date | null>(null);
  const [endDateOfWeek, setEndDateOfWeek] = useState<Date | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); //user login status

  const dispatch = useAppDispatch();
  const bookingInfoStore = useAppSelector((state) => state.bookingInfo);
  const userInfoStore = useAppSelector((state) => state.userInfo);

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const startOfWeekDate = new Date(d.setDate(diff));
    startOfWeekDate.setHours(0, 0, 0, 0); // Set time to 23:59:59.999
    return startOfWeekDate;
  };

  const endOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust for Sunday
    const endOfWeekDate = new Date(d.setDate(diff));
    endOfWeekDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
    return endOfWeekDate;
  };

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

  function getFormattedDate(date: Date): string {
    // returns YYYY-MM-DD
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }

  const setDates = async (startDateOfWeek: Date, endDateOfWeek: Date) => {
    const updatedCalendar = { ...availabilityCalendar };
    const currentDate = new Date(startDateOfWeek);

    while (currentDate <= endDateOfWeek) {
      const formattedDate = currentDate.toLocaleDateString("en-GB"); // Format: "dd/mm/yyyy"
      const dayOfWeek = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (Object.prototype.hasOwnProperty.call(updatedCalendar, dayOfWeek)) {
        updatedCalendar[dayOfWeek].date = formattedDate;
      }

      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    setAvailabilityCalendar(updatedCalendar);
  };

  const getAvailability = async () => {
    try {
      if (startDateOfWeek && endDateOfWeek) {
        const response = await axios.get(
          `/api/routes/hallBookingMaster/getHallAvailability/?hallId=${hallData._id}&startDate=${startDateOfWeek}&endDate=${endDateOfWeek}`
        );
        console.log(response.data);
        const bookings = response.data;
        if (bookings) {
          bookings.map(
            (booking: {
              bookingStartDateTimestamp: string;
              bookingEndDateTimestamp: string;
            }) => {
              const tempCalendar = { ...availabilityCalendar };
              const bookingStartDate = new Date(
                booking.bookingStartDateTimestamp
              );
              const bookingEndDate = new Date(booking.bookingEndDateTimestamp);
              console.log(
                "BOOKING START and END DATES ",
                bookingStartDate.toString(),
                bookingEndDate.toString()
              );
              console.log(
                "WEEK START and END DATES ",
                startDateOfWeek.toString(),
                endDateOfWeek.toString()
              );

              if (
                bookingStartDate < startDateOfWeek &&
                bookingEndDate > endDateOfWeek
              ) {
                console.log("DEBUGGING_1: ");
                // Case 1: Booking spans over the whole week
                for (const day in tempCalendar) {
                  tempCalendar[day].timeSlots = Object.fromEntries(
                    Object.entries(tempCalendar[day].timeSlots).map(
                      ([timeSlot, _]) => [timeSlot, true]
                    )
                  );
                }
                setAvailabilityCalendar(tempCalendar);
              } else if (
                bookingStartDate >= startDateOfWeek &&
                bookingEndDate > endDateOfWeek
              ) {
                console.log("DEBUGGING_2: ");
                // Case 2: Booking starts within the week but extends beyond it
                const bookingStartDD = bookingStartDate.getDate();
                const endOfWeekDD = endDateOfWeek.getDate();

                for (let i = 0; i <= endOfWeekDD - bookingStartDD; i++) {
                  const date = new Date(
                    bookingStartDate.getTime() + i * 24 * 60 * 60 * 1000
                  );
                  const day = getDayOfWeek(date);
                  if (i === 0) {
                    const bookingStHour = bookingStartDate.getHours();
                    for (let hour = bookingStHour; hour <= 23; hour++) {
                      tempCalendar[day].timeSlots[hour] = true;
                    }
                  } else {
                    tempCalendar[day].timeSlots = Object.fromEntries(
                      Object.entries(tempCalendar[day].timeSlots).map(
                        ([timeSlot, _]) => [timeSlot, true]
                      )
                    );
                  }
                }
                setAvailabilityCalendar(tempCalendar);
              } else if (
                bookingStartDate < startDateOfWeek &&
                bookingEndDate <= endDateOfWeek
              ) {
                console.log("DEBUGGING_3: ");
                // Case 3: Booking ends within the week but starts before it
                const bookingEndDD = bookingEndDate.getDate();
                const startOfWeekDD = startDateOfWeek.getDate();

                for (let i = startOfWeekDD; i <= bookingEndDD; i++) {
                  const date = new Date(
                    startDateOfWeek.getTime() +
                      (i - startOfWeekDD) * 24 * 60 * 60 * 1000
                  );
                  const day = getDayOfWeek(date);

                  if (i === bookingEndDD) {
                    const bookingEndHour = bookingEndDate.getHours();
                    for (let hour = 0; hour < bookingEndHour; hour++) {
                      tempCalendar[day].timeSlots[hour] = true;
                    }
                  } else {
                    tempCalendar[day].timeSlots = Object.fromEntries(
                      Object.entries(tempCalendar[day].timeSlots).map(
                        ([timeSlot, _]) => [timeSlot, true]
                      )
                    );
                  }
                }
                setAvailabilityCalendar(tempCalendar);
              } else {
                // Case 4: Booking falls entirely within the week
                const startDD = bookingStartDate.getDate();
                const endDD = bookingEndDate.getDate();
                const startOfWeekDD = startDateOfWeek.getDate();
                const endOfWeekDD = endDateOfWeek.getDate();

                console.log("DEBUGGING_4 : ", startDD, endDD);
                console.log(startDateOfWeek, endDateOfWeek);
                // console.log(formattedStartDateOfWeek, formattedEndDateOfWeek);
                console.log(bookingStartDate, bookingEndDate);

                if (startDD === endDD) {
                  const bookingStartHour = bookingStartDate.getHours();
                  const bookingEndHour = bookingEndDate.getHours();
                  const day = getDayOfWeek(bookingStartDate);
                  for (
                    let hour = bookingStartHour;
                    hour < bookingEndHour;
                    hour++
                  ) {
                    tempCalendar[day].timeSlots[hour] = true;
                  }
                } else {
                  for (let i = startDD; i <= endDD; i++) {
                    const date = new Date(
                      bookingStartDate.getTime() +
                        (i - startDD) * 24 * 60 * 60 * 1000
                    );
                    const day = getDayOfWeek(date);

                    if (i === startDD) {
                      const bookingStartHour = bookingStartDate.getHours();
                      for (let hour = bookingStartHour; hour <= 23; hour++) {
                        tempCalendar[day].timeSlots[hour] = true;
                      }
                    } else if (i === endDD) {
                      const bookingEndHour = bookingEndDate.getHours();
                      for (let hour = 0; hour < bookingEndHour; hour++) {
                        tempCalendar[day].timeSlots[hour] = true;
                      }
                    } else {
                      tempCalendar[day].timeSlots = Object.fromEntries(
                        Object.entries(tempCalendar[day].timeSlots).map(
                          ([timeSlot, _]) => [timeSlot, true]
                        )
                      );
                    }
                  }
                }
                setAvailabilityCalendar(tempCalendar);
              }
            }
          );
        }
        console.log("AVAILABILITY CALENDAR", availabilityCalendar);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  function parseDate(dateString: string, splitCriteria: string): any {
    if (splitCriteria === "/") {
      // DD/MM/YYYY
      const parts = dateString.split("/");
      // Month is 0-based, so we subtract 1 from the month value
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10)
      );
    } else if (splitCriteria === "-") {
      // YYYY-MM-DD
      const parts = dateString.split("-");
      // Month is 0-based, so we subtract 1 from the month value
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
    }
    return null;
  }

  // Function to compare if a date lies between a start date and an end date
  function isDateInRange(
    date: string,
    startDate: string,
    endDate: string
  ): Boolean | null {
    const parsedDate = parseDate(date, "/");
    const parsedStartDate = parseDate(startDate, "-");
    const parsedEndDate = parseDate(endDate, "-");

    // Check if the date is greater than or equal to the start date
    // and less than or equal to the end date
    if (parsedDate && parsedStartDate && parsedEndDate) {
      return parsedDate >= parsedStartDate && parsedDate <= parsedEndDate;
    } else {
      return null;
    }
  }

  const formatBookingDate = (date: string): string => {
    // yyyy-mm-dd to dd/mm/yyyy
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDate = (date: Date): string => {
    // new Date()  to  dd/mm/yyyy
    const dateObject = new Date(date);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatBookingTime = (time: string): number => {
    // returns only the hour
    const [HH, MM] = time.split(":");
    return parseInt(`${HH}`);
  };

  const isSelectedSlot = (
    currentDate: string,
    timeSlot: number
  ): boolean | null => {
    if (!bookingInfoStore.startTime || !bookingInfoStore.endTime) {
      return null;
    }
    const formattedStartTime = formatBookingTime(bookingInfoStore.startTime);
    const formattedEndTime = formatBookingTime(bookingInfoStore.endTime);

    //check if the time slots fall under the start and end time
    if (currentDate === formatBookingDate(bookingInfoStore.bookingStartDate)) {
      if (currentDate !== formatBookingDate(bookingInfoStore.bookingEndDate)) {
        return timeSlot >= formattedStartTime;
      } else {
        return timeSlot >= formattedStartTime && timeSlot < formattedEndTime;
      }
    } else if (
      currentDate === formatBookingDate(bookingInfoStore.bookingEndDate)
    ) {
      return timeSlot < formattedEndTime;
    } else {
      return true;
    }
  };

  useEffect(() => {
    if (startDate) {
      console.log("CHECK0" + startDate);
      setStartDateOfWeek(startOfWeek(startDate));
      setEndDateOfWeek(endOfWeek(startDate));
    }
  }, [startDate]);

  useEffect(() => {
    if (startDateOfWeek && endDateOfWeek) {
      console.log("CHECK" + startDateOfWeek, endDateOfWeek);
      setDates(startDateOfWeek, endDateOfWeek);
      getAvailability();
    }
  }, [startDateOfWeek, endDateOfWeek]);

  // to fetch the data when the start date changes... condition written to check whether startDate lies in the same week... if so no need to refetch
  useEffect(() => {
    try {
      const bookingStartDate = bookingInfoStore.bookingStartDate;
      if (!bookingStartDate) {
        const [dd, mm, yyyy] = formatDate(startDate).split("/");
        dispatch(
          setBookingInfoData({
            key: "bookingStartDate",
            value: `${yyyy}-${mm}-${dd}`,
          })
        );
        dispatch(
          setBookingInfoData({
            key: "bookingStartDay",
            value: getDayOfWeek(startDate),
          })
        );
        dispatch(
          setBookingInfoData({
            key: "bookingEndDate",
            value: `${yyyy}-${mm}-${dd}`,
          })
        );
        dispatch(
          setBookingInfoData({
            key: "bookingEndDay",
            value: getDayOfWeek(startDate),
          })
        );

        return;
      }
      //  to dd/mm/yyyy
      const newFormatBookingStartDate = formatBookingDate(bookingStartDate);
      for (const day in availabilityCalendar) {
        if (availabilityCalendar[day].date === newFormatBookingStartDate) {
          return;
        }
      }
      setStartDate(bookingInfoStore.bookingStartDate);
    } catch (error: any) {
      console.error(error.message);
    }
  }, [bookingInfoStore.bookingStartDate]);

  // to calculate the booking duration of a booking
  useEffect(() => {
    if (!bookingInfoStore.startTime || !bookingInfoStore.endTime) {
      return;
    }
    try {
      // code to calculate the different between the time slots
      // Parse the start time and end time strings into Date objects
      const startDate: Date = new Date(
        `${bookingInfoStore.bookingStartDate}T${bookingInfoStore.startTime}:00`
      );
      const endDate: Date = new Date(
        `${bookingInfoStore.bookingEndDate}T${bookingInfoStore.endTime}:00`
      );
      console.log("DATES : ", startDate, endDate);

      const timeDifferenceMilliseconds: number =
        endDate.getTime() - startDate.getTime(); //;
      const timeDifferenceHours = Math.floor(
        timeDifferenceMilliseconds / (1000 * 60 * 60)
      );
      const timeDifferenceMinutes = Math.floor(
        (timeDifferenceMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );

      console.log(
        `Time difference: ${timeDifferenceHours} hours ${timeDifferenceMinutes} minutes`
      );

      // Format the time difference into a string representation
      const timeDifferenceStr = `${timeDifferenceHours.toString()}:${timeDifferenceMinutes.toString()}`;

      dispatch(
        setBookingInfoData({ key: "bookingDuration", value: timeDifferenceStr })
      );

      // code to check whether the chosen time range is appropriate or not
      if (
        bookingInfoStore.endTime === "00:00" &&
        bookingInfoStore.bookingStartDate === bookingInfoStore.bookingEndDate
      ) {
        dispatch(
          setBookingInfoData({
            key: "errorInfo",
            value: "Invalid Time Range: Please select a valid time range.",
          })
        );
      } else {
        dispatch(setBookingInfoData({ key: "errorInfo", value: "" }));
      }

      // to check whether the booking overlaps with any existing ones
      const checkBookingSlotAvailability = async () => {
        //clear any previous comments
        dispatch(setBookingInfoData({ key: "comments", value: "" }));

        // code to check if there are any clashes with the existing bookings
        const parsedStartDateObject = parseDate(
          bookingInfoStore.bookingStartDate,
          "-"
        );
        const parsedEndDateObject = parseDate(
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

        const response = await axios.get(
          `/api/routes/hallBookingMaster/getHallBookingsCount/?hallId=${hallData._id}&bookingStartDateTimestamp=${parsedStartDateObject}&bookingEndDateTimestamp=${parsedEndDateObject}`
        );

        const bookings = response.data;
        console.log("Bookings: ", response.data);
        console.log("BOOKINGS : ", bookings.count);
        if (bookings.count !== 0) {
          dispatch(
            setBookingInfoData({
              key: "errorInfo",
              value:
                "Sorry, This slot is already booked. Please choose a different slot to continue.",
            })
          );
          return;
        } else {
          dispatch(
            setBookingInfoData({
              key: "comments",
              value:
                "This slot is available! You can proceed with your booking.",
            })
          );
          return;
        }
      };

      checkBookingSlotAvailability();
    } catch (error: any) {
      console.error(error.message);
    }
  }, [
    bookingInfoStore.bookingStartDate,
    bookingInfoStore.bookingEndDate,
    bookingInfoStore.startTime,
    bookingInfoStore.endTime,
  ]);

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

  const handlePrevWeek = () => {
    setAvailabilityCalendar(calendar);
    setStartDate((prevStartDate) => {
      const newStartDate = new Date(prevStartDate);
      newStartDate.setDate(newStartDate.getDate() - 7);
      return newStartDate;
    });
  };

  const handleNextWeek = () => {
    setAvailabilityCalendar(calendar);
    setStartDate((prevStartDate) => {
      const newStartDate = new Date(prevStartDate);
      newStartDate.setDate(newStartDate.getDate() + 7);
      return newStartDate;
    });
  };

  const handleDateChange = (date: string, day: string) => {
    const [dd, mm, yyyy] = date.split("/");
    dispatch(
      setBookingInfoData({
        key: "bookingStartDate",
        value: `${yyyy}-${mm}-${dd}`,
      })
    );
    dispatch(setBookingInfoData({ key: "bookingStartDay", value: day }));

    dispatch(
      setBookingInfoData({
        key: "bookingEndDate",
        value: `${yyyy}-${mm}-${dd}`,
      })
    );
    dispatch(setBookingInfoData({ key: "bookingEndDay", value: day }));
  };

  const handleTimeChange = (time: string, isBooked: boolean) => {
    const endTime = parseInt(time) < 23 ? parseInt(time) + 1 : "00";

    dispatch(
      setBookingInfoData({
        key: "startTime",
        value: `${time.toString().padStart(2, "0")}:00`,
      })
    );

    dispatch(
      setBookingInfoData({
        key: "endTime",
        value: `${endTime.toString().padStart(2, "0")}:00`,
      })
    );
  };

  return (
    <div className={styles.availabilityCalendar__wrapper}>
      <h2 className={styles.heading}>Availability Calendar</h2>
      <div className={styles.contents__wrapper}>
        <div className={styles['seven-day-date-picker']}>
          <div className={styles.arrow} onClick={handlePrevWeek}>
            <FaChevronLeft className={styles.icon} />
          </div>
          <div className={styles['date-range']}>
            <span>
              {startDateOfWeek
                ? startDateOfWeek.getDate().toString().padStart(2, "0") +
                  "/" +
                  (startDateOfWeek.getMonth() + 1).toString().padStart(2, "0") +
                  "/" +
                  startDateOfWeek.getFullYear().toString()
                : ""}
            </span>
            <span className={styles['date-separator']}>-</span>
            <span>
              {endDateOfWeek
                ? endDateOfWeek.getDate().toString().padStart(2, "0") +
                  "/" +
                  (endDateOfWeek.getMonth() + 1).toString().padStart(2, "0") +
                  "/" +
                  endDateOfWeek.getFullYear().toString()
                : ""}
            </span>
          </div>
          <div className={styles.arrow} onClick={handleNextWeek}>
            <FaChevronRight className={styles.icon} />
          </div>
        </div>
        <>
          {isUserLoggedIn ? (
            <div className={styles.calendar}>
              <div className={styles.days__wrapper}>
                <div className={styles['sub-wrapper']}>
                  <div className={styles['sub-title']} style={{ visibility: "hidden" }}>
                    Hours
                  </div>
                  <div className={styles.title} style={{ visibility: "hidden" }}>
                    Hours
                  </div>
                </div>
                {availabilityCalendar &&
                  Object.keys(availabilityCalendar).map((day) => {
                    const dayInfo = availabilityCalendar[day]; // Access day information

                    // Check if dayInfo exists before accessing its properties
                    if (!dayInfo) return null; // Skip rendering if dayInfo is null or undefined

                    return (
                      <div
                        key={day}
                        className={`${styles['sub-wrapper']} ${
                          (bookingInfoStore.bookingStartDate &&
                          bookingInfoStore.bookingEndDate
                            ? isDateInRange(
                                dayInfo.date,
                                bookingInfoStore.bookingStartDate,
                                bookingInfoStore.bookingEndDate
                              )
                            : dayInfo.date === formatDate(startDate)) &&
                          styles.currentSelection
                        }`}
                      >
                        <div className={styles['sub-title']}>
                          {dayInfo.date.substring(0, 5)}
                        </div>
                        <div className={styles.title}>{day}</div>
                      </div>
                    );
                  })}
              </div>
              <div className={styles.content__wrapper} ref={containerRef}>
                <div className={styles.timeSlots}>
                  <div className={styles.timeSlots__wrapper}>
                    {Object.keys(timeSlots).map((timeSlot, index) => (
                      <div key={index} className={styles['time-slot']}>
                        {timeSlot.toString().padStart(2, "0") + ":00"}
                      </div>
                    ))}
                  </div>
                </div>
                {availabilityCalendar &&
                  Object.keys(availabilityCalendar).map((day) => {
                    const dayInfo = availabilityCalendar[day]; // Access day information

                    // Check if dayInfo exists before accessing its properties
                    if (!dayInfo) return null; // Skip rendering if dayInfo is null or undefined

                    // Assuming parseDate returns a Date object from dayInfo.date
                    const parsedDate: Date = parseDate(dayInfo.date, "/");

                    // Get the current date at midnight in milliseconds
                    const currentDateMidnight: number = new Date().setHours(
                      0,
                      0,
                      0,
                      0
                    );

                    // Calculate the expiry date based on hallData and convert to milliseconds
                    const expiryDate: number =
                      currentDateMidnight +
                      (parseInt(hallData.hallFreezDay || 0) + 1) *
                        24 *
                        60 *
                        60 *
                        1000;

                    // Check if the parsed date is before the expiry date
                    const isExpiredDate: boolean =
                      parsedDate.getTime() < expiryDate;

                    return (
                      <motion.div
                        key={day}
                        className={styles.availableSlots__wrapper}
                        initial={{ opacity: 0 }} // Initial opacity
                        animate={{ opacity: 1 }} // Animation when component enters the DOM
                        exit={{ opacity: 0 }} // Animation when component exits the DOM
                        transition={{ duration: 0.5 }} // Animation duration
                        onClick={(e) =>
                          isExpiredDate
                            ? e.preventDefault()
                            : handleDateChange(dayInfo.date, day)
                        }
                      >
                        <div
                          className={`${styles.timeSlots__wrapper} ${
                            (bookingInfoStore.bookingStartDate &&
                            bookingInfoStore.bookingEndDate
                              ? isDateInRange(
                                  dayInfo.date,
                                  bookingInfoStore.bookingStartDate,
                                  bookingInfoStore.bookingEndDate
                                )
                              : dayInfo.date === formatDate(startDate)) &&
                            styles.currentSelection
                          }`}
                        >
                          {Object.entries(dayInfo.timeSlots).map(
                            ([timeSlot, isBooked]) => (
                              <Tooltip
                                key={timeSlot}
                                title={
                                  isExpiredDate
                                    ? "This slot is expired"
                                    : isBooked
                                    ? "This slot is already booked!"
                                    : "This slot is currently available!"
                                }
                                placement="top"
                                enterDelay={1500}
                                leaveDelay={0}
                              >
                                <div
                                  className={`${styles['time-slot']} ${
                                    isExpiredDate && styles.expiredTimeSlot
                                  } ${
                                    bookingInfoStore.startTime &&
                                    bookingInfoStore.endTime &&
                                    isDateInRange(
                                      dayInfo.date,
                                      bookingInfoStore.bookingStartDate,
                                      bookingInfoStore.bookingEndDate
                                    ) &&
                                    ((isSelectedSlot(
                                      dayInfo.date,
                                      parseInt(timeSlot)
                                    ) &&
                                      styles.selectedTimeSlot) ||
                                      false)
                                  }`}
                                  onClick={(e) =>
                                    isExpiredDate
                                      ? e.preventDefault()
                                      : handleTimeChange(timeSlot, isBooked)
                                  }
                                >
                                  {isBooked ? (
                                    <span className={styles.unAvailableSlot}>NA</span>
                                  ) : (
                                    <span className={styles.availableSlot}>Book</span>
                                  )}
                                  <span className={styles.selectedSlot}>
                                    <CheckCircleOutlineIcon className={styles.icon} />
                                  </span>
                                  <span className={styles.expiredSlot}>
                                    {/* <DoNotDisturbIcon className={styles.icon} /> */}
                                  </span>
                                </div>
                              </Tooltip>
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className={styles.unavailableMessageInfo__wrapper}>
              <LockIcon className={styles.icon} />
              <h2 className={styles.title}>This Content is Locked</h2>
              <p className={styles.desc}>
                Please subscribe to our site to unlock this content
              </p>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default AvailabilityCalendarComponent;
