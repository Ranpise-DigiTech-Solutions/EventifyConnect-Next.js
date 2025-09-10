// slices/userInfoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define a strongly typed interface for your state
export interface UserInfoState {
  userLocation: string;
  userDetails: Record<string, any>;
  userAuthStateChangeFlag: boolean;
  userDataUpdateFlag: boolean;
}

const initialState: UserInfoState = {
  userLocation: '',
  userDetails: {},
  userAuthStateChangeFlag: false,
  userDataUpdateFlag: false,
};

// Define the slice with initial state and reducers
const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    // 2. Refactor the generic reducer into specific, type-safe ones
    setUserLocation(state, action: PayloadAction<string>) {
      state.userLocation = action.payload;
    },
    setUserDetails(state, action: PayloadAction<Record<string, any>>) {
      state.userDetails = action.payload;
    },
    toggleUserAuthStateChangeFlag(state) {
      state.userAuthStateChangeFlag = !state.userAuthStateChangeFlag;
    },
    toggleUserDataUpdateFlag(state) {
      state.userDataUpdateFlag = !state.userDataUpdateFlag;
    },
  },
});

export const { setUserLocation, setUserDetails, toggleUserAuthStateChangeFlag, toggleUserDataUpdateFlag } = userInfoSlice.actions;

export default userInfoSlice.reducer;