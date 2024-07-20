"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks/use-redux-store";
import { message } from "antd";
import axios from "axios";
import OTPInput from "react-otp-input";
import { LoadingScreen } from "@/components/sub-components";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import {
  toggleUserAuthStateChangeFlag,
} from "@/redux/slices/user-info";
import useRecaptcha from "@/lib/hooks/use-reCaptcha-v3";
import styles from "./otp-verification-form.module.scss";

type Props = {
  emailId: string;
  userType: string;
  authType: string;
  handleDialogClose: () => void;
  handleIsOTPVerified: () => void;
};

const OtpVerificationFormSubContainer = ({
  emailId,
  userType,
  authType,
  handleDialogClose,
  handleIsOTPVerified
}: Props) => {
  const dispatch = useAppDispatch();
  const firebaseAuth = getAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [otp, setOTP] = useState<string>("");
  const [OTPTimeLeft, setOTPTimeLeft] = useState<number>(0);
  const token = useRecaptcha(); // get recaptcha token
  const [loadingScreen, setLoadingScreen] = useState<boolean>(true); // toggle Loading Screen
  const otpRequestSent = useRef(false); // Track if OTP request has been sent

  const displaySuccessMessage = () => {
    messageApi.open({
      type: "success",
      content: "OTP sent successfully!",
    });
  };

  const displayErrorMessage = () => {
    messageApi.open({
      type: "error",
      content: "Sorry! Something went wrong.",
    });
  };

  // handle otp events
  const handleOtpChange = (otp: string) => {
    setOTP(otp);
  };

  // validate otp
  useEffect(() => {
    if (!otp) {
      return;
    }

    const validateOTP = async (otp: string) => {
      setLoadingScreen(true);
      try {
        const response = await axios.post(
          "/api/routes/userAuthentication/validateOTP",
          {
            inputOTP: otp,
            userType,
            emailId,
            authType
          }
        );
        const { signInToken, valid } = response.data;

        if (authType === "LOGIN" && !signInToken) {
          displayErrorMessage();
          setLoadingScreen(false);
          handleDialogClose();
        }
        
        if(authType === "LOGIN") {
          await signInWithCustomToken(firebaseAuth, signInToken);
          dispatch(toggleUserAuthStateChangeFlag());
          handleDialogClose();
        } else if (authType === "REGISTER") {
          handleIsOTPVerified();
        }
        setLoadingScreen(false);
      } catch (error) {
        displayErrorMessage();
        setLoadingScreen(false);
        handleDialogClose();
      }
    };

      if (otp.length === 6) {
        validateOTP(otp);
      }
  }, [otp]);

  // set 1 min timer
  useEffect(() => {
    // Exit early when we reach 0
    if (OTPTimeLeft === 0) {
      return;
    }

    // Save intervalId to clear the interval when the component re-renders
    const intervalId = setInterval(() => {
      setOTPTimeLeft((prev) => prev - 1);
    }, 1000);

    // Clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [OTPTimeLeft]);

  const getOTP = async () => {
    if (otpRequestSent.current) return; // Prevent duplicate calls
    otpRequestSent.current = true;
    
    try {
      const response = await axios.post(
        "/api/routes/userAuthentication/generateOTP/",
        {
          userType,
          emailId,
        }
        , {
          headers: {
            'Content-Type': 'application/json',
            'X-Captcha-Token': token,
          },
          withCredentials: true // Include credentials (cookies, authorization headers, TLS client certificates)
        }
      );
      if (typeof response?.data?.otp === "number") {
        setOTPTimeLeft(60);
        displaySuccessMessage();
      } else {
        displayErrorMessage();
        handleDialogClose();
      }
      setLoadingScreen(false);
    } catch (error: any) {
      setLoadingScreen(false);
      displayErrorMessage();
      handleDialogClose();
    }
  };

  // generate otp
  useEffect(() => {
    if (token && !otpRequestSent.current) {
      getOTP();
    }
  }, [token]);

  return (
    <>
      {contextHolder}
      {loadingScreen && <LoadingScreen />}
      <div className={styles.otpVerificationForm__subContainer}>
        <div className={styles.sub__title}>Verification code</div>
        <div className={styles.sub__desc}>
          Enter the code sent to your email address
        </div>
        <div className={styles.otp__wrapper}>
          <OTPInput
            value={otp}
            onChange={handleOtpChange}
            numInputs={6}
            shouldAutoFocus
            renderInput={(props) => <input {...props} />}
            inputStyle={{
              width: "2rem",
              height: "2rem",
              margin: "0 0.5rem",
              padding: "0",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid rgba(0,0,0,0.3)",
            }}
            containerStyle={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              marginBottom: "1rem",
            }}
          />
        </div>
        <div
          className={`${styles.comment} ${
            OTPTimeLeft === 0 && styles["comment__cursor-allowed"]
          }`}
        >
          Didn&apos;t receive a code?{" "}
          <span
            onClick={() => {
              if (!otpRequestSent.current) {
                setLoadingScreen(true);
                getOTP();
              }
            }}
          >
            Resend (00:{OTPTimeLeft.toString().padStart(2, "0")})
          </span>
        </div>
      </div>
    </>
  );
};

export default OtpVerificationFormSubContainer;
