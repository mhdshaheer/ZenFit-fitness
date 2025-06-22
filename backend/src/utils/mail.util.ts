import nodemailer from "nodemailer";
import { env } from "../config/env.config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.mail_user,
    pass: env.mail_password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOtpMail = async (to: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: env.mail_user,
    to,
    subject: "Your OTP for Account Verification",
    html: `
      <div style="font-family: sans-serif;">
        <h2>Hello 👋,</h2>
        <p>Here is your OTP for verifying your account:</p>
        <h1 style="color: green;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
