"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/use-redux-store";
import Select, { SingleValue } from "react-select";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

import VirtualizedSelect from "@/components/ui/virtualized-select";
import { setSearchBoxFilterData } from "@/redux/slices/search-box-filter";
import { RootState } from "@/redux/store";
import styles from "./search-bar.module.scss";

// Import the thunks
import { 
  fetchCitiesOfCountry, 
  fetchEventTypes, 
  fetchVendorTypes 
} from '@/redux/thunks/data';

type Props = {};

interface ReactSelectOptionType {
  value: string;
  label: string;
}

const SearchBarComponent = (props: Props) => {
  const data = useAppSelector((state: RootState) => state.dataInfo);
  const [eventNotSelectedWarning, setEventNotSelectedWarning] = useState(false);

  const searchBoxFilterStore = useAppSelector(
    (state: RootState) => state.searchBoxFilter
  );

  const dispatch = useAppDispatch();

  // This hook dispatches the API calls ONCE when the component mounts.
  useEffect(() => {
    dispatch(fetchCitiesOfCountry({ countryName: 'India' }));
    dispatch(fetchEventTypes());
    dispatch(fetchVendorTypes());
  }, [dispatch]);

  // This log will run on every render, allowing you to see the state after it updates.
  console.log("Cities Data in Redux:", data.citiesOfCountry.data);
  console.log("Event Types Data in Redux:", data.eventTypes.data);
  console.log("Vendor Types Data in Redux:", data.vendorTypes.data);

  // ... rest of the component
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setSearchBoxFilterData({ key: "bookingDate", value: event.target.value })
    );
  };

  const customStyles = {
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
        display: "none",
      },
      padding: 10,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999999",
    }),
  };

  return (
    <div className={styles.search__container} id="searchBar">
      <div className={styles.mainSearchBar__wrapper}>
        <div className={styles.title}>search package</div>
        <div className={styles.description}>
          Find best Wedding Vendors with, <br /> thousands of trusted Reviews
        </div>
        <div className={styles.sub__wrapper_1}>
          <div className={styles.wrapper}>
            <p>Destination</p>
            <div className={styles.input}>
              <VirtualizedSelect
                id={"cityName"}
                customStyles={customStyles}
                options={
                  Array.isArray(data.citiesOfCountry.data)
                    ? data.citiesOfCountry.data.map((city: string) => ({
                        value: city,
                        label: city,
                      }))
                    : []
                }
                value={
                  searchBoxFilterStore.cityName
                    ? {
                        label: searchBoxFilterStore.cityName,
                        value: searchBoxFilterStore.cityName,
                      }
                    : null
                }
                onChange={(
                  selectedOption: SingleValue<ReactSelectOptionType>
                ) => {
                  dispatch(
                    setSearchBoxFilterData({
                      key: "cityName",
                      value: selectedOption ? selectedOption.value : "",
                    })
                  );
                }}
                placeholder="Select or type a city..."
                dropDownIndicator={true}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p>Date</p>
            <div className={styles.input}>
              <input
                type="date"
                value={searchBoxFilterStore.bookingDate}
                placeholder="dd-mm-yyyy"
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <p>Event Type</p>
            <div className={styles.input}>
              <Select
                instanceId={"eventName"}
                styles={customStyles}
                options={
                  Array.isArray(data.eventTypes.data)
                    ? data.eventTypes.data.map(
                        (item: { eventName: string }) => ({
                          value: item.eventName,
                          label: item.eventName,
                        })
                      )
                    : []
                }
                value={
                  searchBoxFilterStore.eventType
                    ? {
                        label: searchBoxFilterStore.eventType,
                        value: searchBoxFilterStore.eventType,
                      }
                    : null
                }
                onChange={(
                  selectedOption: SingleValue<ReactSelectOptionType>
                ) => {
                  dispatch(
                    setSearchBoxFilterData({
                      key: "eventType",
                      value: selectedOption ? selectedOption.value : "",
                    })
                  );
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
          <div className={styles.wrapper}>
            <p>Vendor Type</p>
            <div className={styles.input}>
              <Select
                instanceId={"vendorType"}
                styles={customStyles}
                options={
                  Array.isArray(data.vendorTypes.data)
                    ? data.vendorTypes.data.map(
                        (val: { vendorType: string }) => ({
                          value: val.vendorType,
                          label: val.vendorType,
                        })
                      )
                    : []
                }
                value={
                  searchBoxFilterStore.vendorType
                    ? {
                        label: searchBoxFilterStore.vendorType,
                        value: searchBoxFilterStore.vendorType,
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (searchBoxFilterStore.eventType) {
                    dispatch(
                      setSearchBoxFilterData({
                        key: "vendorType",
                        value: selectedOption ? selectedOption.value : "",
                      })
                    );
                  } else {
                    setEventNotSelectedWarning(true);
                  }
                }}
                placeholder="Choose Vendor Type"
                components={{
                  DropdownIndicator: () => <KeyboardArrowDownIcon />,
                }}
                menuShouldScrollIntoView={false}
                closeMenuOnSelect
                isSearchable
              />
            </div>
          </div>
          <div className={styles.search__icon}>
            <button title="searchBtn">
              <a href="#packages" title="search">
                <SearchIcon />
              </a>
            </button>
          </div>
        </div>
        <div className={styles.sub__wrapper_2}>
          {searchBoxFilterStore.cityName && (
            <div className={styles.tag}>
              <p>{searchBoxFilterStore.cityName}</p>
              <CloseIcon
                className={styles.icon}
                onClick={() => {
                  dispatch(
                    setSearchBoxFilterData({ key: "cityName", value: "" })
                  );
                }}
              />
            </div>
          )}
          {searchBoxFilterStore.bookingDate && (
            <div className={styles.tag}>
              <p>{searchBoxFilterStore.bookingDate}</p>
              <CloseIcon
                className={styles.icon}
                onClick={() => {
                  dispatch(
                    setSearchBoxFilterData({ key: "bookingDate", value: "" })
                  );
                }}
              />
            </div>
          )}
          {searchBoxFilterStore.eventType && (
            <div className={styles.tag}>
              <p>{searchBoxFilterStore.eventType}</p>
              <CloseIcon
                className={styles.icon}
                onClick={() => {
                  dispatch(
                    setSearchBoxFilterData({ key: "eventType", value: "" })
                  );
                }}
              />
            </div>
          )}
          {searchBoxFilterStore.vendorType && (
            <div className={styles.tag}>
              <p>{searchBoxFilterStore.vendorType}</p>
              <CloseIcon
                className={styles.icon}
                onClick={() => {
                  dispatch(
                    setSearchBoxFilterData({ key: "vendorType", value: "" })
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
      {eventNotSelectedWarning && (
        <Dialog
          open={eventNotSelectedWarning}
          onClose={() => setEventNotSelectedWarning(false)}
          className={styles.warningDialog__container}
        >
          <DialogTitle id="alert-dialog-title">
            <WarningIcon className={styles.warning__icon} />
            <p>Warning!</p>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Your event is not selected. Please select an event before
              proceeding!!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEventNotSelectedWarning(false)}
              color="primary"
              autoFocus
              className={styles.agree__btn}
            >
              ok
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default SearchBarComponent;