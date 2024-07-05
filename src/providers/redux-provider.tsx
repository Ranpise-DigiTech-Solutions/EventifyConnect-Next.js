"use client"

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store'; // Adjust path based on your store location

interface Props {
  children: ReactNode;
}

const ReduxProvider = ({ children }: Props) => {
    const reduxStore = store();
  return (
    <Provider store={reduxStore}>
      {children}
    </Provider>
  );
};

export default ReduxProvider;
