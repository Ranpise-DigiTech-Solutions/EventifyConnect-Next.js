
"use client"

import React, { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks';

import { fetchCountries, fetchVendorTypes, fetchEventTypes, fetchCitiesOfCountry } from '@/redux/thunks/data';
import { Footer } from '@/components/global'

const SiteLayout = ({ children } : { children: React.ReactNode }) => {

  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const fetchData = () => {
        dispatch(fetchCitiesOfCountry({countryName: "India"}));
        dispatch(fetchEventTypes());
        dispatch(fetchVendorTypes());
        dispatch(fetchCountries());
      };
      fetchData();
    } catch (error : any) {
      console.error("Couldn't fetch data :- ", error.message);
    }
  }, [dispatch]);

  return (
    <main>
        {children}
        <Footer/>
    </main>
  )
}

export default SiteLayout
