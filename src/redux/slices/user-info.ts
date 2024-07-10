// // slices/userInfoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface UserInfoState {
//   userLocation: string;
//   userDetails: Record<string, any>;
//   userAuthStateChangeFlag: boolean;
//   userDataUpdateFlag: boolean;
// }

const initialState: any = {
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
      setUserInfoData(state, action: PayloadAction<{ key: any; value: any }>) {
        state[action.payload.key] = action.payload.value;
      },
      toggleUserAuthStateChangeFlag(state) {
        state.userAuthStateChangeFlag = !state.userAuthStateChangeFlag;
      },
      toggleUserDataUpdateFlag(state) {
        state.userDataUpdateFlag = !state.userDataUpdateFlag;
      },
    },
  });

export const { setUserInfoData, toggleUserAuthStateChangeFlag, toggleUserDataUpdateFlag } = userInfoSlice.actions;

export default userInfoSlice.reducer;