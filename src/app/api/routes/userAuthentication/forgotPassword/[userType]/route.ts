import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster, vendorMaster } from "@/app/api/schemas";
import axios from "axios";
// Corrected import path to your new utility file
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/utils/email"; 

export async function POST(req: NextRequest, { params }: { params: { userType: string } }) {
  try {
    await connectDB(); // Ensure database connection
    
    // Extract the dynamic segment 'userType' from the URL path.
    const { userType } = params;
    const { email } = await req.json();

    // Check for a valid user type
    if (!userType || (userType !== 'CUSTOMER' && userType !== 'VENDOR')) {
      return NextResponse.json({ error: "Invalid user type provided" }, { status: 400 });
    }
    
    // Perform captcha validation
    const captchaToken = req.headers.get("X-Captcha-Token");
    if (!captchaToken) {
      return NextResponse.json({ message: "Missing captcha token!" }, { status: 401 });
    }
    
    const reCaptchaResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/reCaptchaValidation/v3/`, { token: captchaToken });
    
    if (!reCaptchaResponse.data.success) {
      return NextResponse.json({ message: "Invalid reCAPTCHA response" }, { status: 400 });
    }

    let user;
    if (userType === 'CUSTOMER') {
      user = await customerMaster.findOne({ customerEmail: email });
    } else if (userType === 'VENDOR') {
      user = await vendorMaster.findOne({ vendorEmail: email });
    }

    if (!user) {
      // Return a success message even if the user isn't found to prevent email enumeration attacks.
      return NextResponse.json({ message: "If a matching account was found, a password reset link has been sent to the email address." }, { status: 200 });
    }

    // Corrected function calls: passing the userType as the second argument
    const resetToken = await createPasswordResetToken(user, userType); 
    await sendPasswordResetEmail(user.email, resetToken, userType);

    return NextResponse.json({ message: "Password reset link sent to your email." }, { status: 200 });
  } catch (error) {
    console.error("Error during password reset request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
