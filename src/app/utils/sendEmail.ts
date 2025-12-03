import nodemailer from "nodemailer";
import { envVars } from "../config/envVars";
import AppError from "../errorHelpers/AppError";

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_CONFIG.SMTP_HOST,
  port: Number(envVars.SMTP_CONFIG.SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.SMTP_CONFIG.SMPT_USER,
    pass: envVars.SMTP_CONFIG.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    await transporter.sendMail({
      from: `"Travel Clique" <${envVars.SMTP_CONFIG.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new AppError(500, "Email sending failed");
  }
};
