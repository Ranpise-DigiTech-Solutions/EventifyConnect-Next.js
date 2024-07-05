// src/app/store.ts
import { configureStore, ThunkAction, createSlice } from '@reduxjs/toolkit';
import RootReducer from './root-reducer'; // Your combined reducers

// Create store function
export const store = () => configureStore({
  reducer: RootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});