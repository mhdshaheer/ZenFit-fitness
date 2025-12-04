import nodemailer from "nodemailer";
import { env } from "../../config/env.config";

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
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 480px;">
        <h2 style="margin-bottom: 8px;">ZenFit Verification Code</h2>
        <p style="margin: 0 0 12px;">Hello,</p>
        <p style="margin: 0 0 16px;">
          Use the one-time passcode below to verify your account. For your security, the code expires in five minutes.
        </p>
        <p style="font-size: 32px; font-weight: 600; letter-spacing: 6px; margin: 24px 0; color: #111827;">
          ${otp}
        </p>
        <p style="margin: 0 0 12px;">If you did not request this verification, you can safely ignore this email.</p>
        <p style="margin: 0;">Regards,<br/>ZenFit Support</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
