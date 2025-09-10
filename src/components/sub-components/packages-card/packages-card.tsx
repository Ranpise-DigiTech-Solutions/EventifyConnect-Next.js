/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Popover } from "antd";

import Tooltip from "@mui/material/Tooltip";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import HotelIcon from "@mui/icons-material/Hotel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FaCrown } from "react-icons/fa";
import PropTypes from "prop-types";
import Carousel from "react-multi-carousel";
import { motion } from "framer-motion";

import { NavigationDots } from "..";
import styles from "./packages-card.module.scss";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/db/firebase";
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import Image from "next/image";

type Props = {
  vendorType: string;
  card: {
    _id: string;
    vendorImages: string[];
    [key: string]: any; // Allow any other properties
  };
  containerStyles?: {
    width: number;
    height: number;
  };
};

const PackagesCardSubComponent = ({
  vendorType,
  card,
  containerStyles = { width: 400, height: 500 },
}: Props) => {
  const [animateCalanderIcon, setAnimateCalenderIcon] = useState({
    x: 0,
    opacity: 0,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // State to track if the package is a favorite
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); //user login status

  const userInfoStore = useAppSelector((state) => state.userInfo);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % card.vendorImages.length
      );
    }, 4000);

    return () => clearInterval(intervalId);
  }, [card.vendorImages]);

  //check user login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      try {
        if (currentUser) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userInfoStore.userAuthStateChangeFlag]);

  useEffect(() => {
    // Check if the package is already marked as favorite in local storage on component mount
    const favorites = localStorage.getItem("favorites");
    const storedFavorites = favorites ? JSON.parse(favorites) : [];
    setIsFavorite(storedFavorites.includes(card._id));
  }, [card._id]);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite); // Toggle the favorite state
    updateLocalStorage(!isFavorite); // Update local storage
  };

  const updateLocalStorage = (addFavorite: boolean) => {
    // Update local storage with the current list of favorite items
    let fav = localStorage.getItem("favorites");
    let favorites = fav ? JSON.parse(fav) : [];
    if (addFavorite) {
      favorites.push(card._id);
    } else {
      favorites = favorites.filter((id: any) => id !== card._id);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const hallVendorTagListContent = (
    <ol>
      <li>Outdoor facility</li>
      <li>Garden facility</li>
      <li>Pool side</li>
      <li>Accessibility Options (Wheelchair access, lifts)</li>
      <li>CCTV Surveillance</li>
      <li>First Aid Availability</li>
      <li>Customizable Setup (Seating arrangement, Mandap)</li>
    </ol>
  );

  const photographerTagListContent = (
    <ol>
      <li>Event Coverage (Weddings, Corporate Events, Parties)</li>
      <li>Pre-Wedding Photoshoots</li>
      <li>Portrait Photography</li>
      <li>Drone Photography & Videography</li>
      <li>Photo Editing & Retouching Services</li>
      <li>On-Site Printing Options</li>
      <li>High-Resolution Images & Albums</li>
    </ol>
  );

  return (
    <div
      className={styles.packagesCardBox__wrapper}
      style={{
        height: containerStyles.height + "px",
        width: containerStyles.width + "px",
      }}
    >
      {/* Favorite heart icon */}
      <div
        className={styles["favorite-icon-container"]}
        onClick={handleFavoriteClick}
      >
        <Tooltip
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          placement="top"
        >
          <FavoriteIcon
            className={
              isFavorite
                ? `${styles["favorite-icon"]} ${styles.active}`
                : `${styles["favorite-icon"]}`
            }
          />
        </Tooltip>
      </div>
      <div className={styles.image__wrapper}>
        {card.vendorImages && (
          <Carousel
            responsive={responsive}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
            swipeable={true}
            draggable={false}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={4000}
            keyBoardControl={false}
            slidesToSlide={1}
            arrows={false}
            containerClass="carousel-container"
          >
            {card.vendorImages.map((image: string, index: number) => (
              <img
                src={image}
                key={index}
                alt="Img"
                style={{ height: `${Math.ceil(containerStyles.height / 2)}px` }}
              />
            ))}
          </Carousel>
        )}
        <div className={styles.image__contents}>
          <div className={styles.header}>
            <div className={styles.wrapper}>
              <FaCrown className={styles.icon} />
              <p>Hand Picked</p>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles["calendar-icon"]}>
              <button
                title="icon"
                onMouseEnter={() =>
                  setAnimateCalenderIcon({ x: 10, opacity: 1 })
                }
                onMouseLeave={() =>
                  setAnimateCalenderIcon({ x: 0, opacity: 0 })
                }
              >
                <CalendarMonthOutlinedIcon className={styles.icon} />
              </button>
              <motion.span
                animate={animateCalanderIcon}
                transition={{ duration: 0.5, delayChildren: 0.5 }}
                className={styles.text}
              >
                Check time slots
              </motion.span>
            </div>
            <NavigationDots
              active={currentImageIndex}
              imageList={card.vendorImages}
              className={styles["packageCard__navigation-dot"]}
            />
            <Tooltip title={card.vendorDescription} placement="top" arrow>
              <InfoOutlinedIcon className={styles.icon} />
            </Tooltip>
          </div>
        </div>
      </div>
      <div className={styles.contents__wrapper}>
        <div className={`${styles.wrapper} ${styles.wrapper_1}`}>
          <h2>{card.companyName}</h2>
          <div className={styles.ratings}>
            <div className={styles.rating}>
              <p>4.9</p>
              <StarIcon className={styles.starIcon} />
            </div>
            <div className={styles.reviews}>
              (2 <span>&nbsp;Reviews</span>)
            </div>
          </div>
        </div>
        {vendorType === "Banquet Hall" ? (
          <>
            <div className={styles.quickinfo}>
              <div className={styles.info}>
                <h6>VEG</h6>
                <div className={styles.price}>
                  <CurrencyRupeeIcon className={styles.icon} />
                  <p>{card.hallVegRate}</p>
                </div>
              </div>
              <div className={styles.info}>
                <h6>NON-VEG</h6>
                <div className={styles.price}>
                  <CurrencyRupeeIcon className={styles.icon} />
                  <p>{card.hallNonVegRate}</p>
                </div>
              </div>
              <div className={`${styles.info} ${styles["other-info"]}`}>
                <PeopleAltIcon className={styles.icon} />
                <p>{card.hallCapacity}</p>
              </div>
              <div className={`${styles.info} ${styles["other-info"]}`}>
                <HotelIcon className={styles.icon} />
                <p>{card.hallRooms}</p>
              </div>
            </div>
            <div className={styles.tag__list}>
              <div className={styles.tag}>
                <p>Parking: {card.hallParking ? "A" : "UA"}</p>
              </div>
              <div className={styles.tag}>
                <p>Freez: {card.hallFreezDay}</p>
              </div>
              <Popover content={hallVendorTagListContent} title="Features">
                <div className={styles.link}>
                  <p>+3 more</p>
                </div>
              </Popover>
            </div>
            <div className={styles.availability__statustag}>
              {isUserLoggedIn ? (
                <div
                  className={`${styles["availability-tag"]} ${
                    card.availability === "LIMITED AVAILABILITY"
                      ? styles.LIMITED_AVAILABILITY
                      : styles[card.availability || ""]
                  }`}
                >
                  <span className={styles["left-cut"]}></span>
                  <div className={styles.status}>
                    {card.availability}
                    <Tooltip
                      title="This Hall is not available on this date. Kindly Change the Date or Choose a different hall"
                      placement="top"
                      arrow
                    >
                      <AccessAlarmIcon className={styles.icon} />
                    </Tooltip>
                  </div>
                  <span className={styles["right-cut"]}></span>
                </div>
              ) : (
                <div
                  className={`${styles["availability-tag"]} ${styles.DISABLED}`}
                >
                  <span className={styles["left-cut"]}></span>
                  <div className={styles.status}>
                    {"Login to view"}
                    <Tooltip
                      title="Please Login or Register to view the availability status of this hall."
                      placement="top"
                      arrow
                    >
                      <AccessAlarmIcon className={styles.icon} />
                    </Tooltip>
                  </div>
                  <span className={styles["right-cut"]}></span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.quickinfo}>
              <div className={styles.info}>
                <h6>EVENT COVERAGE</h6>
                <div className={styles.price}>
                  <CurrencyRupeeIcon className={styles.icon} />
                  <p>15000</p> {/* Hardcoded rate for event coverage */}
                </div>
              </div>
              <div className={styles.info}>
                <h6>PORTRAIT SESSION</h6>
                <div className={styles.price}>
                  <CurrencyRupeeIcon className={styles.icon} />
                  <p>5000</p> {/* Hardcoded rate for portrait session */}
                </div>
              </div>
              
            </div>

            <div className={styles.tag__list}>
              <div className={styles.tag}>
                <p>Avg Booking: 1200</p>
              </div>
              <div className={styles.tag}>
                <p>On Time Service: 25 votes</p>
              </div>
              <Popover content={photographerTagListContent} title="Features">
                <div className={styles.link}>
                  <p>+3 more</p>
                </div>
              </Popover>
            </div>
          </>
        )}
        <div className={`${styles.wrapper} ${styles.wrapper_2}`}>
          <div className={styles.sub__wrapper}>
            <LocationOnIcon className={styles.icon} />
            <p>{card.companyCity}</p>
          </div>
          <div className={styles.sub__wrapper}>
            <AccountBalanceIcon className={styles.icon} />
            <p>{vendorType}</p>
          </div>
        </div>
      </div>
    </div>
    // </Link>
  );
};

export default PackagesCardSubComponent;
