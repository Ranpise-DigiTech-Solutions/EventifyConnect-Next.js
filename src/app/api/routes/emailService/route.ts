// pages/api/sendEmail.ts

import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

// senderType : INFO_EC, ADMIN_EC, NOREPLY_EC

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { senderType, recipientEmailId, subject, message, bcc } = reqBody;

  if (!senderType || !recipientEmailId || !recipientEmailId?.endsWith("@gmail.com") || !subject || !message) {
    return new Response(
      JSON.stringify({ sent: false, message: "Required fields not found!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  

  let senderEmailId: string | undefined = "";
  let senderEmailPassword: string | undefined = "";
  let from: string | undefined = "";

  switch (senderType) {
    case "INFO_EC":
      senderEmailId = process.env.INFO_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.INFO_EC_EMAIL_PASSWORD;
      from = '"Info EC" <info@eventifyconnect.com>'
      break;
    case "ADMIN_EC":
      senderEmailId = process.env.ADMIN_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.ADMIN_EC_EMAIL_PASSWORD;
      from = '"Admin EC" <admin@eventifyconnect.com>'
      break;
    case "NOREPLY_EC":
      senderEmailId = process.env.NOREPLY_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.NOREPLY_EC_EMAIL_PASSWORD;
      from = '"No-Reply EC" <no-reply@eventifyconnect.com>'
      break;
    default:
      break;
  }

  if (
    !senderEmailId ||
    !senderEmailId?.endsWith("@eventifyconnect.com") ||
    !senderEmailPassword
  ) {
    return new Response(
      JSON.stringify({ sent: false, message: "Invalid sender details!!" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Replace with your Hostinger SMTP details
  let transporter = nodemailer.createTransport({
    host: "eventifyconnect.com",
    port: 587,
    secure: false, //should not use the implicit SSL/TLS protocol (SMTPS) on a dedicated port (like port 465), but rather start with a plain text connection and then upgrade it to a secure connection using the STARTTLS command
    auth: {
      user: senderEmailId,
      pass: senderEmailPassword,
    },
  });

  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: from,
      to: recipientEmailId,
      bcc: bcc ? bcc : "",
      subject: subject,
      html: message,
    });

    return new Response(
      JSON.stringify({ sent: true, message: "Mail sent successfully! ", info }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ sent: false, message: "Failed to send a mail!" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
