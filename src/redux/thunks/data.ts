import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCountries = createAsyncThunk(
  'data/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/routes/countriesNow/getCountries/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching countries: ${error.message}`);
    }
  }
);

export const fetchStates = createAsyncThunk(
  'data/fetchStates',
  async ({ countryName }: { countryName: string }, { rejectWithValue }) => {
    try {
      const URL = '/api/routes/countriesNow/getStates';
      // ✅ Corrected: Use axios.post and send data in the body
      const response = await axios.post(URL, { countryName });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching states: ${error.message}`);
    }
  }
);

export const fetchCitiesOfCountry = createAsyncThunk(
  'data/fetchCitiesOfCountry',
  async ({ countryName }: { countryName: string }, { rejectWithValue }) => {
    try {
      const URL = '/api/routes/countriesNow/getCitiesOfCountry';
      
      // ✅ This is the crucial change: Use axios.post and pass the data in the body.
      const response = await axios.post(URL, { countryName });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching cities: ${error.message}`);
    }
  }
);
export const fetchCitiesOfState = createAsyncThunk(
  'data/fetchCitiesOfState',
  async ({ countryName, stateName }: { countryName: string; stateName: string }, { rejectWithValue }) => {
    try {
      const URL = '/api/routes/countriesNow/getCitiesOfState';
      // ✅ Corrected to use POST method
      const response = await axios.post(URL, { countryName, stateName });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching cities: ${error.message}`);
    }
  }
);

export const fetchEventTypes = createAsyncThunk(
  'data/fetchEventTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/routes/eventTypes/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching event types: ${error.message}`);
    }
  }
);

export const fetchVendorTypes = createAsyncThunk(
  'data/fetchVendorTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/routes/vendorTypes/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error fetching vendor types: ${error.message}`);
    }
  }
);