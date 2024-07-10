import type { NextRequest } from "next/server"
import mongoose from "mongoose";;
import connectDB from "@/lib/db/mongodb";
import { hallMaster } from '@/app/api/schemas';

export async function GET(req: NextRequest, { params } : { params: { hallId: string } }) {
    const filter : any = {};

    try {
      await connectDB(); // check database connection

      if(!params.hallId) {
        return new Response(JSON.stringify({ message: "Hall ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const hallObjectId = new mongoose.Types.ObjectId(params.hallId);
        filter['_id'] = hallObjectId;
      }

      const hallDetails = await hallMaster.find(filter);

      if(!hallDetails || hallDetails.length === 0) {
        return new Response(JSON.stringify({ message: "Hall not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(hallDetails), {
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