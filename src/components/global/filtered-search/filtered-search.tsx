/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Select, { SingleValue } from "react-select";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { message, Skeleton, Spin } from "antd";
import Slider from "@mui/material/Slider";
import { format } from "date-fns";

import VirtualizedSelect from "@/components/ui/virtualized-select";
import styles from "./filtered-search.module.scss";
import { useAppSelector } from "@/lib/hooks/use-redux-store";
import {
  FilteredSearchComponentFiltersType,
  PackagesCardDataType,
  ReactSelectOptionType,
} from "@/lib/types";
import { RootState } from "@/redux/store";
import EventTypes from "@/app/api/schemas/event-types";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { SortCardsBasedOnAvailability } from "@/lib/utils/functions";
import { PackagesCard } from "@/components/sub-components";
import Link from "next/link";
import { PhotographerDetailsForm } from "@/components/forms";
import CloseIcon from "@mui/icons-material/Close";
import { photographerBookingDetails } from "@/app/api/schemas/booking-master";
//import CatererRegistrationForm from "@/components/forms/caterer-registration-form"; // Import the new Caterer form
import CatererDetailsForm from "@/components/forms/CatererDetailsForm";


type Props = {
  open: boolean;
  handleClose: () => void;
  defaultFilters?: FilteredSearchComponentFiltersType;
  setVendorData: (vendorData: photographerBookingDetails | any) => void;
};

type FilterCriteriaType =
  | "Top Rated"
  | "Most Popular"
  | "Most Liked"
  | "Oldest"
  | "Available";

type FilterCriteriaSelectOptionType = {
  label: FilterCriteriaType;
  value: FilterCriteriaType;
};

const FilteredSearchComponent = ({
  open,
  handleClose,
  defaultFilters,
  setVendorData,
}: Props) => {
  //const { executeRecaptcha } = useGoogleReCaptcha();

  const data = useAppSelector((state: RootState) => state.dataInfo); // CITIES, EVENT_TYPES & VENDOR_TYPES data
  const [messageApi, contextHolder] = message.useMessage();

  const [filterCriteria, setFilterCriteria] = useState<
    "Top Rated" | "Most Popular" | "Most Liked" | "Oldest" | "Available"
  >("Available");
  const [filters, setFilters] = useState<FilteredSearchComponentFiltersType>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredCards, setFilteredCards] = useState<Array<any>>([]); // Filtering cards based on the TAGS..Ex: Most Popular, Top Rated etc..
  const [isFormDialogOpen, setIsFormDialogOpen] = useState<boolean>(false);
  const [currentVendorSelection, setCurrentVendorSelection] = useState<any>();

  const cardsPerRender = 6;
  const [totalCardCount, setTotalCardCount] = useState<number>(0); // set it according to data fetched from database
  const [totalPages, setTotalPages] = useState<number>(0); // set it according to data fetched from database
  const [currentPage, setCurrentPage] = useState(1);

  const eventNotSelectedWarningDisplayFunc = () => {
    messageApi.open({
      type: "error",
      content: "Please choose an event first.",
    });
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "none",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      boxShadow: state.isFocused ? "none" : provided.boxShadow,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      "& svg": {
        display: "none", // Hide the default arrow icon
      },
      padding: 0,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999999", // Change the placeholder color here
    }),
  };

  const filterCriteriaOptionList: FilterCriteriaSelectOptionType[] = (
    [
      "Top Rated",
      "Most Popular",
      "Most Liked",
      "Oldest",
      "Available",
    ] as FilterCriteriaType[]
  ).map((option) => ({
    value: option,
    label: option,
  }));

  const handleFilters = (
    key: keyof FilteredSearchComponentFiltersType,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  console.log(defaultFilters);

  const handleFormDialogCLose = () => {
    setIsFormDialogOpen(false);
  };

  useEffect(() => {
    if (!defaultFilters) return;
    setFilters(defaultFilters);
  }, [defaultFilters]);

  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      //const captchaToken = await executeRecaptcha("inquirySubmit");
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");
      const selectedCityName = filters.cityName
        ? filters.cityName.split(",")[0].trim()
        : null;

      try {
        let URL = "";
        let PARAMS: {
          selectedCity: string;
          selectedDate?: string;
          eventId: string | null;
          filter: string;
          page: number;
          limit: number;
        } = {
          selectedCity: selectedCityName ? selectedCityName : "Mangalore",
          eventId: filters.eventType ? filters.eventType.value : "",
          filter: filterCriteria,
          page: currentPage - 1,
          limit: cardsPerRender,
        };

        switch (filters.vendorType?.label) {
          case "": return;
          case "Banquet Hall":
            URL = "/api/routes/hallBookingMaster/getHallsAvailabilityStatus/";
            PARAMS = {
              ...PARAMS,
              selectedDate: filters.date ? filters.date : formattedDate,
            };
            break;
          case "Photographer":
            URL = "/api/routes/photographerMaster/getFilteredList/";
            break;
          default:
            setIsLoading(false);
            return;
        }

        const response = await axios.get(URL, {
          params: PARAMS,
          headers: {
            "Content-Type": "application/json",
            //"X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        });

        console.log(response);

        if (
          filters.vendorType.label === "Banquet Hall" &&
          filterCriteria === "Available"
        ) {
          const filteredCardsBasedOnAvailability = SortCardsBasedOnAvailability(
            response.data?.data
          );
          setFilteredCards([
            ...filteredCards,
            ...filteredCardsBasedOnAvailability,
          ]);
        } else {
          setFilteredCards([...filteredCards, ...response.data?.data]);
        }
        setTotalCardCount(response.data?.totalCount);
        setTotalPages(Math.ceil(response.data?.totalCount / cardsPerRender));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters, currentPage]);

  console.log("Filtered Cards", filteredCards);

  const CardDesign: React.FC<{
    children: React.ReactNode;
    key: number;
    vendorType: string;
    vendorId: string;
    vendorDetails: any; //@TODO: Specify type - union of types returned from hallbooking and vendorbooking
  }> = ({ children, key, vendorType, vendorId, vendorDetails }) => (
    <div className={styles.card}>
      {children}
      <div className={styles.btns__wrapper}>
        <button
          className={styles.selectBtn}
          onClick={() => {
            setCurrentVendorSelection(vendorDetails);
            setIsFormDialogOpen(true);
          }}
        >
          Select
        </button>
        <button className={styles.compareBtn}>Compare</button>
      </div>
    </div>
  );

  const renderCards = () => {
    console.log(filteredCards);
    if (!filteredCards.length) {
      return null;
    }

    const vendorLabel = filters.vendorType?.label || "";

    switch (vendorLabel) {
      case "": return;
      case "Banquet Hall":
        // setCurrentForm(<PhotographerDetailsForm/>);
        return filteredCards.map(
          (card: PackagesCardDataType, index) =>
            card.hallId && (
              <CardDesign
                key={index}
                vendorType="Banquet Hall"
                vendorId={card.hallId}
                vendorDetails={card}
              >
                <Link
                  href={{
                    pathname: "/hall-description",
                    search: `?hallId=${card.hallId}`,
                  }}
                  target="_blank"
                >
                  <PackagesCard
                    card={{
                      _id: card.hallId,
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
                    vendorType={"Banquet Hall"}
                    containerStyles={{ width: 350, height: 450 }}
                  />
                </Link>
              </CardDesign>
            )
        );
      case "Photographer":
        // setCurrentForm(<PhotographerDetailsForm/>);
        return filteredCards.map((card: PackagesCardDataType, index) => (
          <CardDesign
            key={index}
            vendorType="Photographer"
            vendorId={card._id}
            vendorDetails={card}
          >
            <Link
              href={{
                pathname: "/photographer-description",
                search: `?photographerId=${card._id}`,
              }}
              target="_blank"
            >
              <PackagesCard
                card={{
                  _id: card._id,
                  vendorImages: card.vendorImages || [],
                  vendorDescription: card.vendorDescription || "",
                  companyName: card.companyName || "",
                  companyCity: card.companyCity || "",
                }}
                vendorType={"Photographer"}
                containerStyles={{ width: 350, height: 400 }}
              />
            </Link>
          </CardDesign>
        ));
        case "Caterer":
        return filteredCards.map((card: PackagesCardDataType, index) => (
          <CardDesign
            key={index}
            vendorType="Caterer"
            vendorId={card._id}
            vendorDetails={card}
          >
            <Link
              href={{
                pathname: "/caterer-description", // New page for caterer details
                search: `?catererId=${card._id}`,
              }}
              target="_blank"
            >
              <PackagesCard
                card={{
                  _id: card._id,
                  vendorImages: card.vendorImages || [],
                  vendorDescription: card.vendorDescription || "",
                  companyName: card.companyName || "",
                  companyCity: card.companyCity || "",
                  vendorCuisines: card.vendorCuisines,
                  vendorMinGuests: card.vendorMinGuests,
                  vendorMaxGuests: card.vendorMaxGuests,
                }}
                vendorType={"Caterer"}
                containerStyles={{ width: 350, height: 400 }}
              />
            </Link>
          </CardDesign>
        ));
      default:
        return null;
    }
  };

  const renderForm = () => {
    switch (filters.vendorType?.label) {
      case "Photographer":
        return (
          <PhotographerDetailsForm
            handleClose={handleFormDialogCLose}
            vendorDetails={currentVendorSelection}
            setVendorData={setVendorData}
            setFilteredCards={setFilteredCards}
            handleFilteredSearchComponentClose={handleClose}
          />
        );
        case "Caterer":
        return (
          <CatererDetailsForm
            handleClose={handleFormDialogCLose}
            vendorDetails={currentVendorSelection}
            setVendorData={setVendorData}
            setFilteredCards={setFilteredCards}
            handleFilteredSearchComponentClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  const PackagesCardSkeleton = () => (
    <div className={styles.skeleton__wrapper}>
      <div className={styles.image__section}>
        <Skeleton.Image active={true} className={styles.img} />
      </div>
      <div className={styles.node__section}>
        <div className={styles.header__section}>
          <Skeleton.Input active={true} size={"small"} />
          <Skeleton.Input active={true} size={"small"} />
        </div>
        <div className={styles.body__section}>
          <div className={styles.wrapper__1}>
            <Skeleton.Input
              active={true}
              size={"small"}
              className={styles.input}
            />
            <Skeleton.Input
              active={true}
              size={"small"}
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
          <Skeleton.Input active={true} size={"small"} />
          <Skeleton.Input active={true} size={"small"} />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={() => {
        handleClose();
      }}
      fullScreen
    >
      <div className={styles.filteredSearchComponent__container}>
        {contextHolder}
        <Dialog
          open={isFormDialogOpen}
          onClose={handleFormDialogCLose}
          maxWidth="xs"
          fullWidth
        >
          {renderForm()}
        </Dialog>
        <div className={styles.sideBar__wrapper}>
          <div className={styles.header}>
            <h3 className={styles.title}>Filter Search</h3>
            <p className={styles.resetBtn}>Reset</p>
          </div>
          <div className={styles.lineSeparator} />
          <div className={styles.contents__wrapper}>
            <div className={styles.wrapper}>
              <div className={styles.sub__wrapper__1}>
                <div className={styles.title}>City Name</div>
                <button className={styles.hideBtn}>
                  <span>Hide</span>
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    className={styles.icon}
                  />
                </button>
              </div>
              <div className={styles.input}>
                <VirtualizedSelect
                  id={"cityName"}
                  customStyles={customSelectStyles}
                  options={
                    Array.isArray(data.citiesOfCountry.data)
                      ? data.citiesOfCountry.data.map((city: string) => ({
                          value: city,
                          label: city,
                        }))
                      : null
                  }
                  value={
                    filters.cityName
                      ? {
                          label: filters.cityName,
                          value: filters.cityName,
                        }
                      : null
                  }
                  onChange={(
                    selectedOption: SingleValue<ReactSelectOptionType>
                  ) => {
                    if (selectedOption) {
                      setFilteredCards([]);
                      handleFilters("cityName", selectedOption.value || "");
                      setCurrentPage(0);
                    }
                  }}
                  placeholder="Select or type a city..."
                  dropDownIndicator={true}
                />
              </div>
            </div>
            <div className={styles.lineSeparator}></div>
            <div className={styles.wrapper}>
              <div className={styles.sub__wrapper__1}>
                <div className={styles.title}>Date</div>
                <button className={styles.hideBtn}>
                  <span>Hide</span>
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    className={styles.icon}
                  />
                </button>
              </div>
              <div className={styles.input}>
                <input
                  type="date"
                  value={filters.date}
                  placeholder="dd-mm-yyyy"
                  onChange={() => {
                    setFilteredCards([]);
                    setCurrentPage(0);
                  }}
                />
              </div>
            </div>
            <div className={styles.lineSeparator}></div>
            <div className={styles.wrapper}>
              <div className={styles.sub__wrapper__1}>
                <div className={styles.title}>Event Type</div>
                <button className={styles.hideBtn}>
                  <span>Hide</span>
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    className={styles.icon}
                  />
                </button>
              </div>
              <div className={styles.input}>
                <Select
                  instanceId={"eventName"}
                  styles={customSelectStyles}
                  options={
                    Array.isArray(data.eventTypes.data)
                      ? data.eventTypes.data.map((item: EventTypes) => ({
                          value: item._id,
                          label: item.eventName,
                        }))
                      : null
                  }
                  value={filters.eventType?.value ? filters.eventType : null}
                  onChange={(
                    selectedOption: SingleValue<ReactSelectOptionType>
                  ) => {
                    if (selectedOption) {
                      setFilteredCards([]);
                      handleFilters("eventType", {
                        label: selectedOption.label || "",
                        value: selectedOption.value || "",
                      });
                      // Update Details in 'SearchBoxFilter' Redux Store
                      setCurrentPage(1);
                    }
                  }}
                  placeholder="Choose Event Type"
                  components={{
                    DropdownIndicator: () => <KeyboardArrowDownIcon />,
                  }}
                  menuShouldScrollIntoView={false}
                  closeMenuOnSelect
                  isSearchable
                />
              </div>
            </div>
            <div className={styles.lineSeparator}></div>
            <div className={styles.wrapper}>
              <div className={styles.sub__wrapper__1}>
                <div className={styles.title}>Vendor Type</div>
                <button className={styles.hideBtn}>
                  <span>Hide</span>
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    className={styles.icon}
                  />
                </button>
              </div>
              <div className={styles.input}>
                <Select
                  instanceId={"vendorType"}
                  styles={customSelectStyles}
                  options={
                    Array.isArray(data.vendorTypes.data)
                      ? data.vendorTypes.data.map(
                          (val: { vendorType: string }) => ({
                            value: val.vendorType,
                            label: val.vendorType,
                          })
                        )
                      : null
                  }
                  value={filters.vendorType?.value ? filters.vendorType : null}
                  onChange={(
                    selectedOption: SingleValue<ReactSelectOptionType>
                  ) => {
                    if (filters.eventType?.label) {
                      setFilteredCards([]);
                      handleFilters("vendorType", {
                        label: selectedOption?.label || "",
                        value: selectedOption?.value || "",
                      }); // Update Details in 'SearchBoxFilter' Redux Store
                      setCurrentPage(1);
                    } else {
                      eventNotSelectedWarningDisplayFunc();
                    }
                  }}
                  placeholder="Choose Vendor Type"
                  components={{
                    DropdownIndicator: () => <KeyboardArrowDownIcon />,
                  }}
                  menuShouldScrollIntoView={false}
                  closeMenuOnSelect
                  isSearchable
                  isDisabled={
                    defaultFilters && defaultFilters.vendorType?.label !== "Banquet Hall"
                  }
                />
              </div>
            </div>
            <div className={styles.lineSeparator}></div>
            <div className={styles.wrapper}>
              <div className={styles.sub__wrapper__1}>
                <div className={styles.title}>Pricing Range</div>
                <button className={styles.hideBtn}>
                  <span>Hide</span>
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    className={styles.icon}
                  />
                </button>
              </div>
              <div className={styles.priceInput__wrapper}>
                <div className={styles.priceRange}>
                  <div className={styles.wrapper}>
                    <p className={styles.price}>₹ 100</p>
                    <p className={styles.desc}>min</p>
                  </div>
                  <p> - </p>
                  <div className={styles.wrapper}>
                    <p className={styles.price}>₹ 1000</p>
                    <p className={styles.desc}>max</p>
                  </div>
                </div>
                <Slider
                  defaultValue={50}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                />
                <div className={styles.priceInputs}>
                  <input type="number" name="min" className={styles.input} />
                  <p> - </p>
                  <input type="number" name="max" className={styles.input} />
                </div>
              </div>
            </div>
            <div className={styles.lineSeparator}></div>
            <div className={styles.btn__wrapper}>
              <button className={styles.btn} onClick={() => setCurrentPage(0)}>
                Apply filter
              </button>
            </div>
          </div>
        </div>
        <div className={styles.content__wrapper}>
          <div className={styles.header}>
            <div className={styles.wrapper__1}>
              <h2 className={styles.title}>{filters.vendorType?.label}</h2>
              <p className={styles.itemsCount}>
                Found {totalCardCount} items on search
              </p>
            </div>
            <div className={styles.wrapper__2}>
              <div className={styles.sub__wrapper}>
                <p className={styles.title}>Sort by :</p>
                <Select
                  styles={customSelectStyles}
                  options={filterCriteriaOptionList}
                  value={
                    filterCriteria
                      ? {
                          value: filterCriteria,
                          label: filterCriteria,
                        }
                      : null
                  }
                  onChange={(
                    selectedOption: SingleValue<FilterCriteriaSelectOptionType>
                  ) => setFilterCriteria(selectedOption?.value || "Available")}
                  placeholder="Select a filter criteria"
                  className={styles.selectInput}
                  components={{
                    DropdownIndicator: () => (
                      <KeyboardArrowDownIcon style={{ color: "#007bff" }} />
                    ),
                  }}
                  menuPlacement="bottom"
                  menuShouldScrollIntoView={false}
                  hideSelectedOptions={false}
                  closeMenuOnSelect
                  isClearable={false}
                  isSearchable
                />
              </div>
              <div
                className={styles.sub__wrapper}
                onClick={() => {
                  setFilteredCards([]);
                  handleClose();
                }}
              >
                <CloseIcon className={styles.closeIcon} />
              </div>
            </div>
          </div>
          <div className={styles.body__wrapper}>
            <div className={styles.data__wrapper}>
              {(filteredCards && renderCards()) ||
                (!isLoading && (
                  <div className={styles["altImg-container"]}>
                    <img src={"/images/NoResults.png"} alt="no-results" />
                  </div>
                ))}
              {isLoading &&
                Array(6)
                  .fill("a")
                  .map((_, index) => <PackagesCardSkeleton key={index} />)}
            </div>
            {isLoading ? (
              <Spin size="large" />
            ) : (
              currentPage < totalPages && (
                <div className={styles.loadDataBtn}>
                  <button
                    className={styles.btn}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Load more
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FilteredSearchComponent;
