// pages/api/sendEmail.ts

import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {

    const receiverEmailIds = [, process.env.RAVINDRA_RAGHAVAN_EMAIL_ADDRESS, process.env.SAMADHAN_RANPISE_EMAIL_ADDRESS]

  if (req.method === 'POST') {
    // Replace with your Hostinger SMTP details
    let transporter = nodemailer.createTransport({
      host: 'eventifyconnect.com',
      port: 587,
      secure: false, //should not use the implicit SSL/TLS protocol (SMTPS) on a dedicated port (like port 465), but rather start with a plain text connection and then upgrade it to a secure connection using the STARTTLS command
      auth: {
        // user: process.env.CONTACT_FORM_EMAIL_ADDRESS, // Your email address
        // pass: process.env.CONTACT_FORM_EMAIL_PASSWORD, // Your password
        user: process.env.CONTACT_FORM_EMAIL_ADDRESS,
        pass: process.env.CONTACT_FORM_EMAIL_PASSWORD
      },
    });

    

    try {
      // Send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Admin EC" <admin@eventifyconnect.com>',
        to: 'adithyaiyer72@gmail.com',
        subject: 'Hello from Next.js TypeScript',
        text: 'This is a test email sent from a Next.js API route using TypeScript.',
      });

      console.log('Message sent: %s', info.messageId);
      return new Response(JSON.stringify("Mail sent successfully!"), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify("Failed to send a mail!"), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
    }
  } else {
    // res.setHeader('Allow', ['POST']);
    return new Response(JSON.stringify(`Method ${req.method} not allowed!`), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  }
}
