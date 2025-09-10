import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const apiURL = `https://countriesnow.space/api/v0.1/countries/positions`;

    const response = await axios.get(apiURL);

    // Check for a valid response object and data structure
    if (!response || !response.data || !response.data.data) {
      return NextResponse.json(
        {
          error: "Bad Gateway! Received invalid or empty response from CountriesNow API.",
        },
        { status: 502 }
      );
    }

    // Use a direct map to get country names and filter out any invalid entries
    const countries = response.data.data
      .map((country: any) => country?.name)
      .filter(Boolean); // Filters out null, undefined, or empty strings

    if (countries.length === 0) {
      return NextResponse.json(
        {
          error: "Bad Gateway! Received valid response, but no country data found.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(countries, { status: 200 });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}