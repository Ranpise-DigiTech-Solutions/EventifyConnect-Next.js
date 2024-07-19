import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { ref, set } from 'firebase/database';
import { firebaseDb } from "@/lib/db/firebase";
import {
  serviceProviderMaster,
  customerMaster,
} from "@/app/api/schemas";
import axios from 'axios';
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
const iv = crypto.randomBytes(16); // Initialization vector, should be 16 bytes

function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text: string) {
  const [iv, encryptedText] = text.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function POST(req: NextRequest) {
  const { userType, data, user } = await req.json();

  console.log(userType, data, user);

  if (!data || data.length === 0 || !user || user.length === 0 || !userType) {
    return new Response(
      JSON.stringify({ message: "Required body attachment not found!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (userType !== "VENDOR" && userType !== "CUSTOMER") {
    return new Response(JSON.stringify({ message: "Invalid user type" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB(); // check database connection

    const cipherText = encrypt(data.password);

    const existingCustomers = await customerMaster.find({
        $or: [
            { "customerEmail": data.email },
            { "customerContact": data.phone }
        ]
    });

    const existingVendors = await serviceProviderMaster.find({
        $or: [
            { "vendorEmail": data.email },
            { "vendorContact": data.phone }
        ]
    });

    if (existingCustomers.length > 0 || existingVendors.length > 0) {
        return new Response(
          JSON.stringify({ message: "Email or phone already exists" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
    }

    const response = userType === "CUSTOMER" ? await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/customerMaster/`, {
        customerUid: user.uid,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPassword: cipherText,
        customerContact: data.phone,
        customerCurrentLocation: data.location,
        programId: "USER"
    }) : await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/routes/serviceProviderMaster/`, {
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
        programId: "USER"
    });

    console.log("PUSHED DATA TO MONGO");

    const userRef = ref(firebaseDb, 'Users/' + user.uid);
    await set(userRef, {
        userType: userType,
        name: data.fullName,
        email: data.email,
        contact: data.phone,
        _id: response.data._id,
    });

    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!jwtSecretKey) {
      throw new Error("JWT_SECRET_KEY environment variable is not set.");
    }

    const accessToken = jwt.sign(
        { id: response.data._id },
        jwtSecretKey,
        { expiresIn: "1w"}
    );

    return new Response(JSON.stringify({ accessToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
