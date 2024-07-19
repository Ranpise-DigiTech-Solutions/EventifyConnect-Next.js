import { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/db/firebase";
import { firebaseAdminAuth } from "@/lib/db/firebase-admin";

// Assuming you have a way to store and verify OTPs, e.g., a database or in-memory store

export async function POST(req: NextRequest) {
  const { inputOTP, userType, emailId, authType } = await req.json();
  // otp should be in string format
  if (!userType || !authType || !emailId || !inputOTP || typeof inputOTP === "number") {
    return new Response(
      JSON.stringify({ valid: false, message: "Invalid credentials" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const otpDocRef = doc(firestore, "otps", "email", userType, emailId); // Same path for retrieval
  const otpDoc = await getDoc(otpDocRef);

  if (otpDoc.exists()) {
    const otpData = otpDoc.data();
    const createdAt = otpData.createdAt.toMillis(); // Convert to milliseconds
    const currentTime = Date.now(); // Get current time in milliseconds
    const otpExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Check if OTP is valid
    if (parseInt(inputOTP) === otpData.otp && currentTime - createdAt < otpExpiryTime) {

      if(authType === "LOGIN") {
        // Authenticate user with Firebase Admin SDK
        const userRecord = await firebaseAdminAuth.getUserByEmail(emailId);
  
        if(!userRecord) {
          return new Response(
            JSON.stringify({ valid: false, message: "User not found" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
  
        // Generate a custom token
        const customToken = await firebaseAdminAuth.createCustomToken(
          userRecord.uid
        );
  
        return new Response(
          JSON.stringify({
            valid: true,
            message: "OTP verified successfully",
            signInToken: customToken,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else if (authType === "REGISTER") {
        return new Response(
          JSON.stringify({
            valid: true,
            message: "OTP verified successfully",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid OTP or expired" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ valid: false, message: "OTP not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
