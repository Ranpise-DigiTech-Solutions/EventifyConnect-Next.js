"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PinterestIcon from "@mui/icons-material/Pinterest";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

import styles from "./footer.module.scss";
import {
  UnderConstructionPopup,
  ContactForm,
} from "@/components/sub-components";

type Props = {};

const FooterComponent = (props: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDialog, setOpenDialog] = useState(false);
  const [openSendMessageDialog, setOpenSendMessageDialog] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false); // to toggle snackBar

  const constructionMessage =
    "This section is under construction. We will provide details soon.";
  const handleLinkClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSendMessageDialogOpen = () => {
    setOpenSendMessageDialog(true);
  };

  const handleSendMessageDialogClose = () => {
    setOpenSendMessageDialog(false);
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

  const mapLink =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.5045085375023!2d73.1332210737419!3d19.260414546160078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be796881823811b%3A0xc9e1a4474c36940c!2sRanpise%20DigiTech%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1711347263461!5m2!1sen!2sin";

  return (
    <div className={styles.footer__container} id="footer">
      <Snackbar
        open={isMessageSent}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        message="Thank you for connecting! We'll get back to you soon!!"
        action={snackBarAction}
      />
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
      <div className={styles.company__logo}>
        <h2>EventifyConnect</h2>
      </div>
      <div className={styles.wrapper_1}>
        <div className={styles.sub__wrapper_1}>
          <div className={styles.links}>
              <div className={styles.link__grp_1}>
                <p onClick={handleLinkClick}>Our Blog</p>
                <p onClick={handleLinkClick}>Our Service</p>
                <p>FAQs</p>
                <p>
                  <a href="#contact-form" onClick={handleSendMessageDialogOpen}>Contact Us</a>
                </p>
              </div>
              <div className={styles.link__grp_2}>
                <p><a href="#aboutUs">About Us</a></p>
                <p><Link href="/careers">Careers</Link></p>
                <p><Link href="/privacy-policy">Privacy Policy</Link></p>
                <p><Link href="/cancellation-refund-policy">Cancellation Policy</Link></p>
                <p><Link href="/terms-and-conditions">Terms and Conditions</Link></p>
              </div>
            </div>
          <div className={styles.icons}>
            <FacebookIcon className={styles.icon} />
            <InstagramIcon className={styles.icon} />
            <XIcon className={styles.icon} />
            <LinkedInIcon className={styles.icon} />
            <PinterestIcon className={styles.icon} />
          </div>
          <div className={styles.app_icon_description}>
            {" "}
            For better experience, download the eventifyConnect app now
          </div>
          <div className={styles.app__download__icons}>
            <a
              href="https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE_NAME"
              title="play_store"
            >
              <Image
                src={"/images/play-store-icon.png"}
                alt="Download from Play Store"
                width={150}
                height={0}
                layout="intrinsic"
                className={styles.playstore}
              />
            </a>
            <a
              href="https://apps.apple.com/YOUR_APP_STORE_LINK"
              title="app_store"
            >
              <Image
                src={"/images/app-store-icon.png"}
                alt="Download from App Store"
                className={styles.appstore}
                width={150}
                height={0}
                layout="intrinsic"
              />
            </a>
          </div>
        </div>
        <div className={styles.sub__wrapper_middle}>
          <div id="map-container">
            <iframe
              src={mapLink}
              width="370"
              height="350"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className={styles['operating-hours']}>
            <p> Open Hour 9.30 AM - 6.30 PM</p>
          </div>
        </div>
      </div>
      <div className={styles.wrapper_2}>
        <div className={styles.line__separator}></div>
        <div className={styles.copyright__info}>
          <p>Copyright &copy;2024 All rights reserved</p>
          <p>Made by Ranpise DigiTech Solutions</p>
        </div>
      </div>
      <UnderConstructionPopup
        open={openDialog}
        handleClose={handleCloseDialog}
        message={constructionMessage}
      />
    </div>
  );
};

export default FooterComponent;
