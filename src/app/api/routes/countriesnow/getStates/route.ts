import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

// ⚠️ Change the handler from GET to POST
export async function POST(req: NextRequest) {
  try {
    // ✅ Retrieve countryName from the request body for a POST request
    const { countryName } = await req.json();

    if (!countryName || countryName.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid country name" },
        { status: 400 }
      );
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries/states`;
    const reqBody = { country: countryName };

    const response = await axios.post(apiURL, reqBody);

    if (!response?.data?.data) {
      return NextResponse.json(
        { error: "Bad Gateway! Invalid response from CountriesNow Server" },
        { status: 502 }
      );
    }

    const states: string[] =
      response.data.data.states?.map((state: any) => state?.name).filter(Boolean) || [];

    if (states.length === 0) {
      return NextResponse.json(
        { error: "Bad Gateway! No states returned from CountriesNow Server" },
        { status: 502 }
      );
    }

    return NextResponse.json(states, { status: 200 });
  } catch (error) {
    console.error("Unhandled error in getStates API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}