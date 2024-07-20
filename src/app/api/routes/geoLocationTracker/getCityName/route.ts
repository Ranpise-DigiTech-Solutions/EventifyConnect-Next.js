import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const hereAppId = process.env.HERE_APP_ID;
    const hereApiKey = process.env.HERE_API_KEY;

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ message: "Required body attachment missing!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${hereApiKey}&appCode=${hereAppId}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {

        const cityName = data["items"][0]["address"]["city"];
        const countryName = data["items"][0]["address"]["countryName"];
        return new Response(JSON.stringify(cityName + ", " + countryName), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      })

   
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
