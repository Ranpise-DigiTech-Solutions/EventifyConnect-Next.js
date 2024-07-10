import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  fetchCountriesRequest,
  fetchCountriesSuccess,
  fetchCountriesFailure,
  fetchStatesRequest,
  fetchStatesSuccess,
  fetchStatesFailure,
  fetchCitiesOfCountryRequest,
  fetchCitiesOfCountrySuccess,
  fetchCitiesOfCountryFailure,
  fetchCitiesOfStateRequest,
  fetchCitiesOfStateSuccess,
  fetchCitiesOfStateFailure,
  fetchEventTypesRequest,
  fetchEventTypesSuccess,
  fetchEventTypesFailure,
  fetchVendorTypesRequest,
  fetchVendorTypesSuccess,
  fetchVendorTypesFailure,
} from '@/redux/slices/data';

export const fetchCountries = createAsyncThunk(
  'userInfo/fetchCountries',
  async (_, { dispatch }) => {
    dispatch(fetchCountriesRequest());
    try {
      const response = await axios.get('/api/routes/countriesNow/getCountries/');
      dispatch(fetchCountriesSuccess(response.data));
    } catch (error: any) {
      dispatch(fetchCountriesFailure(`Error fetching countries: ${error.message}`));
    }
  }
);

export const fetchStates = createAsyncThunk(
  'userInfo/fetchStates',
  async ({ countryName }: { countryName: string }, { dispatch }) => {
    dispatch(fetchStatesRequest());
    try {
      const response = await axios.get(`/api/routes/countriesNow/getStates/?countryName=${countryName}`);
      dispatch(fetchStatesSuccess(response.data));
    } catch (error: any) {
      dispatch(fetchStatesFailure(`Error fetching states: ${error.message}`));
    }
  }
);

export const fetchCitiesOfCountry = createAsyncThunk(
  'userInfo/fetchCitiesOfCountry',
  async ({ countryName }: { countryName: string }, { dispatch }) => {
    dispatch(fetchCitiesOfCountryRequest());
    try {
      const response = await axios.get(`/api/routes/countriesNow/getCitiesOfCountry/?countryName=${countryName}`);
      dispatch(fetchCitiesOfCountrySuccess(response.data));
    } catch (error: any) {
      dispatch(fetchCitiesOfCountryFailure(`Error fetching cities: ${error.message}`));
    }
  }
);

export const fetchCitiesOfState = createAsyncThunk(
  'userInfo/fetchCitiesOfState',
  async ({ countryName, stateName }: { countryName: string; stateName: string }, { dispatch }) => {
    dispatch(fetchCitiesOfStateRequest());
    try {
      const response = await axios.get(`/api/routes/countriesNow/getCitiesOfState/?countryName=${countryName}&stateName=${stateName}`);
      dispatch(fetchCitiesOfStateSuccess(response.data));
    } catch (error: any) {
      dispatch(fetchCitiesOfStateFailure(`Error fetching cities: ${error.message}`));
    }
  }
);

export const fetchEventTypes = createAsyncThunk(
  'userInfo/fetchEventTypes',
  async (_, { dispatch }) => {
    dispatch(fetchEventTypesRequest());
    try {
      const response = await axios.get('/api/routes/eventTypes/');
      dispatch(fetchEventTypesSuccess(response.data));
    } catch (error: any) {
      dispatch(fetchEventTypesFailure(`Error fetching event types: ${error.message}`));
    }
  }
);

export const fetchVendorTypes = createAsyncThunk(
  'userInfo/fetchVendorTypes',
  async (_, { dispatch }) => {
    dispatch(fetchVendorTypesRequest());
    try {
      const response = await axios.get('/api/routes/vendorTypes/');
      dispatch(fetchVendorTypesSuccess(response.data));
    } catch (error: any) {
      dispatch(fetchVendorTypesFailure(`Error fetching vendor types: ${error.message}`));
    }
  }
);
