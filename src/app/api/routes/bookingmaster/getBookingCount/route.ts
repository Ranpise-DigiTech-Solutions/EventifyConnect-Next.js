import type { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { bookingMaster } from '@/app/api/schemas';

export async function GET(req: NextRequest) {
  const filter = {};

  try {
    await connectDB();  // check database connection

    const bookingCount = await bookingMaster.countDocuments(filter);

    if (typeof bookingCount !== "number") {
        return new Response(JSON.stringify({message: "Connection to server failed!"}), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
    }

    
    return new Response(JSON.stringify(bookingCount), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
