import { NextRequest } from "next/server"; // Ensure correct imports
import axios from "axios";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/db/firebase";
import { cookies } from "next/headers";

// @TODO: Change this back to 3
const MAX_OTP_REQUESTS_PER_HOUR = 100;

interface OTPRequest {
  timestamp: number;
}

export async function POST(req: NextRequest) {
  // Check if the request has a valid email address
  const { emailId, token, userType } = await req.json();
  if (!token || !userType || !emailId || !emailId.endsWith("@gmail.com")) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check weather the user is valid
  const reCaptchaResponse = await axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`,
    data: {
      token,
    },
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  });

  if (reCaptchaResponse.data.success === false) {
    return new Response(
      JSON.stringify({ message: "Invalid reCAPTCHA response" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Adjust the response type
  const cookieStore = cookies();
  const currentTime = Date.now();
  const otpRequestsCookie = cookieStore.get("otp_requests");
  console.log(otpRequestsCookie);
  const otpRequests: OTPRequest[] = otpRequestsCookie?.value
    ? JSON.parse(otpRequestsCookie.value || "")
    : [];

  // Filter out requests older than an hour
  const validRequests = otpRequests.filter(
    (request) => currentTime - request.timestamp < 3600000
  );

  if (validRequests.length >= MAX_OTP_REQUESTS_PER_HOUR) {
    return new Response(
      JSON.stringify({
        message: "Too many OTP requests. Please try again later.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Add new request to the list
  validRequests.push({ timestamp: currentTime });

  // Update cookie
  cookieStore.set({
    name: "otp_requests",
    value: JSON.stringify(validRequests),
    httpOnly: true,
    path: "/",
    maxAge: 3600, // 1 hour
    expires: new Date(Date.now() + 3600 * 1000),
  });

  // Generate and send OTP (pseudo-code)
  const otp = Math.floor(100000 + Math.random() * 900000);

  // update the otp in database with timer
  const otpDocRef = doc(firestore, "otps", "email", userType, emailId);
  await setDoc(otpDocRef, {
    otp,
    createdAt: serverTimestamp(),
  });

  console.log("ENTERED")

  //send OTP to email
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/emailService/`,
    {
      senderType: "INFO_EC",
      recipientEmailId: emailId,
      subject: "EventifyConnect - OTP Verification",
      message: `
          <p>Dear ${userType === "CUSTOMER" ? "Customer" : "Vendor"},</p>

          <p>Thank you for using our services. Please find your OTP (One-Time Password) below for verification:</p>

          <p><strong>OTP:</strong> ${otp}</p>

          <p>Please use this OTP within <strong> 5 </strong> minutes to complete your verification process. For security reasons, do not share this OTP with anyone.</p>

          <p>If you did not request this OTP, please ignore this email.</p>

          <p>Thank you,<br/>

          EventifyConnect Team</p>
      `,
    }
  );

  console.log(response.data);

  if (!response?.data?.sent) {
    return new Response(JSON.stringify({ message: "Failed to send OTP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "OTP sent successfully", otp }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
