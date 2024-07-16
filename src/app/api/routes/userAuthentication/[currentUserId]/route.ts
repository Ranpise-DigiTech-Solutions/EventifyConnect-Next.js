import type { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster } from "@/app/api/schemas";
import { ref, get } from "firebase/database";
import { firebaseDb } from "@/lib/db/firebase";
import { serviceProviderMaster, vendorTypes } from "@/app/api/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: { currentUserId: string } }
) {
  try {
    await connectDB(); // check database connection

    const currentUserId = params.currentUserId;

    if (!currentUserId) {
      return new Response(JSON.stringify({ message: "Invalid User Id!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userRef = ref(firebaseDb, "Users/" + currentUserId);

    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();

      let userRecord;
      let vendorRecord = null;
      const userType = userData.userType;

      if (userType === "CUSTOMER") {
        userRecord = await customerMaster.findById(userData._id);
      } else if (userType === "VENDOR") {
        userRecord = await serviceProviderMaster.findById(userData._id);
        vendorRecord = await vendorTypes.findById(userRecord.vendorTypeId);
      }

      console.log(userRecord);
      return new Response(
        JSON.stringify({
          UID: currentUserId,
          Document: userRecord,
          userType: userType,
          vendorType: vendorRecord?.vendorType,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Couldn't find any data with the given id!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
