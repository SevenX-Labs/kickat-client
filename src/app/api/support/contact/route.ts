import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// In-memory rate limiting: max 5 requests per 15 minutes per IP
const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many contact submissions. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      subject,
      category,
      message,
    } = body;

    const customerName = (name || `${firstName || ""} ${lastName || ""}`).trim();
    const customerEmail = (email || "").trim().toLowerCase();
    const customerPhone = (phone || "").trim();
    const contactSubject = (subject || category || "General Support Inquiry").trim();
    const contactMessage = (message || "").trim();

    // 1. Validations
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!contactMessage || contactMessage.length < 5) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 5 characters long." },
        { status: 400 }
      );
    }

    if (contactMessage.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum allowed length of 5000 characters." },
        { status: 400 }
      );
    }

    // 2. SMTP Transporter Configuration
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER || "sahilhode67@gmail.com";
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
    const smtpFrom = process.env.SMTP_FROM || `Kickat Support <${smtpUser}>`;
    const adminRecipients = Array.from(new Set([smtpUser, "kickat2021@gmail.com"])).filter(Boolean);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const timestampFormatted = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // 3. Admin Notification HTML Email Template
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>New KickAt Support Request</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6F0; margin: 0; padding: 24px; color: #211C15; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EBE5DB; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .header { background: #1A1D20; padding: 24px 28px; text-align: left; }
          .header-title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
          .badge { display: inline-block; background: #F99205; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; margin-top: 8px; text-transform: uppercase; }
          .content { padding: 28px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #F0ECE4; font-size: 14px; }
          .info-table td.label { font-weight: 600; color: #78746D; width: 30%; background: #FAF8F5; }
          .info-table td.value { color: #1A1D20; font-weight: 500; }
          .message-box { background: #FAF6F0; border-left: 4px solid #F99205; padding: 18px 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #211C15; white-space: pre-wrap; word-break: break-word; }
          .footer { background: #FAF8F5; padding: 18px 28px; font-size: 12px; color: #8A847C; border-top: 1px solid #EBE5DB; text-align: center; }
          .btn-reply { display: inline-block; background: #F99205; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin-top: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="header-title">🐾 New Customer Support Inquiry</h1>
            <span class="badge">Ticket ID: ${ticketId}</span>
          </div>
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="label">Customer Name</td>
                <td class="value"><strong>${customerName}</strong></td>
              </tr>
              <tr>
                <td class="label">Email Address</td>
                <td class="value"><a href="mailto:${customerEmail}" style="color: #F99205; text-decoration: none;">${customerEmail}</a></td>
              </tr>
              <tr>
                <td class="label">Phone Number</td>
                <td class="value">${customerPhone ? `<a href="tel:${customerPhone}" style="color: #211C15; text-decoration: none;">${customerPhone}</a>` : '<span style="color: #999;">Not provided</span>'}</td>
              </tr>
              <tr>
                <td class="label">Subject / Category</td>
                <td class="value"><strong>${contactSubject}</strong></td>
              </tr>
              <tr>
                <td class="label">Submitted At</td>
                <td class="value">${timestampFormatted}</td>
              </tr>
            </table>

            <h3 style="font-size: 14px; font-weight: 700; color: #78746D; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">Customer Message:</h3>
            <div class="message-box">${contactMessage}</div>

            <div style="text-align: center;">
              <a href="mailto:${customerEmail}?subject=Re: [KickAt Support ${ticketId}] ${encodeURIComponent(contactSubject)}" class="btn-reply">
                Reply to ${customerName}
              </a>
            </div>
          </div>
          <div class="footer">
            Sent securely from KickAt Store Support Portal • IP: ${ip}
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Send Email to Admin Team
    await transporter.sendMail({
      from: smtpFrom,
      to: adminRecipients,
      replyTo: `${customerName} <${customerEmail}>`,
      subject: `[KickAt Support ${ticketId}] ${contactSubject} - from ${customerName}`,
      text: `Ticket: ${ticketId}\nFrom: ${customerName} (${customerEmail})\nPhone: ${customerPhone || "N/A"}\nSubject: ${contactSubject}\nDate: ${timestampFormatted}\n\nMessage:\n${contactMessage}`,
      html: adminEmailHtml,
    });

    // 5. Send Auto-Confirmation Receipt to Customer (asynchronous background)
    transporter
      .sendMail({
        from: smtpFrom,
        to: customerEmail,
        subject: `We've received your request [${ticketId}] - KickAt Support`,
        text: `Hi ${customerName},\n\nThank you for reaching out to KickAt! We have received your inquiry regarding "${contactSubject}" (Ticket ID: ${ticketId}).\n\nOur pet care support team is reviewing your message and will get back to you shortly.\n\nYour Message:\n${contactMessage}\n\nBest regards,\nThe KickAt Team\nhttps://kickat.co.in`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #211C15;">
            <h2 style="color: #F99205;">🐾 Hello ${customerName},</h2>
            <p style="font-size: 15px; line-height: 1.6;">Thank you for contacting <strong>KickAt Pet Care</strong>! We have received your inquiry and our support team is on it.</p>
            <div style="background: #FAF6F0; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid #EBE5DB;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #78746D;"><strong>Ticket ID:</strong> ${ticketId}</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #78746D;"><strong>Subject:</strong> ${contactSubject}</p>
              <p style="margin: 0; font-size: 13px; color: #78746D;"><strong>Expected Response Time:</strong> Within 2–4 hours (Business Hours)</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #4A453E;">If you need urgent assistance, you can also reach us directly on WhatsApp or call at <strong>+91 98765 43210</strong>.</p>
            <hr style="border: none; border-top: 1px solid #EBE5DB; margin: 24px 0;" />
            <p style="font-size: 12px; color: #8A847C; text-align: center;">KickAt Pet Care Services • Premium Nutrition for Happy Pets</p>
          </div>
        `,
      })
      .catch((err) => {
        console.warn("Auto-confirmation email could not be sent:", err);
      });

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Your message has been sent successfully! Our support team will get back to you shortly.",
    });
  } catch (error: any) {
    console.error("Support Contact API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Could not send your message right now. Please try again or contact us via WhatsApp/Phone.",
      },
      { status: 500 }
    );
  }
}
