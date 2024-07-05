import type { NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryName = searchParams.get("countryName");

    if (!countryName) {
      return new Response(JSON.stringify({ error: "Missing session ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries`;

    const response = await axios.get(apiURL);

    if (!response) {
      return new Response(
        JSON.stringify({
          error:
            "Bad Gateway! Received Invalid response from CountriesNow Server",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const formatCity = (city: any, country: any) => `${city}, ${country}`;
    const indianCities = response.data.data
      .filter(({ country }: { country: any }) => country === countryName)
      .map(({ country, cities }: { country: any; cities: any }) =>
        cities.map((city: any) => formatCity(city, country))
      )
      .flat();

    return new Response(JSON.stringify(indianCities), {
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
