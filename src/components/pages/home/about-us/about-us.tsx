"use client"

import React, { useState } from 'react'
import Image from 'next/image';

import GppGoodIcon from '@mui/icons-material/GppGood';
import CancelIcon from '@mui/icons-material/Cancel';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import styles from './about-us.module.scss';

type Props = {}

const AboutUsComponent = (props: Props) => {
    const [activeButton, setActiveButton] = useState<null | string>(null);

    const handleToggleClass = (btnName: string) => {
      setActiveButton(btnName === activeButton ? null : btnName);
    };
  
    return (
      <div className={styles.aboutus__container} id='aboutUs'>
        <div className={styles.aboutus__wrapper}>
          <div className={styles.sub__wrapper_1}>
            <Image src={"/images/wedding4.jpg"} alt="" height={550} width={450} />
          </div>
          <div className={styles.sub__wrapper_2}>
            <h3 className={styles.sub_title}>our value</h3>
            <h2 className={styles.title}>value we give you</h2>
            <p className={styles.description}>Experience seamless event planning with us! As part of Ranpise DigiTech, our platform offers a wide array of event halls and services worldwide. Navigate effortlessly through venues and vendors, ensuring every detail meets your requirements. From selecting venues based on location, rating, and capacity to hassle-free bookings, we simplify the process. Engage with our modern chatbot for instant assistance and explore vendors with ease. Elevate your event planning journey with us today!</p>
            <div className={styles.wrapper}>
              <div className={`${styles.content} ${activeButton === 'btn_1' ? styles.open : styles.closed}`}>
                <div className={styles.header}>
                  <GppGoodIcon className={styles.icon}/>
                  <h4>Seamless User Experience</h4>
                  <button onClick={() => handleToggleClass('btn_1')} title='btn1'>
                    <ArrowDropDownIcon className={`${styles.icon} ${styles.pointy}`}/>
                  </button>
                </div>
                <p>Immerse yourself in an interface crafted for ease and elegance, where every click feels like a step closer to your dream event.</p>
              </div>
              <div className={`${styles.content} ${activeButton === 'btn_2' ? styles.open : styles.closed}`}>
                <div className={styles.header}>
                  <CancelIcon className={styles.icon}/>
                  <h4>Hassle Free Bookings</h4>
                  <button onClick={() => handleToggleClass('btn_2')} title='btn2'>
                    <ArrowDropDownIcon className={`${styles.icon} ${styles.pointy}`}/>
                  </button>
                </div>
                <p>Navigate effortlessly through our platform, where simplicity meets efficiency, making your booking experience a stress-free affair.</p>
              </div>
              <div className={`${styles.content} ${activeButton === 'btn_3' ? styles.open : styles.closed}`}>
                <div className={styles.header}>
                  <CampaignIcon className={styles.icon}/>
                  <h4>Clear communication on event details</h4>
                  <button onClick={() => handleToggleClass('btn_3')} title='btn3'>
                    <ArrowDropDownIcon className={`${styles.icon} ${styles.pointy}`}/>
                  </button>
                </div>
                <p>Experience transparent communication at its finest, ensuring every detail of your event is conveyed with clarity and precision, leaving no room for confusion or uncertainty.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default AboutUsComponent