// src/app/api/routes/countriesNow/getCitiesOfCountry/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { countryName } = await req.json();

    if (!countryName || countryName.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid country name" },
        { status: 400 }
      );
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries/cities`;
    const reqBody = { country: countryName };

    try {
      const response = await axios.post(apiURL, reqBody);

      if (!response?.data?.data) {
        console.error("Invalid response from CountriesNow API:", response.data);
        return NextResponse.json(
          { error: "Bad Gateway! Received invalid response from CountriesNow Server" },
          { status: 502 }
        );
      }

      const cities: string[] = response.data.data || [];
      return NextResponse.json(cities, { status: 200 });
    } catch (axiosError) {
      if (axios.isAxiosError(axiosError)) {
        console.error("Error from CountriesNow API:", axiosError.response?.data);
        return NextResponse.json(
          { error: "External API Error", details: axiosError.response?.data || axiosError.message },
          { status: axiosError.response?.status || 502 }
        );
      }
      throw axiosError;
    }
  } catch (error) {
    console.error("Unhandled error in getCitiesOfCountry API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}