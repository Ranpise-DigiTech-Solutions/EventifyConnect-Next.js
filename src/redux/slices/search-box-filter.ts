// // slices/userInfoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
    cityName: "",
    bookingDate: "",
    eventType: "",
    eventId: "",
    vendorType: "Banquet Hall",
    vendorTypeId: ""
};

// Define the slice with initial state and reducers
const userInfoSlice = createSlice({
    name: 'searchBoxFilter',
    initialState,
    reducers: {
      setSearchBoxFilterData(state, action: PayloadAction<{ key: any; value: any }>) {
        state[action.payload.key] = action.payload.value;
      },
    },
  });

export const { setSearchBoxFilterData } = userInfoSlice.actions;

export default userInfoSlice.reducer;