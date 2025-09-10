// src/components/forms/CatererDetailsForm.tsx

"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Spin, message } from "antd";
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import { RootState } from "@/redux/store";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Dispatch, SetStateAction } from "react";

import styles from "./form.module.scss";

// Define the props for this component
type Props = {
  handleClose: () => void;
  vendorDetails: any; // Use a more specific type if available
  setVendorData: (vendorData: any) => void;
  setFilteredCards: Dispatch<SetStateAction<any[]>>;
  handleFilteredSearchComponentClose: () => void;
};

const CatererDetailsForm = ({
  handleClose,
  vendorDetails,
  setVendorData,
  setFilteredCards,
  handleFilteredSearchComponentClose,
}: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(false);
  //const { executeRecaptcha } = useGoogleReCaptcha();

  const handleBookNow = async (values: any) => {
    // if (!executeRecaptcha) {
    //   console.log("Execute recaptcha not yet available");
    //   return;
    // }

    setIsLoading(true);
    // const token = await executeRecaptcha("inquirySubmit");

    try {
      const URL = "/api/routes/bookingMaster/";
      const response = await axios({
        method: "POST",
        url: URL,
        data: {
          vendorId: vendorDetails._id,
          vendorType: "Caterer",
          // ... your booking form data
        },
        headers: {
          "Content-Type": "application/json",
          //"X-Captcha-Token": token,
        },
        withCredentials: true,
      });

      console.log("booking successful", response);
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "Booking request submitted successfully!",
        });
        setVendorData(response.data);
        handleClose();
        handleFilteredSearchComponentClose();
        setFilteredCards([]);
      }
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: "error",
        content: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bookingSchema = Yup.object().shape({
    // Add your validation schema here
  });

  const formik = useFormik({
    initialValues: {
      // Add your initial form values here
    },
    validationSchema: bookingSchema,
    onSubmit: handleBookNow,
  });

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="xs" fullWidth>
      <div className={styles.detailsForm__container}>
        {contextHolder}
        <div className={styles.header}>
          <div className={styles.wrapper}>
            <h2 className={styles.title}>Caterer Booking Details</h2>
            <p className={styles.subTitle}>
              Fill in the details to book the caterer.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.lineSeparator} />
        <form onSubmit={formik.handleSubmit}>
          {/* Add your form fields here */}
          <div className={styles.btn__wrapper}>
            <button type="submit" className={styles.btn}>
              {isLoading ? <Spin size="small" /> : "Book Now"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default CatererDetailsForm;