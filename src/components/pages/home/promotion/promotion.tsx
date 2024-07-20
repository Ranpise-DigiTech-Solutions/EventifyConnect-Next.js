"use client";

import React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "react-spring";
import axios, { AxiosResponse } from "axios";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import Button from "@mui/material/Button";

import { NavigationDots } from "@/components/sub-components";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/use-redux-store";

import VirtualizedSelect from "@/components/ui/virtualized-select";
import { setSearchBoxFilterData } from "@/redux/slices/search-box-filter";
import { RootState } from "@/redux/store";

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import styles from "./promotion.module.scss";

const totalCountTemplate = {
  hallVendors: 0,
  otherServiceProviders: 0,
  customers: 0,
  bookings: 0,
};

type TotalCountKey = keyof typeof totalCountTemplate;

function Number({ n }: { n: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: n,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  return <animated.div>{number.to((n) => n.toFixed(0))}</animated.div>;
}

type Props = {};

const Promotion = (props: Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState({ ...totalCountTemplate });

  const dispatch = useAppDispatch();
  const searchBoxFilterStore = useAppSelector(
    (state: RootState) => state.searchBoxFilter
  );
  const data = useAppSelector((state: RootState) => state.dataInfo);

  const handleTotalCount = (key: TotalCountKey, value: Number) => {
    setTotalCount((previousInfo) => ({
      ...previousInfo,
      [key]: value,
    }));
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "none",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      boxShadow: state.isFocused ? "none" : provided.boxShadow,
      color: "#000000",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      "& svg": {
        display: "none", // Hide the default arrow icon
      },
      padding: 10,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#000000", // Change the placeholder color here
    }),
  };

  const imageList = [
    "/images/wedding0.jpg",
    "/images/wedding1.jpg",
    "/images/wedding2.jpg",
    "/images/wedding3.jpg",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [imageList.length]);

  useEffect(() => {
    if (!executeRecaptcha) {
      return;
    }

    const getHallVendorCount = async () => {
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');
        const URL = `/api/routes/hallMaster/getHallCount/`;
        const response: AxiosResponse<string> = await axios.get(URL, {
          headers: {
            'Content-Type': 'application/json',
            'X-Captcha-Token': captchaToken,
          },
          withCredentials: true // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        if (typeof response.data !== "number") {
          return;
        }

        handleTotalCount("hallVendors", parseInt(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    const getOtherVendorCount = async () => {
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');
        const URL = `/api/routes/vendorMaster/getOtherVendorsCount/`;
        const response: AxiosResponse<string> = await axios.get(URL, {
          headers: {
            'Content-Type': 'application/json',
            'X-Captcha-Token': captchaToken,
          },
          withCredentials: true // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        if (typeof response.data !== "number") {
          return;
        }
        handleTotalCount("otherServiceProviders", parseInt(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    const getCustomerCount = async () => {
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');
        const URL = `/api/routes/customerMaster/getCustomerCount/`;
        const response: AxiosResponse<string> = await axios.get(URL, {
          headers: {
            'Content-Type': 'application/json',
            'X-Captcha-Token': captchaToken,
          },
          withCredentials: true // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        if (typeof response.data !== "number") {
          return;
        }
        handleTotalCount("customers", parseInt(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    const getBookingCount = async () => {
      try {
        const captchaToken = await executeRecaptcha('inquirySubmit');
        const URL = `/api/routes/bookingMaster/getBookingCount/`;
        const response: AxiosResponse<string> = await axios.get(URL, {
          headers: {
            'Content-Type': 'application/json',
            'X-Captcha-Token': captchaToken,
          },
          withCredentials: true // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        if (typeof response.data !== "number") {
          return;
        }
        handleTotalCount("bookings", parseInt(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    getBookingCount();
    getHallVendorCount();
    getOtherVendorCount();
    getCustomerCount();
  }, [executeRecaptcha]);

  return (
    <div className={`${styles.main__container} ${styles.promotion__container}`}>
      <div className={styles.app__container}>
        <div className={styles.white__gradient}></div>
        <div className={styles.sub__wrapper_1}>
          <div className={styles.title__wrapper}>
            <motion.div
              whileInView={{ scale: [0, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={styles.overlay_circle}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={styles.heading_title}
            >
              Effortless <br /> Event Planning
              <br /> at Fingertips
            </motion.h2>
          </div>
          <div className={styles.description__wrapper}>
            <p>
              Discover your dream wedding with our enchanting website.
              <br /> Plan every detail and share the magic with loved ones.
            </p>
          </div>
          <div className={styles.searchBar__wrapper}>
            <a href="#" className={styles.location_icon} title="locationIcon">
              <LocationOnIcon />
            </a>
            <div className={styles.input}>
              <VirtualizedSelect
                id={"cityName"}
                customStyles={customStyles}
                options={
                  Array.isArray(data.citiesOfCountry.data)
                    ? data.citiesOfCountry.data.map((city: any) => ({
                        value: city,
                        label: city,
                      }))
                    : null
                }
                value={
                  searchBoxFilterStore.cityName
                    ? {
                        label: searchBoxFilterStore.cityName,
                        value: searchBoxFilterStore.cityName,
                      }
                    : null
                }
                onChange={(selectedOption: any) => {
                  dispatch(
                    setSearchBoxFilterData({
                      key: "cityName",
                      value: selectedOption.value,
                    })
                  ); // Update Details in 'SearchBoxFilter' Redux Store
                }}
                placeholder="Select or type a city..."
                dropDownIndicator={false}
              />
            </div>
            <Button variant="contained" className={styles.button}>
              <a href="#searchBar">Search</a>
            </Button>
          </div>
          <div className={styles.views__wrapper}>
            <div className={styles.item}>
              <div className={styles.count}>
                <Number n={totalCount.hallVendors} />
                &nbsp; <span>+</span>
              </div>
              <p className={styles.desc}>Hall Vendors</p>
            </div>
            <div className={styles.item}>
              <div className={styles.count}>
                <Number n={totalCount.otherServiceProviders} />
                &nbsp; <span>+</span>
              </div>
              <p className={styles.desc}>Service Providers</p>
            </div>
            <div className={styles.item}>
              <div className={styles.count}>
                <Number n={totalCount.customers} />
                &nbsp; <span>+</span>
              </div>
              <p className={styles.desc}>Happy Customer</p>
            </div>
            <div className={styles.item}>
              <div className={styles.count}>
                <Number n={totalCount.bookings} />
                &nbsp; <span>+</span>
              </div>
              <p className={styles.desc}>Bookings Done</p>
            </div>
          </div>
        </div>
        <div className={styles.sub__wrapper_2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className={styles["image-container"]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img src={imageList[currentImageIndex]} alt="" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className={styles.navigation__dots}>
        <NavigationDots
          active={currentImageIndex}
          imageList={imageList}
          className={styles["app__navigation-dot"]}
        />
      </div>
    </div>
  );
};

export default Promotion;
