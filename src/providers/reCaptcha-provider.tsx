"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import React from "react";

interface Props {
    children: React.ReactNode
}

const ReCaptchaProvider = ({ children }: Props) => {
    // Access the environment variable
    const reCaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_V3_RECAPTCHA_SITE_KEY;

    // Conditionally render the provider only if the key is available
    if (!reCaptchaSiteKey) {
        // Log an error or return a message to prevent silent failures
        console.error("ReCAPTCHA site key is not defined. Please set NEXT_PUBLIC_GOOGLE_V3_RECAPTCHA_SITE_KEY in your .env file.");
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={reCaptchaSiteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}

export default ReCaptchaProvider;