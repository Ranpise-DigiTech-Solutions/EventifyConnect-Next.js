"use client";

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks/use-redux-store';
import {
  fetchEventTypes,
  fetchVendorTypes,
  fetchCitiesOfCountry, // ⬅️ Keep the import here
} from '@/redux/thunks/data';

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // All initial data fetching should happen here, only once
    dispatch(fetchEventTypes());
    dispatch(fetchVendorTypes());
    dispatch(fetchCitiesOfCountry({ countryName: 'India' }));
  }, [dispatch]);

  return (
    <>
      {children}
    </>
  );
};

export default AppWrapper;