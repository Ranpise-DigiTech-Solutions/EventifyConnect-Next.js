"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import React from "react";

interface Props {
    children: React.ReactNode
}

const ReCaptchaProvider = ({ children } : Props)=> {
    const reCaptchaSiteKey : string | undefined = process?.env?.NEXT_PUBLIC_GOOGLE_V3_RECAPTCHA_SITE_KEY;

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={reCaptchaSiteKey ?? "NOT DEFINED"}
        >
            {children}
        </GoogleReCaptchaProvider>
    )
}

export default ReCaptchaProvider;