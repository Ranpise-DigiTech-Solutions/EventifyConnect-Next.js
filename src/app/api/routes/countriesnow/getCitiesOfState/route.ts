import type { NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryName = searchParams.get("countryName");
    const stateName = searchParams.get("stateName");

    if (!countryName || !stateName) {
      return new Response(
        JSON.stringify({
          error: "Invalid body attachment found!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries/state/cities`;

    const reqBody = {
      country: countryName,
      state: stateName,
    };

    const response = await axios.post(apiURL, reqBody);

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

    const cities = response.data?.data;

    if (!cities) {
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

    return new Response(JSON.stringify(cities), {
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
