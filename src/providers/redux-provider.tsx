"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { store, AppStore } from "@/redux/store"; // Adjust path based on your store location

interface Props {
  children: ReactNode;
}

const ReduxProvider = ({ children }: Props) => {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = store();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ReduxProvider;
