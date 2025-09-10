"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks/use-redux-store";
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
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        await Promise.all([
          dispatch(fetchCitiesOfCountry({ countryName: "India" })),
          dispatch(fetchEventTypes()),
          dispatch(fetchVendorTypes()),
          dispatch(fetchCountries()),
        ]);
      } catch (error) {
        console.error("Couldn't fetch data: ", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isLoading) return <LoadingScreen />;

  return (
    <main>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};

export default SiteLayout;