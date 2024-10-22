"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.scss";
import {
  FAQ,
  Gallery,
  HallInformation,
  Testimonials,
  VenueSummary,
  Location,
  AboutHall,
  VendorDescription,
  AdditionalOtherVendorDetails,
} from "@/components/pages/business-description";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { LoadingScreen } from "@/components/sub-components";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { PhotographerMasterSchemaType } from "../api/schemas/photographer-master";
import { Navbar, Footer } from '@/components/global'

type Props = {};

const PhotographerDescriptionPage = (props: Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const searchParams = useSearchParams();
  const photographerId = searchParams.get("photographerId");

  const [photographerData, setPhotographerData] = useState<any>({});
  const [serviceProviderData, setServiceProviderData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch service provider data whenever hallData changes
  useEffect(() => {
    if (!photographerData.vendorUserId) return;

    const getServiceProviderData = async (hallData: PhotographerMasterSchemaType) => {
      if (!executeRecaptcha) {
        return;
      }
      try {
        const captchaToken = await executeRecaptcha("inquirySubmit");

        const response = await axios.get(
          `/api/routes/serviceProviderMaster/${hallData.vendorUserId}`,
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

    getServiceProviderData(photographerData);
  }, [photographerData, executeRecaptcha]);

  // Fetch hall data whenever hallId changes
  useEffect(() => {
    // @TODO: Handle error condition here
    if (!photographerId) return;

    const getVendorData = async () => {
      if (!executeRecaptcha) {
        return;
      }
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');

        const response = await axios.get(`/api/routes/photographerMaster/${photographerId}`, {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        });
        setPhotographerData(response.data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getVendorData();
  }, [photographerId, executeRecaptcha]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className={styles.photographerDescription__container}>
      <Navbar />
      <div className={styles.main__wrapper}>
        <div className={styles.sub__wrapper}>
          <div className={styles.column1}>
            <VendorDescription vendorType="OTHER" vendorData={""} />
            <AboutHall />
          </div>
          <div className={styles.column2}>
            <AdditionalOtherVendorDetails otherVendorData={null} />
          </div>
        </div>
        <Gallery />
        <HallInformation />
        <VenueSummary />
        <Testimonials />
        <Location />
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default PhotographerDescriptionPage;
