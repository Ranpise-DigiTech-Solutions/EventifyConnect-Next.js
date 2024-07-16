"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { LoadingScreen } from "@/components/sub-components";

import {
  fetchCountries,
  fetchVendorTypes,
  fetchEventTypes,
  fetchCitiesOfCountry,
} from "@/redux/thunks/data";
import { Footer, Navbar } from "@/components/global";

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const fetchData = () => {
        dispatch(fetchCitiesOfCountry({ countryName: "India" }));
        dispatch(fetchEventTypes());
        dispatch(fetchVendorTypes());
        dispatch(fetchCountries());
      };
      fetchData();
    } catch (error: any) {
      console.error("Couldn't fetch data :- ", error.message);
    }
  }, [dispatch]);

  if(isLoading) return <LoadingScreen />;

  return (
    <main>
      <Navbar setIsLoading={setIsLoading}/>
      {children}
      <Footer />
    </main>
  );
};

export default SiteLayout;
