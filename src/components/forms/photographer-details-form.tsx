"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { Theme, useTheme } from "@mui/material/styles";
import { Slider } from "antd";
import { Image as AntImage } from "antd";

import PeopleIcon from "@mui/icons-material/People";
import { GrServices } from "react-icons/gr";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CollectionsIcon from "@mui/icons-material/Collections";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { FaPenToSquare } from "react-icons/fa6";

import styles from "./form.module.scss";
import Image from "next/image";
import { photographerBookingDetails } from "@/app/api/schemas/booking-master";

type Props = {
  handleClose: () => void;
  vendorDetails: any;
  setVendorData: (vendorData: photographerBookingDetails | any) => void;
  handleFilteredSearchComponentClose: () => void;
  setFilteredCards: Dispatch<SetStateAction<any[]>>;
};

interface FormValues {
  expectedHeadCount: number;
  photoDeliveryFormat: string;
  photographyStyle: string;
  numberOfPhotographers: number;
  specialRequests: string;
  durationOfCoverage: number;
  additionalServices: string[];
  // budgetRange: number[];
  // photoEditingRequirements: string;
}

const validationSchema = Yup.object({
  expectedHeadCount: Yup.number()
    .required("Expected head count is required")
    .min(1, "Head count cannot be less than or equal to zero"),

  photoDeliveryFormat: Yup.string().required(
    "Photo delivery format is required"
  ),

  photographyStyle: Yup.string().required("Photography style is required"),

  numberOfPhotographers: Yup.number()
    .required("Number of photographers is required")
    .min(1, "At least one photographer is required")
    .max(10, "You can select up to 10 photographers"),

  specialRequests: Yup.string().optional(),

  durationOfCoverage: Yup.number()
    .min(1, "Duration cannot be less than or equal to 0")
    .required("Duration of coverage is required"),

  additionalServices: Yup.array().of(Yup.string()).optional(),

  // budgetRange: Yup.array()
  //   .of(
  //     Yup.number()
  //       .required("Each budget value is required")
  //       .min(100, "Each budget must be at least 100")
  //       .max(1000000, "Each budget cannot exceed 100,000")
  //   )
  //   .required("Budget range is required")
  //   .length(2, "Budget range must contain exactly two values") // Ensures array contains exactly two values
  //   .test(
  //     "isValidRange",
  //     "Minimum budget cannot be greater than maximum budget",
  //     function (value) {
  //       return value && value.length === 2 ? value[0] <= value[1] : true;
  //     }
  //   ),

  // photoEditingRequirements: Yup.string().required(
  //   "Photo editing requirements are required"
  // ),
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const additionalServicesMenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const additionalServicesList = [
  "Select multiple items",
  "Videography",
  "Drone Photography",
  "Live Streaming",
];

function getStyles(item: string, list: readonly string[], theme: Theme) {
  return {
    fontWeight: list.includes(item)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const PhotographerDetailsForm = ({
  handleClose,
  vendorDetails,
  setVendorData,
  handleFilteredSearchComponentClose,
  setFilteredCards
}: Props) => {
  const theme = useTheme();
  console.log(vendorDetails);

  const initialValues: FormValues = {
    expectedHeadCount: 0,
    photoDeliveryFormat: "",
    photographyStyle: "",
    numberOfPhotographers: 0,
    specialRequests: "",
    durationOfCoverage: 0,
    additionalServices: [],
    // budgetRange: [10000, 100000],
    // photoEditingRequirements: "",
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default behavior (e.g., form submission)

    const userConfirmed = window.confirm(
      "Are you sure you want to cancel? All form progress will be lost."
    );

    if (userConfirmed) {
      handleClose();
    }
  };

  // Form submit handler
  const onSubmit = (values: FormValues) => {
    if (vendorDetails._id) {
      setVendorData({
        ...values,
        photographerId: vendorDetails._id,
        companyName: vendorDetails.companyName,
        vendorImage: vendorDetails.vendorImages[0],
      });
      setFilteredCards([]);
      handleClose();
      handleFilteredSearchComponentClose();
    }
    //TODO: Handle Error Case
  };

  return (
    <div className={styles.form__container}>
      <div className={styles.header__wrapper}>
        <h2 className={styles.heading}>Photography Booking Form</h2>
        <p className={styles.description}>
          Fill out all the details given below to the best of your interests.
        </p>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          values,
          setFieldValue,
          handleChange,
          handleSubmit,
          resetForm,
          errors,
          touched,
        }) => (
          <Form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.form__field}>
              <label className={styles.label}>Selected Vendor</label>
              <div className={styles.image__wrapper}>
                <div className={styles.img}>
                  {vendorDetails?.vendorImages &&
                  vendorDetails?.vendorImages.length > 0 ? (
                    <Image
                      src={vendorDetails?.vendorImages[0]}
                      fill
                      alt=""
                      unoptimized
                      quality={100}
                    />
                  ) : (
                    <Image
                      src={
                        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.veryicon.com%2Ficons%2Fbusiness%2Fnew-vision-2%2Fpicture-loading-failed-1.html&psig=AOvVaw0Z1LTY5xEyZ_8HqWEjwQXa&ust=1728645882622000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPiH5-_Zg4kDFQAAAAAdAAAAABAE"
                      }
                      fill
                      alt=""
                      unoptimized
                      quality={100}
                    />
                  )}
                </div>
                <div className={styles.description}>
                  {vendorDetails.companyName
                    ? vendorDetails.companyName
                    : "XYZ"}
                </div>
              </div>
            </div>

            <div className={styles.form__field}>
              <label className={styles.label} htmlFor="expectedHeadCount">
                Expected Head Count
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.expectedHeadCount &&
                  errors.expectedHeadCount &&
                  styles.redBorder
                }`}
              >
                <PeopleIcon className={styles.icon} />
                <div className={styles.verticalSeparator} />
                <input
                  type="number"
                  id="expectedHeadCount"
                  name="expectedHeadCount"
                  value={values.expectedHeadCount}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter expected head count"
                  required
                />
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.expectedHeadCount && errors.expectedHeadCount && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.expectedHeadCount}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label htmlFor="photoDeliveryFormat" className={styles.label}>
                Photo Delivery Format
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.photoDeliveryFormat &&
                  errors.photoDeliveryFormat &&
                  styles.redBorder
                }`}
              >
                <CollectionsIcon className={styles.icon} />
                <div className={styles.verticalSeparator} />
                <Select
                  id="photoDeliveryFormat"
                  name="photoDeliveryFormat"
                  value={values.photoDeliveryFormat}
                  onChange={(event) =>
                    setFieldValue("photoDeliveryFormat", event.target.value)
                  } // Using setFieldValue
                  displayEmpty
                  className={styles.selectInput}
                  size="small"
                  sx={{
                    m: -1,
                    border: "none", // Remove the border
                    outline: "none", // Remove the outline
                    ".MuiOutlinedInput-notchedOutline": { border: "none" }, // Remove border on hover/focus
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em>Choose a photo delivery format</em>; // Placeholder text
                    }
                    return selected;
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Select an option</em> {/* Placeholder */}
                  </MenuItem>
                  <MenuItem value="digital">Digital</MenuItem>
                  <MenuItem value="prints">Prints</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.photoDeliveryFormat && errors.photoDeliveryFormat && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.photoDeliveryFormat}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label htmlFor="photographyStyle" className={styles.label}>
                Photography Style
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.photographyStyle &&
                  errors.photographyStyle &&
                  styles.redBorder
                }`}
              >
                <AutoAwesomeIcon className={styles.icon} />
                <div className={styles.verticalSeparator} />
                <Select
                  id="photographyStyle"
                  name="photographyStyle"
                  value={values.photographyStyle}
                  onChange={(event) =>
                    setFieldValue("photographyStyle", event.target.value)
                  } // Using setFieldValue
                  displayEmpty
                  className={styles.selectInput}
                  size="small"
                  sx={{
                    m: -1,
                    border: "none", // Remove the border
                    outline: "none", // Remove the outline
                    ".MuiOutlinedInput-notchedOutline": { border: "none" }, // Remove border on hover/focus
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em>Choose a style</em>; // Placeholder text
                    }
                    return selected;
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Select an option</em> {/* Placeholder */}
                  </MenuItem>
                  <MenuItem value="candid">Candid</MenuItem>
                  <MenuItem value="traditional">Traditional</MenuItem>
                  <MenuItem value="journalistic">Journalistic</MenuItem>
                </Select>
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.photographyStyle && errors.photographyStyle && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.photographyStyle}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label className={styles.label} htmlFor="numberOfPhotographers">
                No. of Photographers
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.numberOfPhotographers &&
                  errors.numberOfPhotographers &&
                  styles.redBorder
                }`}
              >
                <PeopleIcon className={styles.icon} />
                <div className={styles.verticalSeparator} />
                <input
                  type="number"
                  id="numberOfPhotographers"
                  name="numberOfPhotographers"
                  value={values.numberOfPhotographers}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter no of photographers required"
                  required
                />
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.numberOfPhotographers &&
                  errors.numberOfPhotographers && (
                    <>
                      <ErrorIcon className={styles.icon} />
                      <div className={styles.message}>
                        {errors.numberOfPhotographers}
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label className={styles.label} htmlFor="specialRequests">
                Special Requests
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.specialRequests &&
                  errors.specialRequests &&
                  styles.redBorder
                }`}
              >
                <FaPenToSquare fontSize={18} style={{ color: "#007bff" }} />
                <div className={styles.verticalSeparator} />
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={values.specialRequests}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Specify any special requests"
                  required
                />
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.specialRequests && errors.specialRequests && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.specialRequests}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label htmlFor="durationOfCoverage" className={styles.label}>
                Duration of Coverage
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.durationOfCoverage &&
                  errors.durationOfCoverage &&
                  styles.redBorder
                }`}
              >
                <AccessTimeFilledIcon className={styles.icon} />
                <div className={styles.verticalSeparator} />
                <input
                  type="number"
                  id="durationOfCoverage"
                  name="durationOfCoverage"
                  value={values.durationOfCoverage}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter coverage duration"
                  required
                />
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.durationOfCoverage && errors.durationOfCoverage && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.durationOfCoverage}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.form__field}>
              <label htmlFor="additionalServices" className={styles.label}>
                Additional Services
              </label>
              <div
                className={`${styles.inputField__wrapper} ${
                  touched.additionalServices &&
                  errors.additionalServices &&
                  styles.redBorder
                }`}
              >
                <GrServices fontSize={18} style={{ color: "#007bff" }} />
                <div className={styles.verticalSeparator} />
                <Select
                  labelId="demo-multiple-chip-label"
                  id="demo-multiple-chip"
                  multiple
                  value={values.additionalServices}
                  onChange={(
                    event: SelectChangeEvent<typeof values.additionalServices>
                  ) => {
                    const {
                      target: { value },
                    } = event;
                    setFieldValue(
                      "additionalServices",
                      // On autofill we get a stringified value.
                      typeof value === "string" ? value.split(",") : value
                    );
                  }}
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Chip" />
                  }
                  renderValue={(selected) => {
                    if ((selected as string[]).length === 0) {
                      return <em>Choose multiple services</em>; // Placeholder text
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    );
                  }}
                  size="small"
                  sx={{
                    m: -1,
                    border: "none", // Remove the border
                    outline: "none", // Remove the outline
                    ".MuiOutlinedInput-notchedOutline": { border: "none" }, // Remove border on hover/focus
                  }}
                  MenuProps={additionalServicesMenuProps}
                  className={styles.selectInput}
                >
                  {additionalServicesList.map((additionalService, index) => (
                    <MenuItem
                      key={additionalService}
                      value={additionalService}
                      style={getStyles(
                        additionalService,
                        values.additionalServices,
                        theme
                      )}
                      disabled={index === 0}
                    >
                      {index === 0 ? (
                        <em>{additionalService}</em>
                      ) : (
                        <span>{additionalService}</span>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className={styles.errorMsg__wrapper}>
                {touched.additionalServices && errors.additionalServices && (
                  <>
                    <ErrorIcon className={styles.icon} />
                    <div className={styles.message}>
                      {errors.additionalServices}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.formFooter__wrapper}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" className={styles.confirmBtn}>
                Confirm
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PhotographerDetailsForm;
