import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

// ⚠️ The handler function is changed from GET to POST.
export async function POST(req: NextRequest) {
  try {
    // Correctly parse the request body for a POST request.
    const { countryName, stateName } = await req.json();

    // 🛡️ Enhanced validation to catch undefined, empty, or invalid values
    if (
      !countryName || countryName === "undefined" || countryName.trim() === "" ||
      !stateName || stateName === "undefined" || stateName.trim() === ""
    ) {
      console.warn("Invalid country/state received:", { countryName, stateName });
      return NextResponse.json(
        { error: "Missing or invalid country/state name" },
        { status: 400 }
      );
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries/state/cities`;
    const reqBody = {
      country: countryName,
      state: stateName,
    };

    console.log("Sending to CountriesNow API:", reqBody);

    const response = await axios.post(apiURL, reqBody);

    if (!response?.data?.data) {
      console.error("Invalid response from CountriesNow API:", response?.data);
      return NextResponse.json(
        { error: "Bad Gateway! Received invalid response from CountriesNow Server" },
        { status: 502 }
      );
    }

    const cities: string[] = response.data.data || [];

    if (cities.length === 0) {
      console.warn("No cities found for state:", stateName);
      return NextResponse.json(
        { error: "Bad Gateway! No cities returned from CountriesNow Server" },
        { status: 502 }
      );
    }

    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error("Unhandled error in getCities API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}