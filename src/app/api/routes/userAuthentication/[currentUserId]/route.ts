import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { customerMaster, serviceProviderMaster, vendorTypes } from "@/app/api/schemas";
import { ref, get } from "firebase/database";
import { firebaseDb } from "@/lib/db/firebase";

export async function GET(
  req: NextRequest,
  { params }: { params: { currentUserId: string } }
) {
  try {
    const { currentUserId } = params;

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Invalid User Id!" },
        { status: 400 }
      );
    }

    await connectDB();

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
        if (userRecord && userRecord.vendorTypeId) {
          vendorRecord = await vendorTypes.findById(userRecord.vendorTypeId);
        }
      }

      if (!userRecord) {
        return NextResponse.json(
          { message: "User data not found in MongoDB." },
          { status: 404 }
        );
      }

      const responseData = {
        UID: currentUserId,
        userType: userType,
        vendorType: vendorRecord?.vendorType || null,
        Document: {
          ...userRecord.toObject(),
          customerPassword: undefined,
          vendorPassword: undefined,
        },
      };

      return NextResponse.json(responseData, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Couldn't find any data with the given id!" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}