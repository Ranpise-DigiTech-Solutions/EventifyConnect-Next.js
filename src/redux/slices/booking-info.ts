// // slices/userInfoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
    bookingStartDate: "",  // yyyy-mm-dd
    bookingStartDay: "", // Monday, Tuesday  etc..
    bookingEndDate: "", // yyyy-mm-dd
    bookingEndDay: "", // Monday, Tuesday  etc..
    startTime: "",  // HH:MM
    endTime: "",  // HH:MM
    bookingDuration: "", // HH:MM
    errorInfo: "",  // to display error messages
    comments: "", // to display success messages
};

// Define the slice with initial state and reducers
const userInfoSlice = createSlice({
    name: 'bookingInfo',
    initialState,
    reducers: {
      setData(state, action: PayloadAction<{ key: any; value: any }>) {
        state[action.payload.key] = action.payload.value;
      },
    },
  });

export const { setData } = userInfoSlice.actions;

export default userInfoSlice.reducer;