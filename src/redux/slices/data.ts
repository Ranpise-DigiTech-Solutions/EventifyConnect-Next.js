// // slices/userInfoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  countries: {
    data: [],
    loading: false,
    error: null,
  },
  states: {
    data: [],
    loading: false,
    error: null,
  },
  citiesOfCountry: {
    data: [],
    loading: false,
    error: null,
  },
  citiesOfState: {
    data: [],
    loading: false,
    error: null,
  },
  eventTypes: {
    data: [],
    loading: false,
    error: null,
  },
  vendorTypes: {
    data: [],
    loading: false,
    error: null,
  },
};

// Define the slice with initial state and reducers
const userInfoSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    // Add reducers for countries
    fetchCountriesRequest(state) {
      state.countries.loading = true;
      state.countries.error = null;
    },
    fetchCountriesSuccess(state, action: PayloadAction<any>) {
      state.countries.loading = false;
      state.countries.data = action.payload;
    },
    fetchCountriesFailure(state, action: PayloadAction<any>) {
      state.countries.loading = false;
      state.countries.error = action.payload;
    },

    // Add reducers for states.
    fetchStatesRequest(state) {
      state.states.loading = true;
      state.states.error = null;
    },
    fetchStatesSuccess(state, action: PayloadAction<any>) {
      state.states.loading = false;
      state.states.data = action.payload;
    },
    fetchStatesFailure(state, action: PayloadAction<any>) {
      state.states.loading = false;
      state.states.error = action.payload;
    },

    // Add reducers for cities of a country
    fetchCitiesOfCountryRequest(state) {
      state.citiesOfCountry.loading = true;
      state.citiesOfCountry.error = null;
    },
    fetchCitiesOfCountrySuccess(state, action: PayloadAction<any>) {
      state.citiesOfCountry.loading = false;
      state.citiesOfCountry.data = action.payload;
    },
    fetchCitiesOfCountryFailure(state, action: PayloadAction<any>) {
      state.citiesOfCountry.loading = false;
      state.citiesOfCountry.error = action.payload;
    },

    // Add reducers for cities of a state
    fetchCitiesOfStateRequest(state) {
      state.citiesOfState.loading = true;
      state.citiesOfState.error = null;
    },
    fetchCitiesOfStateSuccess(state, action: PayloadAction<any>) {
      state.citiesOfState.loading = false;
      state.citiesOfState.data = action.payload;
    },
    fetchCitiesOfStateFailure(state, action: PayloadAction<any>) {
      state.citiesOfState.loading = false;
      state.citiesOfState.error = action.payload;
    },

    // Add reducers for event types
    fetchEventTypesRequest(state) {
      state.eventTypes.loading = true;
      state.eventTypes.error = null;
    },
    fetchEventTypesSuccess(state, action: PayloadAction<any>) {
      state.eventTypes.loading = false;
      state.eventTypes.data = action.payload;
    },
    fetchEventTypesFailure(state, action: PayloadAction<any>) {
      state.eventTypes.loading = false;
      state.eventTypes.error = action.payload;
    },

    // Add reducers for event types
    fetchVendorTypesRequest(state) {
      state.vendorTypes.loading = true;
      state.vendorTypes.error = null;
    },
    fetchVendorTypesSuccess(state, action: PayloadAction<any>) {
      state.vendorTypes.loading = false;
      state.vendorTypes.data = action.payload;
    },
    fetchVendorTypesFailure(state, action: PayloadAction<any>) {
      state.vendorTypes.loading = false;
      state.vendorTypes.error = action.payload;
    },
  },
});

export const {
  fetchCountriesRequest,
  fetchCountriesFailure,
  fetchCountriesSuccess,
  fetchStatesFailure,
  fetchStatesRequest,
  fetchStatesSuccess,
  fetchCitiesOfCountryFailure,
  fetchCitiesOfCountryRequest,
  fetchCitiesOfCountrySuccess,
  fetchCitiesOfStateFailure,
  fetchCitiesOfStateRequest,
  fetchCitiesOfStateSuccess,
  fetchEventTypesFailure,
  fetchEventTypesRequest,
  fetchEventTypesSuccess,
  fetchVendorTypesFailure,
  fetchVendorTypesRequest,
  fetchVendorTypesSuccess,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;
