// src/components/pages/CatererDescriptionPage.tsx

"use client";

import React, { useEffect, useState } from "react";
//import styles from "./page.module.scss";
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
import { Navbar, Footer } from '@/components/global';
import { CatererMasterSchemaType } from "@/app/api/schemas/caterer-master";

type Props = {};

const CatererDescriptionPage = (props: Props) => {
  //const { executeRecaptcha } = useGoogleReCaptcha();
  const searchParams = useSearchParams();
  const catererId = searchParams.get("catererId");

  // CRITICAL FIX: Initialize with null and update the type
  const [catererData, setCatererData] = useState<CatererMasterSchemaType | null>(null);
  const [serviceProviderData, setServiceProviderData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch service provider data whenever catererData changes
  useEffect(() => {
    // CRITICAL FIX: Check if catererData is NOT null before accessing properties
    if (!catererData || !catererData.vendorUserId) return;

    const getServiceProviderData = async (catererData: CatererMasterSchemaType) => {
      try {
        const response = await axios.get(
          `/api/routes/serviceProviderMaster/${catererData.vendorUserId}`
        );
        setServiceProviderData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getServiceProviderData(catererData);
  }, [catererData]);

  // Fetch caterer data whenever catererId changes
  useEffect(() => {
    if (!catererId) return;

    const getVendorData = async () => {
      try {
        const response = await axios.get(`/api/routes/catererMaster/${catererId}`);
        // Ensure the response data is cast to the correct type
        setCatererData(response.data[0] as CatererMasterSchemaType);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getVendorData();
  }, [catererId]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div>
      <Navbar />
      <div>
        <div>
          <div>
            <VendorDescription vendorType="CATERER" vendorData={""} />
            <AboutHall /> {/* You might want a Caterer-specific About component here */}
          </div>
          <div>
            <AdditionalOtherVendorDetails otherVendorData={null} />
          </div>
        </div>
        <Gallery />
        <HallInformation /> {/* You might want a Caterer-specific Information component here */}
        <VenueSummary /> {/* You might want a Caterer-specific Summary component here */}
        <Testimonials />
        <Location />
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default CatererDescriptionPage;