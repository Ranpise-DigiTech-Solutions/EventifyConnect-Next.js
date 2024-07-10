import React from "react";
import styles from './loading-screen.module.scss';

type Props = {};

const LoadingScreenSubComponent = (props: Props) => {
  return (
    <div className={styles.loadingScreen__container}>
      <div className={styles.overlay}></div>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingScreenSubComponent;
