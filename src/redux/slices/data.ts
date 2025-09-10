// src/redux/slices/data.ts
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCountries,
  fetchStates,
  fetchCitiesOfCountry,
  fetchCitiesOfState,
  fetchEventTypes,
  fetchVendorTypes,
} from '../thunks/data';

// Define the initial state for the data slice
const initialState: any = {
  countries: { data: [], loading: false, error: null },
  states: { data: [], loading: false, error: null },
  citiesOfCountry: { data: [], loading: false, error: null },
  citiesOfState: { data: [], loading: false, error: null },
  eventTypes: { data: [], loading: false, error: null },
  vendorTypes: { data: [], loading: false, error: null },
};

const dataSlice = createSlice({
  name: 'dataInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // --- Reducers for fetchCountries ---
    builder.addCase(fetchCountries.pending, (state) => {
      state.countries.loading = true;
      state.countries.error = null;
    });
    builder.addCase(fetchCountries.fulfilled, (state, action) => {
      state.countries.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.countries.data = action.payload; 
    });
    builder.addCase(fetchCountries.rejected, (state, action) => {
      state.countries.loading = false;
      state.countries.error = action.error.message;
    });

    // --- Reducers for fetchStates ---
    builder.addCase(fetchStates.pending, (state) => {
      state.states.loading = true;
      state.states.error = null;
    });
    builder.addCase(fetchStates.fulfilled, (state, action) => {
      state.states.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.states.data = action.payload;
    });
    builder.addCase(fetchStates.rejected, (state, action) => {
      state.states.loading = false;
      state.states.error = action.error.message;
    });
    
    // --- Reducers for fetchCitiesOfCountry ---
    builder.addCase(fetchCitiesOfCountry.pending, (state) => {
      state.citiesOfCountry.loading = true;
      state.citiesOfCountry.error = null;
    });
    builder.addCase(fetchCitiesOfCountry.fulfilled, (state, action) => {
      state.citiesOfCountry.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.citiesOfCountry.data = action.payload;
    });
    builder.addCase(fetchCitiesOfCountry.rejected, (state, action) => {
      state.citiesOfCountry.loading = false;
      state.citiesOfCountry.error = action.error.message;
    });

    // --- Reducers for fetchCitiesOfState ---
    builder.addCase(fetchCitiesOfState.pending, (state) => {
      state.citiesOfState.loading = true;
      state.citiesOfState.error = null;
    });
    builder.addCase(fetchCitiesOfState.fulfilled, (state, action) => {
      state.citiesOfState.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.citiesOfState.data = action.payload;
    });
    builder.addCase(fetchCitiesOfState.rejected, (state, action) => {
      state.citiesOfState.loading = false;
      state.citiesOfState.error = action.error.message;
    });

    // --- Reducers for fetchEventTypes ---
    builder.addCase(fetchEventTypes.pending, (state) => {
      state.eventTypes.loading = true;
      state.eventTypes.error = null;
    });
    builder.addCase(fetchEventTypes.fulfilled, (state, action) => {
      state.eventTypes.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.eventTypes.data = action.payload;
    });
    builder.addCase(fetchEventTypes.rejected, (state, action) => {
      state.eventTypes.loading = false;
      state.eventTypes.error = action.error.message;
    });

    // --- Reducers for fetchVendorTypes ---
    builder.addCase(fetchVendorTypes.pending, (state) => {
      state.vendorTypes.loading = true;
      state.vendorTypes.error = null;
    });
    builder.addCase(fetchVendorTypes.fulfilled, (state, action) => {
      state.vendorTypes.loading = false;
      // ⚠ CORRECTED: Assign action.payload directly
      state.vendorTypes.data = action.payload;
    });
    builder.addCase(fetchVendorTypes.rejected, (state, action) => {
      state.vendorTypes.loading = false;
      state.vendorTypes.error = action.error.message;
    });
  },
});

export default dataSlice.reducer;