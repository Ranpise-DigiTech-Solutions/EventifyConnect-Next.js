import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { senderType, recipientEmailId, subject, message, bcc } = reqBody;

  if (
    !senderType ||
    !recipientEmailId ||
    !recipientEmailId?.endsWith("@gmail.com") ||
    !subject ||
    !message
  ) {
    return NextResponse.json(
      { sent: false, message: "Required fields not found!!" },
      { status: 400 } // Use 400 Bad Request for client-side errors
    );
  }

  let senderEmailId: string | undefined;
  let senderEmailPassword: string | undefined;
  let from: string | undefined;

  switch (senderType) {
    case "INFO_EC":
      senderEmailId = process.env.INFO_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.INFO_EC_EMAIL_PASSWORD;
      from = '"Info EC" <info@eventifyconnect.com>';
      break;
    case "ADMIN_EC":
      senderEmailId = process.env.ADMIN_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.ADMIN_EC_EMAIL_PASSWORD;
      from = '"Admin EC" <admin@eventifyconnect.com>';
      break;
    case "NOREPLY_EC":
      senderEmailId = process.env.NOREPLY_EC_EMAIL_ADDRESS;
      senderEmailPassword = process.env.NOREPLY_EC_EMAIL_PASSWORD;
      from = '"No-Reply EC" <no-reply@eventifyconnect.com>';
      break;
    default:
      return NextResponse.json(
        { sent: false, message: "Invalid sender type" },
        { status: 400 }
      );
  }

  // Check if environment variables are correctly set
  if (!senderEmailId || !senderEmailPassword) {
    console.error(`Sender details for ${senderType} not found in environment variables.`);
    return NextResponse.json(
      { sent: false, message: "Invalid sender details!!" },
      { status: 500 } // Use 500 for server-side misconfiguration
    );
  }

  const transporter = nodemailer.createTransport({
    host: "srv543385.hstgr.cloud",
    port: 465,
    secure: true,
    auth: {
      user: senderEmailId,
      pass: senderEmailPassword,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: recipientEmailId,
      bcc: bcc ? bcc : "",
      subject,
      html: message,
    });

    return NextResponse.json(
      { sent: true, message: "Mail sent successfully!", info },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to send mail:", error);
    return NextResponse.json(
      { sent: false, message: "Failed to send a mail!" },
      { status: 500 }
    );
  }
}