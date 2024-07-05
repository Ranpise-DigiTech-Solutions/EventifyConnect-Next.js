import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {

    // implement chatbot

    return new Response(JSON.stringify({message: "Chatbot under development!!"}), {
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