// src/components/layouts/CatererDescriptionLayout.tsx

"use client";

import React, { Suspense, useEffect } from 'react'
import { useAppDispatch } from "@/lib/hooks/use-redux-store";
import {
  fetchCountries,
  fetchVendorTypes,
  fetchEventTypes,
  fetchCitiesOfCountry,
} from "@/redux/thunks/data";

type Props = {
    children: React.ReactNode
}

const CatererDescriptionLayout = ({ children }: Props) => {
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
  
  return (
    <main className='min-h-screen'>
       <Suspense fallback={<div>Loading...</div>}>
       {children}
       </Suspense>
    </main>
  )
}

export default CatererDescriptionLayout;