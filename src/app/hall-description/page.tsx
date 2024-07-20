"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { Navbar, Footer } from "@/components/global";
import {
  FAQ,
  Gallery,
  HallInformation,
  Location,
  Testimonials,
  VenueSummary,
  AvailabilityCalendar,
  AdditionalVendorDetails,
  BookingDetailsDialog,
  HallDescription,
  AboutHall,
} from "@/components/pages/business-description";
import { LoadingScreen } from "@/components/sub-components";
import styles from "./page.module.scss";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Props = {};

const HallDescriptionPage = (props: Props) => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
    const searchParams = useSearchParams();
  const hallId = searchParams.get("hallId");

  const [hallData, setHallData] = useState<any>({});
  const [serviceProviderData, setServiceProviderData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [openBookingDetailsDialog, setOpenBookingDetailsDialog] =
    useState(false);

  // Fetch service provider data whenever hallData changes
  useEffect(() => {
    if (!hallData.hallUserId) return;

    const getServiceProviderData = async (hallData: { hallUserId: string }) => {
      if (!executeRecaptcha) {
        return;
      }
      try {
        const captchaToken = await executeRecaptcha("inquirySubmit");

        const response = await axios.get(
          `/api/routes/serviceProviderMaster/${hallData.hallUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Captcha-Token": captchaToken,
            },
            withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
          }
        );
        setServiceProviderData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getServiceProviderData(hallData);
  }, [hallData, executeRecaptcha]);

  // Fetch hall data whenever hallId changes
  useEffect(() => {
    // @TODO: Handle error condition here
    if (!hallId) return;

    const getHallData = async () => {
      if (!executeRecaptcha) {
        return;
      }
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');

        const response = await axios.get(`/api/routes/hallMaster/${hallId}`, {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        });
        setHallData(response.data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getHallData();
  }, [hallId, executeRecaptcha]);

  const handleBookingDetailsDialogOpen = () => {
    setOpenBookingDetailsDialog(true);
  };

  const handleBookingDetailsDialogClose = () => {
    setOpenBookingDetailsDialog(false);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div>
      <Navbar setIsLoading={setIsLoading} />
      {openBookingDetailsDialog && (
        <BookingDetailsDialog
          open={openBookingDetailsDialog}
          handleClose={handleBookingDetailsDialogClose}
          hallData={hallData}
          serviceProviderData={serviceProviderData}
        />
      )}
      <div className={styles.DescriptionPage__container}>
        <div className={styles.main__wrapper}>
          <div className={styles.sub__wrapper}>
            <div className={styles.column1}>
              <HallDescription hallData={hallData} />
              <AboutHall />
              <AvailabilityCalendar hallData={hallData} />
            </div>
            <div className={styles.column2}>
              <AdditionalVendorDetails
                handleBookingDetailsDialogOpen={handleBookingDetailsDialogOpen}
                hallData={hallData}
              />
            </div>
          </div>
          <Gallery />
          <HallInformation />
          <VenueSummary />
          <Testimonials />
          <Location />
          <FAQ />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HallDescriptionPage;
