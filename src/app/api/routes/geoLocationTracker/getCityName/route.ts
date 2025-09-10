import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const hereAppId = process.env.HERE_APP_ID;
    const hereApiKey = process.env.HERE_API_KEY;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { message: "Required body attachment missing!" },
        { status: 400 }
      );
    }

    const apiUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${hereApiKey}&appCode=${hereAppId}`;
    
    // ⚠️ Corrected asynchronous handling: await the fetch call
    const response = await fetch(apiUrl);
    const data = await response.json();

    // ⚠️ Check for valid data before trying to access it
    if (!data || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { message: "Could not retrieve location data." },
        { status: 502 }
      );
    }

    const cityName = data.items[0].address.city;
    const countryName = data.items[0].address.countryName;
    
    // ⚠️ Return the final processed data
    return NextResponse.json(`${cityName}, ${countryName}`, {
      status: 200,
    });
  } catch (error) {
    console.error("Error in reverse geocoding API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}