import { NextRequest, NextResponse } from "next/server";
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
  const { emailId, userType } = await req.json();
  const cookieStore = cookies();
  const currentTime = Date.now();

  // Validate the request body
  if (!userType || !emailId || !emailId.endsWith("@gmail.com")) {
    return new NextResponse(JSON.stringify({ message: "Invalid credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const otpRequestsCookie = await cookieStore.get("otp_requests");
  const otpRequests: OTPRequest[] = otpRequestsCookie
    ? JSON.parse(otpRequestsCookie.value || "[]")
    : [];

  // Filter out requests older than an hour
  const validRequests = otpRequests.filter(
    (request) => currentTime - request.timestamp < 3600000
  );

  if (validRequests.length >= MAX_OTP_REQUESTS_PER_HOUR) {
    return new NextResponse(
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
  await cookieStore.set({
    name: "otp_requests",
    value: JSON.stringify(validRequests),
    httpOnly: true,
    path: "/",
    maxAge: 3600, // 1 hour
    expires: new Date(Date.now() + 3600 * 1000),
  });

  // Generate and send OTP (pseudo-code)
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Update the OTP in Firestore
  const otpDocRef = doc(firestore, "otps", "email", userType, emailId);
  await setDoc(otpDocRef, {
    otp,
    createdAt: serverTimestamp(),
  });

  // Send OTP via email service
  const emailServiceUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/emailService/`;
  const emailServicePayload = {
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
  };

  try {
    const response = await axios.post(emailServiceUrl, emailServicePayload);

    if (!response?.data?.sent) {
      console.error("Failed to send OTP. Response from email service:", response?.data);
      return new NextResponse(JSON.stringify({ message: "Failed to send OTP" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "OTP sent successfully", otp }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}