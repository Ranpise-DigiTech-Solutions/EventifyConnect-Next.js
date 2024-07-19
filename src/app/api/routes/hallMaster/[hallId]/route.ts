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

export async function PATCH(req: NextRequest, { params } : { params: { hallId: string } }) {
    const updatedFields = await req.json();
    let hallObjectId;

    if(!params.hallId) {
      return new Response(JSON.stringify({ message: "Hall ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      hallObjectId = new mongoose.Types.ObjectId(params.hallId);
    }

    if(!updatedFields || updatedFields.length === 0) {
      return new Response(JSON.stringify({ message: "Data is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    try {
      await connectDB(); // check database connection

      const updatedResource = await hallMaster.findOneAndUpdate(
        { _id: hallObjectId },
        { $set: updatedFields },
        { new: true }
      );

      if(!updatedResource || updatedResource.length === 0) {
        return new Response(JSON.stringify({ message: "Hall not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(updatedResource), {
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

export async function DELETE(req: NextRequest, { params } : { params: { hallId: string } }) {
    let hallObjectId;

    if(!params.hallId) {
      return new Response(JSON.stringify({ message: "Hall ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      hallObjectId = new mongoose.Types.ObjectId(params.hallId);
    }
  
    try {
      await connectDB(); // check database connection

      const deletedHall = await hallMaster.findByIdAndDelete(hallObjectId);

      if(!deletedHall || deletedHall.length === 0) {
        return new Response(JSON.stringify({ message: "Hall not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message: 'Document deleted successfully.', deletedHall }), {
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

