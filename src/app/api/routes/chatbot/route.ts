import type { NextRequest } from "next/server";

import { collection, addDoc, query, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/db/firebase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if(!sessionId) {
        return new Response(JSON.stringify({ error: "Missing session ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const messagesQuery = query(collection(firestore, `/chats/SessionID_${sessionId}/Messages/`));
    const querySnapshot = await getDocs(messagesQuery);
    const fetchedMessages = querySnapshot.docs.map((doc) => doc.data());


    return new Response(JSON.stringify(fetchedMessages), {
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

export async function POST(req: NextRequest) {
  try {
    const {sessionId, inputValue, sender} : {sessionId: string, inputValue: any, sender: string} = await req.json();

    if(!sessionId || !inputValue || !sender) {
        return new Response(JSON.stringify({ error: "Request Body attachment not found!!" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const docRef = await addDoc(collection(firestore, `/chats/SessionID_${sessionId}/Messages/`), {
        content: inputValue,
        sender ,
        timestamp: new Date().toISOString(),
      });

    return new Response(JSON.stringify("Document uploaded successfully! " + docRef), {
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