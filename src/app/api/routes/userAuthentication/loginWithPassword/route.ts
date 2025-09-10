import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { serviceProviderMaster, customerMaster } from "@/app/api/schemas";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const algorithm = "aes-256-cbc"; // Algorithm to use for encryption
const secretKey = process.env.PASSWORD_ENCRYPTION_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "PASSWORD_ENCRYPTION_SECRET_KEY environment variable is not set."
  );
}

const key = Buffer.from(secretKey, "hex"); // Secret key, should be 32 bytes

function decrypt(text: string) {
  try {
    const [ivHex, encryptedText] = text.split(":");
    // Check if the input text is in the expected format
    if (!ivHex || !encryptedText) {
      console.error("Decryption failed: Input string is not in 'iv:encryptedText' format.");
      return null; // Return null or throw an error
    }

    const decipher = crypto.createDecipheriv(
      algorithm,
      key as unknown as crypto.CipherKey,
      Buffer.from(ivHex, "hex") as unknown as crypto.BinaryLike
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return null; // Return null on decryption failure
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userEmail, userPassword, userType } = await req.json();

    console.log("Login attempt for:", { userEmail, userType });

    if (!userEmail || !userPassword || !userType) {
      console.log("Validation failed: Missing body attachments.");
      return NextResponse.json(
        { message: "Required body attachment not found!!" },
        { status: 404 }
      );
    }

    if (userType !== "VENDOR" && userType !== "CUSTOMER") {
      console.log("Validation failed: Invalid user type:", userType);
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 404 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(userEmail)) {
      console.log("Validation failed: Invalid email format:", userEmail);
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 404 }
      );
    }

    await connectDB();

    const user =
      userType === "CUSTOMER"
        ? await customerMaster.findOne({ customerEmail: userEmail })
        : await serviceProviderMaster.findOne({ vendorEmail: userEmail });

    if (!user) {
      console.log(`User not found for email: ${userEmail} and type: ${userType}`);
      return NextResponse.json(
        { message: "Sorry! operation failed." },
        { status: 404 }
      );
    }

    console.log("User found in DB:", {
      _id: user._id,
      email: userType === "CUSTOMER" ? user.customerEmail : user.vendorEmail
    });
    
    const encryptedPassword =
      userType === "CUSTOMER" ? user.customerPassword : user.vendorPassword;

    // Log the encrypted password from the database
    console.log("Encrypted Password from DB:", encryptedPassword);

    const originalPassword = decrypt(encryptedPassword);
    
    // Log the decrypted password to verify decryption
    console.log("Decrypted Password:", originalPassword);
    
    if (originalPassword === null) {
      console.error("Password decryption failed.");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 404 }
      );
    }
    
    if (originalPassword !== userPassword) {
      console.log("Password mismatch! Entered:", userPassword, "Decrypted:", originalPassword);
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 404 }
      );
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!jwtSecretKey) {
      console.error("JWT_SECRET_KEY is not set.");
      throw new Error("JWT_SECRET_KEY environment variable is not set.");
    }

    const accessToken = jwt.sign({ id: user._id }, jwtSecretKey, {
      expiresIn: "1w",
    });

    const userInfo = user.toObject();
    if (userType === "CUSTOMER") {
      delete userInfo.customerPassword;
    } else {
      delete userInfo.vendorPassword;
    }

    console.log("Login successful!");
    return NextResponse.json(
      { accessToken, user: userInfo },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error during login:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}