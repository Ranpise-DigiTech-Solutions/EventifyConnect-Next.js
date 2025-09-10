"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, store } from "@/redux/store";

interface Props {
  children: ReactNode;
}

const ReduxProvider = ({ children }: Props) => {
  // Initialize storeRef.current only once. The '??=' operator is a
  // concise way to do this.
  const storeRef = useRef<AppStore>();
  storeRef.current ??= store();
  
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ReduxProvider;