import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import {
  serviceProviderMaster,
  customerMaster,
} from "@/app/api/schemas";
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
  const { userEmail, userPassword, userType } = await req.json();

  if (!userEmail || !userPassword || !userType) {
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

  if (!/\S+@\S+\.\S+/.test(userEmail)) {
    return new Response(JSON.stringify({ message: "Invalid email address" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/.test(userPassword)) {
    return new Response(
      JSON.stringify({
        message:
          "Password must contain at least 8 characters, including uppercase letters, lowercase letters, numbers, and special characters",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await connectDB(); // check database connection

    const user =
      userType === "CUSTOMER"
        ? await customerMaster.findOne({ customerEmail: userEmail })
        : await serviceProviderMaster.findOne({ vendorEmail: userEmail });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Sorry! operation failed." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const originalPassword = decrypt(
      userType === "CUSTOMER" ? user.customerPassword : user.vendorPassword
    );

    if (originalPassword !== userPassword) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!jwtSecretKey) {
      throw new Error("JWT_SECRET_KEY environment variable is not set.");
    }

    const accessToken = jwt.sign({ id: user._id }, jwtSecretKey, {
      expiresIn: "1w",
    });

    const { customerPassword, vendorPassword, ...info } = user._doc;

    return new Response(JSON.stringify({ accessToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
