"use client";

import React, { useEffect, Suspense } from "react";
import { useAppDispatch } from "@/lib/hooks/use-redux-store";

import {
  fetchCountries,
  fetchVendorTypes,
  fetchEventTypes,
  fetchCitiesOfCountry,
} from "@/redux/thunks/data";

const HallDescriptionLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

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

  return <main>
    <Suspense fallback={<div>Loading...</div>}>
    {children}
</Suspense>
    </main>;
};

export default HallDescriptionLayout;
