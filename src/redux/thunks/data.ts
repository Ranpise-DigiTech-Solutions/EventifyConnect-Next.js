// import { createAsyncThunk } from "@reduxjs/toolkit";
import { Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
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
} from "@/redux/slices/data";

export const fetchCountries = () => async (dispatch: Dispatch) => {
  dispatch(fetchCountriesRequest());
  try {
    const response = await axios.get(`/api/routes/countriesNow/getCountries/`);
    dispatch(fetchCountriesSuccess(response.data));
  } catch (error: any) {
    dispatch(
      fetchCountriesFailure(`Error fetching countries: ${error.message}`)
    );
  }
};

export const fetchStates = (countryName : String) => async (dispatch : Dispatch) => {
  dispatch(fetchStatesRequest());
  try {
    const response = await axios.get(
      `/api/routes/countriesNow/getStates/?countryName=${countryName}`
    );
    dispatch(fetchStatesSuccess(response.data));
  } catch (error : any) {
    dispatch(fetchStatesFailure(`Error fetching states: ${error.message}`));
  }
};

export const fetchCitiesOfCountry = (countryName: String) => async (dispatch : Dispatch) => {
  dispatch(fetchCitiesOfCountryRequest());
  try {
    const response = await axios.get(
      `/api/routes/countriesNow/getCitiesOfCountry/?countryName=${countryName}`
    );
    dispatch(fetchCitiesOfCountrySuccess(response.data));
  } catch (error : any) {
    dispatch(
      fetchCitiesOfCountryFailure(`Error fetching cities: ${error.message}`)
    );
  }
};

export const fetchCitiesOfState =
  (countryName : String, stateName : String) => async (dispatch : Dispatch) => {
    dispatch(fetchCitiesOfStateRequest());
    try {
      const response = await axios.get(
        `/api/routes/countriesNow/getCitiesOfState/?countryName=${countryName}&stateName=${stateName}`
      );
      dispatch(fetchCitiesOfStateSuccess(response.data));
    } catch (error : any) {
      dispatch(
        fetchCitiesOfStateFailure(`Error fetching cities: ${error.message}`)
      );
    }
  };

export const fetchEventTypes = () => async (dispatch : Dispatch) => {
  dispatch(fetchEventTypesRequest());
  try {
    const response = await axios.get(`/api/routes/eventTypes/`);
    dispatch(fetchEventTypesSuccess(response.data));
  } catch (error : any) {
    dispatch(
      fetchEventTypesFailure(`Error fetching event types: ${error.message}`)
    );
  }
};

export const fetchVendorTypes = () => async (dispatch : Dispatch) => {
  dispatch(fetchVendorTypesRequest());
  try {
    const response = await axios.get(`/api/routes/vendorTypes/`);
    dispatch(fetchVendorTypesSuccess(response.data));
  } catch (error : any) {
    dispatch(
      fetchVendorTypesFailure(`Error fetching vendor types: ${error.message}`)
    );
  }
};
