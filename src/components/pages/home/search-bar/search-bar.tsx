"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import Select, { SingleValue } from "react-select";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import SearchIcon from "@mui/icons-material/Search";
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WarningIcon from "@mui/icons-material/Warning";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

import VirtualizedSelect from "@/components/ui/virtualized-select";
import { setSearchBoxFilterData } from "@/redux/slices/search-box-filter";
import { RootState } from "@/redux/store";
import styles from "./search-bar.module.scss";

// TODO: change the way how eventTypes and vendorTypes are rendered - use both id and type... avoid querying for eventId when the search request is sent

type Props = {};

interface ReactSelectOptionType {
  value: string;
  label: string;
}

const SearchBarComponent = (props: Props) => {
  const data = useAppSelector((state: RootState) => state.dataInfo); // CITIES, EVENT_TYPES & VENDOR_TYPES data
  const [eventNotSelectedWarning, setEventNotSelectedWarning] = useState(false);

  const searchBoxFilterStore = useAppSelector(
    (state: RootState) => state.searchBoxFilter
  ); // Redux Store which holds all the user selection info. which includes cityName, eventType, bookingDate and vendorType

  const dispatch = useAppDispatch();

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
        display: "none", // Hide the default arrow icon
      },
      padding: 10,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999999", // Change the placeholder color here
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
                onChange={(
                  selectedOption: SingleValue<ReactSelectOptionType>
                ) => {
                  if (selectedOption) {
                    dispatch(
                      setSearchBoxFilterData({
                        key: "cityName",
                        value: selectedOption.value,
                      })
                    ); // Update Details in 'SearchBoxFilter' Redux Store
                  }
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
                    : null
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
                  if (selectedOption) {
                    dispatch(
                      setSearchBoxFilterData({
                        key: "eventType",
                        value: selectedOption.value,
                      })
                    ); // Update Details in 'SearchBoxFilter' Redux Store
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
                    : null
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
                    ); // Update Details in 'SearchBoxFilter' Redux Store
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
                  ); // Update Details in 'SearchBoxFilter' Redux Store
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
                  ); // Update Details in 'SearchBoxFilter' Redux Store
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
                  ); // Update Details in 'SearchBoxFilter' Redux Store
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
                  ); /// Update Details in 'SearchBoxFilter' Redux Store
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
