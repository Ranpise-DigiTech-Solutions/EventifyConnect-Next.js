import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ref, set } from "firebase/database";
import { firebaseDb } from "@/lib/db/firebase";
import { serviceProviderMaster, customerMaster } from "@/app/api/schemas";
import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const algorithm = "aes-256-cbc";
const secretKey = process.env.PASSWORD_ENCRYPTION_SECRET_KEY;
const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (!secretKey) {
  throw new Error("PASSWORD_ENCRYPTION_SECRET_KEY environment variable is not set.");
}
if (!jwtSecretKey) {
  throw new Error("JWT_SECRET_KEY environment variable is not set.");
}

// Ensure the key is the correct length (32 bytes for aes-256)
const key = Buffer.from(secretKey, "hex");
if (key.length !== 32) {
  throw new Error("PASSWORD_ENCRYPTION_SECRET_KEY must be a 64-character hex string (32 bytes).");
}

function encrypt(text: string) {
  try {
    const iv = crypto.randomBytes(16);
    // Use a two-step type assertion (as unknown as ...) on both the key and IV
    // to satisfy the strict TypeScript compiler and resolve the error.
    const cipher = crypto.createCipheriv(
      algorithm, 
      key as unknown as crypto.CipherKey, 
      iv as unknown as crypto.BinaryLike
    );
    
    let encrypted = cipher.update(text, "utf8", "hex");
    
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Failed to encrypt password.");
  }
}

function decrypt(text: string) {
  try {
    const [ivHex, encryptedText] = text.split(":");
    if (!ivHex || !encryptedText) {
      throw new Error("Invalid encrypted text format.");
    }
    // Apply the same two-step type assertion for the decryption key and IV
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
    return null;
  }
}

async function saveUserToDatabase(userType: string, userData: any) {
  if (userType === "CUSTOMER") {
    const newCustomer = new customerMaster(userData);
    return await newCustomer.save();
  } else if (userType === "VENDOR") {
    const newVendor = new serviceProviderMaster(userData);
    return await newVendor.save();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { userType, data, user } = await req.json();

    if (!data || !user || !userType || Object.keys(data).length === 0 || Object.keys(user).length === 0) {
      return NextResponse.json(
        { message: "Required body attachment not found!!" },
        { status: 400 }
      );
    }

    if (userType !== "VENDOR" && userType !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingCustomers = await customerMaster.findOne({
      $or: [{ customerEmail: data.email }, { customerContact: data.phone }],
    });
    const existingVendors = await serviceProviderMaster.findOne({
      $or: [{ vendorEmail: data.email }, { vendorContact: data.phone }],
    });

    if (existingCustomers || existingVendors) {
      return NextResponse.json(
        { message: "Email or phone already exists" },
        { status: 409 }
      );
    }

    const cipherText = encrypt(data.password);

    let newUser;
    if (userType === "CUSTOMER") {
      newUser = {
        customerUid: user.uid,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPassword: cipherText,
        customerContact: data.phone,
        customerCurrentLocation: data.location,
        programId: "USER",
      };
    } else {
      newUser = {
        vendorUid: user.uid,
        vendorName: data.fullName,
        vendorTypeId: data.vendorTypeInfo,
        vendorCurrentLocation: data.location,
        vendorContact: data.phone,
        vendorEmail: data.email,
        vendorPassword: cipherText,
        vendorCompanyName: data.brandName,
        vendorLocation: data.cityName,
        eventTypes: data.eventTypesInfo,
        programId: "USER",
      };
    }

    const savedDocument = await saveUserToDatabase(userType, newUser);
    if (!savedDocument) {
      throw new Error("Failed to save user document to MongoDB.");
    }
    
    const userRef = ref(firebaseDb, `Users/${user.uid}`);
    await set(userRef, {
      userType,
      name: data.fullName,
      email: data.email,
      contact: data.phone,
      _id: savedDocument._id.toString(),
    });

    const accessToken = jwt.sign({ id: savedDocument._id }, jwtSecretKey!, {
      expiresIn: "1w",
    });

    return NextResponse.json(
      { accessToken },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
