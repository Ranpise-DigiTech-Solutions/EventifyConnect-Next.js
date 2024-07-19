import type { NextRequest } from "next/server";
import { firebaseAdminAuth } from "@/lib/db/firebase-admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get('emailId');

    if(!emailId) {
        return new Response(
            JSON.stringify({ error: "Missing required parameters" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
    }

  try {
    const userRecord = await firebaseAdminAuth.getUserByEmail(emailId);

    if (!userRecord) {
      return new Response(JSON.stringify({ exists: false, message: "No user details found with the given email!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ exists: true, message: "User is valid!" }), {
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