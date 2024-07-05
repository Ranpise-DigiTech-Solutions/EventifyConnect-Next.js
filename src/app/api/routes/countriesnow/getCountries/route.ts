import type { NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const apiURL = `https://countriesnow.space/api/v0.1/countries/positions`;

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

    const countries: Array<any> = [];

    response.data.data?.map((country: any) => countries.push(country?.name));

    if (countries.length === 0) {
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

    return new Response(JSON.stringify(countries), {
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
