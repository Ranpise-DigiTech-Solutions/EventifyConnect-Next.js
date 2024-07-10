"use client"

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";

import { RootState } from "@/redux/store";
import styles from './packages.module.scss';
import { PackagesCard } from '@/components/sub-components';

type Props = {}

const PackagesComponent = (props: Props) => {

    const [activeFilter, setActiveFilter] = useState("Available"); // Current Active Filter
    const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 }); // Card Animation when clicked on TAGS
    const [filteredCards, setFilteredCards] = useState<Array<any>>([]); // Filtering cards based on the TAGS..Ex: Most Popular, Top Rated etc..
  
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;
  
    const searchBoxFilterStore = useSelector((state : RootState) => state.searchBoxFilter); // searchBoxFilterStore react-redux
    const dataStore = useSelector((state : RootState) => state.dataInfo); // dataStore react-redux
  
    const handlePageChange = (pageNumber : number) => {
      if (pageNumber !== currentPage) {
        if (pageNumber > 0 && pageNumber <= totalPages)
          setCurrentPage(pageNumber);
      }
    };
  
    function mergeSort(arr : Array<any>): Array<any> {
      if (arr.length <= 1) {
        return arr;
      }
  
      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);
  
      return merge(mergeSort(left), mergeSort(right));
    }
  
    function merge(left : Array<any>, right : Array<any>): Array<any> {
      let result = [];
      let leftIndex = 0;
      let rightIndex = 0;
  
      while (leftIndex < left.length && rightIndex < right.length) {
        if (
          left[leftIndex].availability === "AVAILABLE" &&
          right[rightIndex].availability !== "AVAILABLE"
        ) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else if (
          left[leftIndex].availability !== "AVAILABLE" &&
          right[rightIndex].availability === "AVAILABLE"
        ) {
          result.push(right[rightIndex]);
          rightIndex++;
        } else if (
          left[leftIndex].availability === "LIMITED AVAILABILITY" &&
          right[rightIndex].availability === "UNAVAILABLE"
        ) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
  
      return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    }
  
    useEffect(() => {
      const getEventId = async () => {
        try {
          if (searchBoxFilterStore.eventType) {
            // if user has chosen a event return its ID.. else return NULL
            if (dataStore.eventTypes.data.length === 0) {
              return null;
            }
            const eventId = dataStore.eventTypes.data.find((item : any) => {
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
        const today = new Date();
        const formattedDate = format(today, "yyyy-MM-dd");
        const eventId = await getEventId();
        const selectedCityName = searchBoxFilterStore.cityName
          .split(",")[0]
          .trim();
        const selectedDate = searchBoxFilterStore.bookingDate;
        try {
          const hallMasterResponse = await axios.get(
            `/api/routes/hallBookingMaster/getHallsAvailabilityStatus/`,
            {
              params: {
                selectedCity: selectedCityName ? selectedCityName : "Mangalore",
                selectedDate: selectedDate ? selectedDate : formattedDate,
                eventId: eventId,
                filter: activeFilter,
              },
            }
          );
          console.log("HALL MASTER RESPONSE: ", hallMasterResponse.data);
  
          if (activeFilter === "Available") {
            const filteredCardsBasedOnAvailability = mergeSort(
              hallMasterResponse.data
            );
            setFilteredCards(filteredCardsBasedOnAvailability);
          }
          setFilteredCards(hallMasterResponse.data);
          setTotalPages(
            Math.ceil(
              Object.values(hallMasterResponse.data).length / itemsPerPage
            )
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchBoxFilterStore, activeFilter]);
  
    // To provide the scroll effect when the cards change
    useEffect(() => {
      if (wrapperRef.current) {
        const { top } = wrapperRef.current.getBoundingClientRect();
        // Scroll to the top of the wrapper element relative to the viewport
        window.scrollTo({ top: window.scrollY + top, behavior: "smooth" });
      }
    }, [currentPage]);
  
    const handleCardFilter = (item : string) => {
      // Filtering Criteria to be passed in arguments ...Ex: Most Popular, Top Rated etc...
      setActiveFilter(item); // Set Active Filter
      setAnimateCard({ y: 100, opacity: 0 }); //to get the shuffled animation of the cards
      setTimeout(() => {
        setAnimateCard({ y: 0, opacity: 1 });
      }, 500);
    };
  
    const renderCards = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const slicedData = Object.values(filteredCards).slice(startIndex, endIndex);
  
      if (!slicedData.length) {
        return null;
      }
  
      return slicedData.map((card : any, index) => (
        <div className={styles.card} key={index}>
          <Link
            href={{
              pathname: "/hall-description",
              search: `?hallId=${card.hallId}`,
            }}
            target="_blank"
          >
            <PackagesCard card={card} />
          </Link>
        </div>
      ));
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
          <div className={`${styles.counter} ${styles.selected__counter}`} key={currentPage}>
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
          <div className={styles.counter} key={1} onClick={() => handlePageChange(1)}>
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
                className={`${styles.tag} ${activeFilter === item ? styles.active : ""}`}
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
          {filteredCards.length === 0 ? (
            <div className={styles['altImg-container']}>
              <img src={"/images/NoResults.png"} alt="no-results" />
            </div>
          ) : (
            renderCards() || (
              <div className={styles['altImg-container']}>
                <img src={"/images/loading.png"} alt="" />
              </div>
            )
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
          <div className={styles.counter} onClick={() => handlePageChange(totalPages)}>
            <a href="#packages">Last</a>
          </div>
        </div>
      </div>
    );
  
}

export default PackagesComponent