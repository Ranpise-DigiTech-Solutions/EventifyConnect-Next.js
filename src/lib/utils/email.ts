import jwt from "jsonwebtoken";
import { customerMaster, vendorMaster } from "@/app/api/schemas"; // Import both schemas
import { ObjectId } from "mongodb";
import axios from "axios";

// This secret should be stored securely in your environment variables.
const JWT_SECRET = process.env.JWT_SECRET || "a-strong-and-secure-secret";

// Function to create a password reset token and save it to the user
export const createPasswordResetToken = async (user: any, userType: string) => {
  const token = jwt.sign({ userId: user._id, type: userType }, JWT_SECRET, {
    expiresIn: "1h", // Token is valid for 1 hour
  });

  const hashedToken = jwt.sign({ resetToken: token }, JWT_SECRET);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  if (userType === 'CUSTOMER') {
    await customerMaster.updateOne({ _id: new ObjectId(user._id) }, {
      passwordResetToken: hashedToken,
      passwordResetExpires: oneHourFromNow,
    });
  } else if (userType === 'VENDOR') {
    await vendorMaster.updateOne({ _id: new ObjectId(user._id) }, {
      passwordResetToken: hashedToken,
      passwordResetExpires: oneHourFromNow,
    });
  }

  return token;
};

// Function to send the password reset email using your emailService
export const sendPasswordResetEmail = async (userEmail: string, resetToken: string, userType: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/reset-password?token=${resetToken}&userType=${userType}`;

  const emailPayload = {
    to: userEmail,
    subject: "Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${resetUrl}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>` +
          `<p>Please click on the following link to complete the process:</p>` +
          `<a href="${resetUrl}">Reset Password</a>` +
          `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
  };

  try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/emailService`, emailPayload);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // You might want to handle this error more gracefully
  }
};
