"use client";

import { Skeleton } from "antd";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";

import { RootState } from "@/redux/store";
import styles from "./packages.module.scss";
import { PackagesCard } from "@/components/sub-components";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { PackagesCardDataType } from "@/lib/types";
import { SortCardsBasedOnAvailability } from "@/lib/utils/functions";

type Props = {};

const PackagesComponent = (props: Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [activeFilter, setActiveFilter] = useState("Available"); // Current Active Filter
  const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 }); // Card Animation when clicked on TAGS
  const [filteredCards, setFilteredCards] = useState<Array<any>>([]); // Filtering cards based on the TAGS..Ex: Most Popular, Top Rated etc..

  const cardsPerPage = 6;
  const [totalCardCount, setTotalCardCount] = useState<number>(0); // set it according to data fetched from database
  const [totalPages, setTotalPages] = useState<number>(0); // set it according to data fetched from database
  const [isLoading, setIsLoading] = useState<boolean>(true); // set it according to data fetched from database

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchBoxFilterStore = useSelector(
    (state: RootState) => state.searchBoxFilter
  ); // searchBoxFilterStore react-redux
  const dataStore = useSelector((state: RootState) => state.dataInfo); // dataStore react-redux

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber !== currentPage) {
      if (pageNumber > 0 && pageNumber <= totalPages)
        setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    console.log("Entered");
    if (!executeRecaptcha) {
      return;
    }

    // @TODO: rewrite this func
    const getEventId = async () => {
      try {
        if (searchBoxFilterStore.eventType) {
          // if user has chosen a event return its ID.. else return NULL
          if (dataStore.eventTypes.data.length === 0) {
            return null;
          }
          const eventId = dataStore.eventTypes.data.find((item: any) => {
            return item.eventName === searchBoxFilterStore.eventType;
          })?._id;

          return eventId;
        }
        return null; // if NULL is returned ...then the event filter wont be applied in the backend
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      const captchaToken = await executeRecaptcha("inquirySubmit");
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");
      const eventId = await getEventId();
      const selectedCityName = searchBoxFilterStore.cityName
        .split(",")[0]
        .trim();
      const selectedDate = searchBoxFilterStore.bookingDate;
      try {
        let URL = "";
        let PARAMS: {
          selectedCity: string;
          selectedDate?: Date;
          eventId: string;
          filter: string;
          page: number;
          limit: number;
        } = {
          selectedCity: selectedCityName ? selectedCityName : "Mangalore",
          eventId: eventId,
          filter: activeFilter,
          page: currentPage - 1,
          limit: cardsPerPage,
        };

        switch (searchBoxFilterStore.vendorType) {
          case "":
          case "Banquet Hall":
            URL = "/api/routes/hallBookingMaster/getHallsAvailabilityStatus/";
            PARAMS = {
              ...PARAMS,
              selectedDate: selectedDate ? selectedDate : formattedDate,
            };
            break;
          case "Photographer":
            URL = "/api/routes/photographerMaster/getFilteredList/";
            break;
          default:
            return;
        }

        const response = await axios.get(URL, {
          params: PARAMS,
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        console.log(response);

        if (
          searchBoxFilterStore.vendorType === "Banquet Hall" &&
          activeFilter === "Available"
        ) {
          const filteredCardsBasedOnAvailability = SortCardsBasedOnAvailability(
            response.data?.data
          );
          setFilteredCards(filteredCardsBasedOnAvailability);
        } else {
          setFilteredCards(response.data?.data);
        }
        setTotalCardCount(response.data?.totalCount);
        setTotalPages(Math.ceil(response.data?.totalCount / cardsPerPage));
        setIsLoading(false); // To hide the loading spinner
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBoxFilterStore, activeFilter, executeRecaptcha, currentPage]);

  // To provide the scroll effect when the cards change
  useEffect(() => {
    if (wrapperRef.current) {
      const { top } = wrapperRef.current.getBoundingClientRect();
      // Scroll to the top of the wrapper element relative to the viewport
      window.scrollTo({ top: window.scrollY + top, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleCardFilter = (item: string) => {
    // Filtering Criteria to be passed in arguments ...Ex: Most Popular, Top Rated etc...
    setActiveFilter(item); // Set Active Filter
    setAnimateCard({ y: 100, opacity: 0 }); //to get the shuffled animation of the cards
    setTimeout(() => {
      setAnimateCard({ y: 0, opacity: 1 });
    }, 500);
  };

  const PackagesCardSkeleton = () => (
    <div className={styles.skeleton__wrapper}>
      <div className={styles.image__section}>
        <Skeleton.Image active={true} className={styles.img} />
      </div>
      <div className={styles.node__section}>
        <div className={styles.header__section}>
          <Skeleton.Input active={true} size={"default"} />
          <Skeleton.Input active={true} size={"small"} />
        </div>
        <div className={styles.body__section}>
          <div className={styles.wrapper__1}>
            <Skeleton.Input
              active={true}
              size={"default"}
              className={styles.input}
            />
            <Skeleton.Input
              active={true}
              size={"default"}
              className={styles.input}
            />
          </div>
          <div className={styles.wrapper__2}>
            <Skeleton.Input
              active={true}
              size={"small"}
              className={styles.availabilityInput}
              style={{ alignSelf: "center" }}
            />
          </div>
        </div>
        <div className={styles.footer__section}>
          <Skeleton.Input active={true} size={"default"} />
          <Skeleton.Input active={true} size={"default"} />
        </div>
      </div>
    </div>
  );

  const renderCards = () => {
    if (!filteredCards.length) {
      return null;
    }

    switch (searchBoxFilterStore.vendorType) {
      case "":
      case "Banquet Hall":
        return filteredCards.map((card: PackagesCardDataType, index) => (
          <div className={styles.card} key={index}>
            <Link
              href={{
                pathname: "/hall-description",
                search: `?hallId=${card.hallId}`,
              }}
              target="_blank"
            >
              <PackagesCard
                card={{
                  _id: card.hallId || '',
                  vendorImages: card.hallImages || [],
                  vendorDescription: card.hallDescription || "",
                  companyName: card.hallName || "",
                  companyCity: card.hallCity || "",
                  hallVegRate: card.hallVegRate,
                  hallNonVegRate: card.hallNonVegRate,
                  hallCapacity: card.hallCapacity,
                  hallRooms: card.hallRooms,
                  hallParking: card.hallParking,
                  hallFreezDay: card.hallFreezDay,
                  availability: card.availability,
                }}
                vendorType={searchBoxFilterStore.vendorType}
              />
            </Link>
          </div>
        ));
      case "Photographer":
        return filteredCards.map((card: PackagesCardDataType, index) => (
          <div className={styles.card} key={index}>
            <div
              // href={{
              //   pathname: "/photographer-description",
              //   search: `?photographerId=${card._id}`,
              // }}
              // target="_blank"
            >
              <PackagesCard
                card={{
                  _id: card._id,
                  vendorImages: card.vendorImages || [],
                  vendorDescription: card.vendorDescription || "",
                  companyName: card.companyName || "",
                  companyCity: card.companyCity || "",
                }}
                vendorType={searchBoxFilterStore.vendorType}
              />
            </div>
          </div>
        ));
      default:
        return;
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 3) {
      // Render all page numbers if less than or equal to 3
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <div
            className={`${styles.counter} ${
              currentPage === i ? styles.selected__counter : ""
            }`}
            key={i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </div>
        );
      }
    } else if (currentPage <= totalPages - 2) {
      // if more than 3 and less than total 'totalpages - 1'

      pageNumbers.push(
        <div
          className={`${styles.counter} ${styles.selected__counter}`}
          key={currentPage}
        >
          {currentPage}
        </div>
      );
      pageNumbers.push(
        <div
          className={styles.counter}
          key={currentPage + 1}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {currentPage + 1}
        </div>
      );
      pageNumbers.push(
        <div className={styles.counter} key="ellipsis">
          ...
        </div>
      );
      pageNumbers.push(
        <div
          className={`${styles.counter} ${
            currentPage === totalPages ? styles.selected__counter : ""
          }`}
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </div>
      );
    } else {
      // if page numbers are greater than 'totalpages - 2'
      pageNumbers.push(
        <div
          className={styles.counter}
          key={1}
          onClick={() => handlePageChange(1)}
        >
          {1}
        </div>
      );
      pageNumbers.push(
        <div className={styles.counter} key="ellipsis">
          ...
        </div>
      );
      pageNumbers.push(
        <div
          className={`${styles.counter} ${
            currentPage == totalPages - 1 && styles.selected__counter
          }`}
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
        >
          {totalPages - 1}
        </div>
      );
      pageNumbers.push(
        <div
          className={`${styles.counter} ${
            currentPage === totalPages ? styles.selected__counter : ""
          }`}
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </div>
      );
    }

    return pageNumbers;
  };

  return (
    <div className={styles.packages__container} id="packages" ref={wrapperRef}>
      <div className={styles.tags__wrapper}>
        {["Top Rated", "Most Popular", "Most Liked", "Oldest", "Available"].map(
          (item, index) => (
            <div
              key={index}
              onClick={() => {
                handleCardFilter(item);
              }}
              className={`${styles.tag} ${
                activeFilter === item ? styles.active : ""
              }`}
            >
              {item}
            </div>
          )
        )}
      </div>
      <motion.div
        className={styles.packages__wrapper}
        animate={animateCard}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
      >
        {isLoading
          ? Array(6)
              .fill("a")
              .map((_, index) => <PackagesCardSkeleton key={index} />)
          : renderCards() || (
              <div className={styles["altImg-container"]}>
                <img src={"/images/NoResults.png"} alt="no-results" />
              </div>
            )}
      </motion.div>
      <div className={styles.packagecount__wrapper}>
        <div className={styles.counter} onClick={() => handlePageChange(1)}>
          <a href="#packages">First</a>
        </div>
        <div
          className={styles.counter}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <a href="#packages">Previous</a>
        </div>
        {renderPageNumbers()}
        <div
          className={styles.counter}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <a href="#packages">Next</a>
        </div>
        <div
          className={styles.counter}
          onClick={() => handlePageChange(totalPages)}
        >
          <a href="#packages">Last</a>
        </div>
      </div>
    </div>
  );
};

export default PackagesComponent;
