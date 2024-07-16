import React from "react";

import styles from './about-hall.module.scss';

type Props = {};

const AboutHall = (props: Props) => {
  return (
    <div className={styles.aboutHall__container}>
      <div className={styles['About-container']}>
        <h1>About Hall</h1>
        <hr style={{ width: "80%", color: "#C6E0FF", margin: "1rem 0" }} />
        <p>
          New Horizon Hall, Bejai, Mangalore
          <br />
          <br />
          Standing glorious in the coastal city of Mangaluru, the TMA Pai
          International Convention Centre is one of the largest of its kind in
          India.
          <br />
          <br />
          Partnering with luxurious hospitality services, and accompanied by
          state-of-the-art facilities, the TMA Pai International Convention
          Centre is an extravagant one place stop for all your requirements.
          <br />
          <br />
        </p>
      </div>
    </div>
  );
};

export default AboutHall;
