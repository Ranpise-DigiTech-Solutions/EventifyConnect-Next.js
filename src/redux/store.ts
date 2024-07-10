// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import RootReducer from "./root-reducer"; // Your combined reducers

// Create store function
export const store = () =>
  configureStore({
    reducer: RootReducer,
    devTools: process.env.NODE_ENV !== "production",
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof store>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
