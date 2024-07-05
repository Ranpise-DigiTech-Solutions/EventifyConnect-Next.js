// import type { NextRequest } from "next/server";
// import connectDB from "@/lib/db/mongodb";
// import { customerMaster } from "@/app/api/schemas";

// export async function PATCH(req: NextRequest) {

//   try {
//     await connectDB(); // check database connection

//     const customerCount = await customerMaster.countDocuments(filter);

//     if (typeof customerCount !== "number") {
//       return new Response(JSON.stringify({ message: "No data found!" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return new Response(JSON.stringify(customerCount), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Internal server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
