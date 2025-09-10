"use client";

import { Skeleton } from "antd";
import { useEffect, useState, useRef } from "react";
import axios, { AxiosError } from "axios";
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
  //const { executeRecaptcha } = useGoogleReCaptcha();
  const [activeFilter, setActiveFilter] = useState("Available");
  const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 });
  const [filteredCards, setFilteredCards] = useState<Array<any>>([]);
  const cardsPerPage = 6;
  const [totalCardCount, setTotalCardCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchBoxFilterStore = useSelector(
    (state: RootState) => state.searchBoxFilter
  );
  const dataStore = useSelector((state: RootState) => state.dataInfo);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber !== currentPage) {
      if (pageNumber > 0 && pageNumber <= totalPages)
        setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    console.log("Entered");
    // if (!executeRecaptcha) {
    //   return;
    // }

    const getEventId = async () => {
      try {
        if (searchBoxFilterStore.eventType) {
          if (dataStore.eventTypes.data.length === 0) {
            return null;
          }
          const eventId = dataStore.eventTypes.data.find((item: any) => {
            return item.eventName === searchBoxFilterStore.eventType;
          })?._id;

          return eventId;
        }
        return null;
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
    };

    const fetchData = async () => {
      setIsLoading(true);

      //if (!executeRecaptcha) {
        //setIsLoading(false);
        //console.error("reCAPTCHA not initialized.");
        //return;
      //}

      //const captchaToken = await executeRecaptcha("inquirySubmit");
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");

      const selectedCityName = searchBoxFilterStore.cityName
        ? searchBoxFilterStore.cityName.split(",")[0].trim()
        : '';
      const selectedDate = searchBoxFilterStore.bookingDate || formattedDate;
      const eventId = await getEventId();

      // 💡 FIX: Add a guard clause here to check if selectedCityName is valid.
      if (!selectedCityName) {
        console.error("City name is missing. Skipping API call.");
        setIsLoading(false);
        setFilteredCards([]); // Clear previous results
        setTotalCardCount(0); // Reset total count
        setTotalPages(0); // Reset total pages
        return;
      }

      let URL = "";
      switch (searchBoxFilterStore.vendorType) {
        case "Banquet Hall":
          URL = "/api/routes/hallBookingMaster/getHallsAvailabilityStatus/";
          break;
        case "Photographer":
          URL = "/api/routes/photographerMaster/getFilteredList/";
          break;
        default:
          console.error("Invalid or empty vendor type provided.");
          setIsLoading(false);
          setFilteredCards([]);
          return;
      }

      const params: { [key: string]: any } = {
        selectedCity: selectedCityName,
        selectedDate: selectedDate,
        filter: activeFilter,
        page: currentPage - 1,
        limit: cardsPerPage,
      };

      if (eventId) {
        params.eventId = eventId;
      }

      console.log("Request URL:", URL);
      console.log("Request Params:", params);

      try {
        const response = await axios.get(URL, {
          params,
          headers: {
            
          },
          withCredentials: true,
        });

        if (searchBoxFilterStore.vendorType === "Banquet Hall" && activeFilter === "Available") {
          const filteredCardsBasedOnAvailability = SortCardsBasedOnAvailability(response.data?.data);
          setFilteredCards(filteredCardsBasedOnAvailability);
        } else {
          setFilteredCards(response.data?.data);
        }

        setTotalCardCount(response.data?.totalCount);
        setTotalPages(Math.ceil(response.data?.totalCount / cardsPerPage));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);

        if (axios.isAxiosError(error) && error.response) {
          console.error("Server Response:", error.response.data);
          console.error("Status Code:", error.response.status);
        }
      }
    };

    fetchData();
  }, [searchBoxFilterStore, activeFilter, currentPage]);

  useEffect(() => {
    if (wrapperRef.current) {
      const { top } = wrapperRef.current.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + top, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleCardFilter = (item: string) => {
    setActiveFilter(item);
    setAnimateCard({ y: 100, opacity: 0 });
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
                  _id: card.hallId || "",
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