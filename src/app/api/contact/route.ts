import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  company: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  service: z.string().max(100).optional(),
  message: z.string().min(20).max(3000),
});

export async function POST(req: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, company, phone, service, message } = parsed.data;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // 1. Persist lead in Supabase
    const supabase = createServiceClient();
    await supabase.from("leads").insert({
      name,
      email,
      company: company ?? null,
      phone: phone ?? null,
      message,
      service_interest: service ?? null,
    });

    const toEmail = process.env.CONTACT_TO_EMAIL ?? "hello@hnbk.solutions";

    // 2. Notify Santhosh
    await resend.emails.send({
      from: "HNBK Contact <noreply@hnbk.solutions>",
      to: toEmail,
      replyTo: email,
      subject: `New enquiry from ${name}${company ? ` (${company})` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
          <h2 style="color:#A23BEC;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-weight:bold;width:120px;">Name</td><td>${name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${company ? `<tr><td style="padding:8px 0;font-weight:bold;">Company</td><td>${company}</td></tr>` : ""}
            ${phone ? `<tr><td style="padding:8px 0;font-weight:bold;">Phone</td><td>${phone}</td></tr>` : ""}
            ${service ? `<tr><td style="padding:8px 0;font-weight:bold;">Service</td><td>${service}</td></tr>` : ""}
          </table>
          <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:8px;">
            <p style="font-weight:bold;margin:0 0 8px;">Message:</p>
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    // 3. Confirmation to user
    await resend.emails.send({
      from: "Santhosh at HNBK <hello@hnbk.solutions>",
      to: email,
      subject: "Got your message — talk soon",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
          <h2 style="color:#A23BEC;">Thanks, ${name}!</h2>
          <p>I received your message and will be in touch within 24 hours to schedule a strategy call.</p>
          <p>In the meantime, feel free to reply to this email or call me directly at <a href="tel:+16478809350">(647) 880-9350</a>.</p>
          <p style="margin-top:24px;">— Santhosh<br/>HNBK</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Failed to process submission. Please try again." }, { status: 500 });
  }
}
