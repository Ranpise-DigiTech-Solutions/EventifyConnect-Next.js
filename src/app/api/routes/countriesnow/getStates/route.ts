import type { NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryName = searchParams.get("countryName");

    if(!countryName) {
        return new Response(
            JSON.stringify({
              error:
                "Invalid country name!",
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );  
    }

    const apiURL = `https://countriesnow.space/api/v0.1/countries/states`;

    const reqBody = {
      country: countryName,
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

    const states: Array<any> = [];

    response.data.data?.states?.map((state: any) => states.push(state?.name));

    if (states.length === 0) {
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

    return new Response(JSON.stringify(states), {
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
