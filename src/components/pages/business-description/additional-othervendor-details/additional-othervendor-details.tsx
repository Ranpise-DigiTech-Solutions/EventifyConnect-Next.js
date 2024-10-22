"use client";

import React, { useState } from "react";
import styles from "./additional-othervendor-details.module.scss";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { useAppSelector } from "@/lib/hooks/use-redux-store";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar } from "@mui/material";
import { ContactForm } from "@/components/sub-components";
// import PhotographerRegistrationForm from "@/components/global/photographer-registration-form/photographer-registration-form";
// import { FilteredSearchComponent } from "@/components/global";

type Props = {
  //@TODO: assign type of vendor data using mongodb schema
  otherVendorData?: any;
};

const AdditionalOtherVendorDetails = ({ otherVendorData }: Props) => {
  const userInfoStore = useAppSelector((state) => state.userInfo);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openSignInAlertDialog, setOpenSignInAlertDialog] =
    useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); //user login status
  const [openSendMessageDialog, setOpenSendMessageDialog] =
    useState<boolean>(false);
  const [openContactInfoDialog, setOpenContactInfoDialog] =
    useState<boolean>(false);
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false);

  // const [open, setOpen] = useState(false);

  // const handleDialogOpen = () => {
  //   setOpen(true);
  // }

  // const handleDialogClose = () => {
  //   setOpen(false);
  // }

  const handleSignInAlertDialogOpen = () => {
    setOpenSignInAlertDialog(true);
  };

  const handleSignInAlertDialogClose = () => {
    setOpenSignInAlertDialog(false);
  };

  const handleSendMessageDialogOpen = () => {
    setOpenSendMessageDialog(true);
  };

  const handleSendMessageDialogClose = () => {
    setOpenSendMessageDialog(false);
  };

  const handleContactInfoDialogOpen = () => {
    setOpenContactInfoDialog(true);
  };

  const handleContactInfoDialogClose = () => {
    setOpenContactInfoDialog(false);
  };

  const handleSnackBarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsMessageSent(false);
  };

  const snackBarAction = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleSnackBarClose}>
        Un-Send
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackBarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div className={styles.additionalOtherVendorDetails__container}>
      {/* <FilteredSearchComponent open handleClose={handleDialogClose}/> */}
    <Snackbar
        open={isMessageSent}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        message="Thank you for connecting! We'll get back to you soon!!"
        action={snackBarAction}
      />
      {/* Sign-In Alert Dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openSignInAlertDialog}
        onClose={handleSignInAlertDialogClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-description"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Sign-In Required"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To access this feature, please sign in to your account. Signing in
            will allow you to continue using the application and access
            additional functionalities. Thank you for your cooperation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSignInAlertDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      {/* Send Message Dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openSendMessageDialog}
        onClose={handleSendMessageDialogClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="responsive-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <div
          className={styles.sendMessageDialog__wrapper}
          style={{ padding: "2rem", backgroundColor: "#333333" }}
        >
          <ContactForm setIsSuccess={setIsMessageSent} />
        </div>
      </Dialog>
      <div className={styles.pricingInformation__wrapper}>
        <div className={styles.title__wrapper}>
          <p className={styles.title}>Starting price</p>
          <div className={styles.dropDown__wrapper}>
            <p className={styles.dropDown__title}>Pricing Info</p>
            <KeyboardArrowDownIcon className={styles.icon} />
          </div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.pricing__wrapper}>
          <div className={styles.rate__wrapper}>
            <CurrencyRupeeIcon className={styles.icon} />
            <p>
              {otherVendorData?.hallVegRate ? otherVendorData?.hallVegRate : 0}{" "}
              per plate <span>(taxes extra)</span>
            </p>
          </div>
          <div className={styles["sub-title"]}>Veg</div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.pricing__wrapper}>
          <div className={styles.rate__wrapper}>
            <CurrencyRupeeIcon className={styles.icon} />
            <p>
              {otherVendorData?.hallNonVegRate
                ? otherVendorData?.hallNonVegRate
                : 0}{" "}
              per plate <span>(taxes extra)</span>
            </p>
          </div>
          <div className={styles["sub-title"]}>Non-Veg</div>
        </div>
        <div className={styles.lineSeparator}></div>
        <div className={styles.contactBtn__wrapper}>
          <button className={styles.btn} onClick={handleSendMessageDialogOpen}>
            <MailOutlineIcon className={styles.icon} />
            <p className={styles["btn-caption"]}>Send Message</p>
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              if (isUserLoggedIn) {
                handleContactInfoDialogOpen();
              } else {
                handleSignInAlertDialogOpen();
              }
            }}
          >
            <PhoneIcon className={styles.icon} />
            <p className={styles["btn-caption"]}>View Contact</p>
          </button>
          {/* <button onClick={handleDialogOpen}>
            Click
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default AdditionalOtherVendorDetails;
