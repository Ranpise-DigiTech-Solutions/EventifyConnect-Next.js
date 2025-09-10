"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useAppDispatch } from "@/lib/hooks/use-redux-store";
import { message } from "antd";
import axios from "axios";
import OTPInput from "react-otp-input";
import { LoadingScreen } from "@/components/sub-components";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { toggleUserAuthStateChangeFlag } from "@/redux/slices/user-info";
import styles from "./otp-verification-form.module.scss";

type Props = {
  emailId: string;
  userType: string;
  authType: string;
  handleDialogClose: () => void;
  handleIsOTPVerified: () => void;
};

const OTPVerificationForm = ({
  emailId,
  userType,
  authType,
  handleDialogClose,
  handleIsOTPVerified,
}: Props) => {
  const dispatch = useAppDispatch();
  const firebaseAuth = getAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [otp, setOTP] = useState<string>("");
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(0);
  const [loadingScreen, setLoadingScreen] = useState<boolean>(true);
  const isMounted = useRef(true);
  const otpSent = useRef(false); // track if OTP has been sent

  // Memoized message functions
  const displaySuccessMessage = useCallback(() => {
    messageApi.open({ type: "success", content: "OTP sent successfully!" });
  }, [messageApi]);

  const displayErrorMessage = useCallback(() => {
    messageApi.open({ type: "error", content: "Sorry! Something went wrong." });
  }, [messageApi]);
  
  const displayOtpValidationError = useCallback(() => {
    messageApi.open({ type: "error", content: "OTP verification failed. Please try again." });
  }, [messageApi]);

  const handleOtpChange = (newOtp: string) => {
    setOTP(newOtp);
  };

  // Send OTP
  const generateOTP = useCallback(async () => {
    if (otpSent.current) return;
    
    setLoadingScreen(true);
    otpSent.current = true;
    
    try {
      const response = await axios.post(
        "/api/routes/userAuthentication/generateOTP/",
        { userType, emailId },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (typeof response?.data?.otp === "number") {
        setOtpTimeLeft(60);
        displaySuccessMessage();
      } else {
        otpSent.current = false;
        displayErrorMessage();
        handleDialogClose();
      }
    } catch (error) {
      console.error(error);
      otpSent.current = false;
      displayErrorMessage();
      handleDialogClose();
    } finally {
      if (isMounted.current) setLoadingScreen(false);
    }
  }, [userType, emailId, handleDialogClose, displaySuccessMessage, displayErrorMessage]);

  // Validate OTP
  const validateOTP = useCallback(async (inputOTP: string) => {
    setLoadingScreen(true);
    try {
      const response = await axios.post("/api/routes/userAuthentication/validateOTP", {
        inputOTP,
        userType,
        emailId,
        authType,
      });

      const { signInToken, valid } = response.data;

      if (authType === "LOGIN") {
        if (!signInToken) {
          displayOtpValidationError();
          setOTP("");
        } else {
          await signInWithCustomToken(firebaseAuth, signInToken);
          dispatch(toggleUserAuthStateChangeFlag());
          handleDialogClose();
        }
      } else if (authType === "REGISTER" && valid) {
        handleIsOTPVerified();
      } else {
        displayOtpValidationError();
        setOTP("");
      }
    } catch (error) {
      console.error(error);
      displayErrorMessage();
      handleDialogClose();
    } finally {
      if (isMounted.current) setLoadingScreen(false);
    }
  }, [authType, emailId, userType, handleDialogClose, handleIsOTPVerified, dispatch, firebaseAuth, displayErrorMessage, displayOtpValidationError]);

  // Send OTP on mount
  useEffect(() => {
    if (isMounted.current && !otpSent.current) {
      generateOTP();
    }
  }, [generateOTP]);

  // Countdown timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (otpTimeLeft > 0) {
      intervalId = setInterval(() => {
        setOtpTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [otpTimeLeft]);

  // Auto-validate when OTP reaches 6 digits
  useEffect(() => {
    if (otp.length === 6) {
      validateOTP(otp);
    }
  }, [otp, validateOTP]);

  const handleResendClick = () => {
    if (otpTimeLeft === 0) {
      otpSent.current = false;
      generateOTP();
    }
  };

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
          className={`${styles.comment} ${otpTimeLeft === 0 && styles["comment__cursor-allowed"]}`}
        >
          Didn&apos;t receive a code?{" "}
          <span onClick={handleResendClick}>
            Resend (00:{otpTimeLeft.toString().padStart(2, "0")})
          </span>
        </div>
      </div>
    </>
  );
};

export default memo(OTPVerificationForm);
