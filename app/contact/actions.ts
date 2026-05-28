"use server";

import { getPayload } from "payload";
import config from "@/payload.config";
import nodemailer from "nodemailer";

interface ContactData {
  name: string;
  email: string;
  projectTypes: string[];
  budget: string;
  message: string;
}

export async function submitContactForm(data: ContactData) {
  try {
    // 1. Save to Payload CMS database using Local API
    const payload = await getPayload({ config });
    const entry = await payload.create({
      collection: "contacts",
      data: {
        name: data.name,
        email: data.email,
        projectTypes: data.projectTypes.map((t) => ({ type: t })),
        budget: data.budget,
        message: data.message,
      },
    });

    // 2. Send Emails using Nodemailer via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "davidadebayo702@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "frdovhwgloyqhlii",
      },
    });

    // Email to David Adebayo (Admin Notification)
    const adminMailOptions = {
      from: `"Portfolio contact" <${process.env.GMAIL_USER || "davidadebayo702@gmail.com"}>`,
      to: "davidadebayo702@gmail.com",
      subject: `🔥 New Project Inquiry from ${data.name}`,
      html: `
        <div style="background-color: #080808; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif; padding: 40px; border-radius: 8px; border: 1px solid #1a1a1a; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C8FF00; font-size: 24px; border-bottom: 1px solid #1a1a1a; padding-bottom: 20px; margin-top: 0; font-weight: 600; letter-spacing: 0.5px;">New Project Request</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #888888; width: 120px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Name:</td>
              <td style="padding: 10px 0; color: #ffffff; font-size: 16px;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888888; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email:</td>
              <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #C8FF00; text-decoration: none; font-size: 16px;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888888; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Services:</td>
              <td style="padding: 10px 0; color: #ffffff; font-size: 16px;">${data.projectTypes.join(", ") || "None selected"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888888; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Budget:</td>
              <td style="padding: 10px 0; color: #C8FF00; font-weight: bold; font-size: 18px;">${data.budget}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; background-color: #0c0c0c; border: 1px solid #1a1a1a; padding: 25px; border-radius: 6px;">
            <div style="color: #888888; font-weight: bold; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</div>
            <div style="color: #e0e0e0; line-height: 1.7; white-space: pre-wrap; font-size: 15px;">${data.message}</div>
          </div>
          
          <div style="margin-top: 40px; font-size: 12px; color: #555555; text-align: center; border-top: 1px solid #1a1a1a; padding-top: 20px;">
            Sent from xtremedavid.dev portfolio dashboard.
          </div>
        </div>
      `,
    };

    // Email to client (Receipt Notification)
    const clientMailOptions = {
      from: `"David Adebayo" <${process.env.GMAIL_USER || "davidadebayo702@gmail.com"}>`,
      to: data.email,
      subject: `Thanks for reaching out, ${data.name.split(" ")[0]}!`,
      html: `
        <div style="background-color: #080808; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif; padding: 45px; border-radius: 8px; border: 1px solid #1a1a1a; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 28px; font-weight: bold; color: #ffffff; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px;">
            DAVID<span style="color: #C8FF00;">ADEBAYO</span>
          </div>
          
          <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin-top: 0; line-height: 1.4;">
            Let's build something the world remembers.
          </h2>
          
          <p style="color: #b0b0b0; line-height: 1.7; font-size: 16px; margin-top: 20px;">
            Hi ${data.name.split(" ")[0]},
          </p>
          
          <p style="color: #b0b0b0; line-height: 1.7; font-size: 16px;">
            Thank you for reaching out and sharing details about your project. I have received your inquiry and will review it shortly. You can typically expect a response from me within 24 hours.
          </p>
          
          <div style="margin-top: 35px; border-left: 2px solid #C8FF00; padding-left: 20px; margin-bottom: 35px;">
            <div style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Inquiry Details:</div>
            <div style="color: #ffffff; font-size: 15px; margin-bottom: 4px;"><strong>Services:</strong> ${data.projectTypes.join(", ") || "Custom"}</div>
            <div style="color: #ffffff; font-size: 15px;"><strong>Budget Range:</strong> <span style="color: #C8FF00; font-weight: bold;">${data.budget}</span></div>
          </div>
          
          <p style="color: #b0b0b0; line-height: 1.7; font-size: 16px;">
            I look forward to discussing how we can turn your vision into a premium digital experience.
          </p>
          
          <div style="margin-top: 45px; border-top: 1px solid #1a1a1a; padding-top: 25px;">
            <table style="width: 100%;">
              <tr>
                <td>
                  <div style="color: #ffffff; font-weight: bold; font-size: 16px;">David Adebayo</div>
                  <div style="color: #888888; font-size: 14px; margin-top: 2px;">UI/UX Designer & Software Engineer</div>
                  <div style="margin-top: 12px;">
                    <a href="https://www.behance.net/xtremedavid" style="color: #C8FF00; text-decoration: none; font-size: 14px; margin-right: 15px;">Behance</a>
                    <a href="https://www.linkedin.com/in/david-adebayo/" style="color: #C8FF00; text-decoration: none; font-size: 14px; margin-right: 15px;">LinkedIn</a>
                    <a href="https://x.com/xtremedaviddev" style="color: #C8FF00; text-decoration: none; font-size: 14px;">X / Twitter</a>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      `,
    };

    // Send emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(clientMailOptions),
    ]);

    return { success: true, id: entry.id };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: error.message || "Failed to submit form" };
  }
}
