import { Resend } from "resend";
import { env } from "../../config/env.config";

const resend = new Resend(env.resend_api_key);

export const sendOtpMail = async (to: string, otp: string): Promise<void> => {
  try {
    if (!env.resend_api_key) {
      console.warn(`⚠️ [CONFIG ERROR] RESEND_API_KEY is missing. OTP for ${to}: ${otp} (View this in logs instead)`);
      return; // Skip sending but don't crash
    }

    const { data, error } = await resend.emails.send({
      from: "ZenFit <noreply@zenfit.space>",
      to: [to],
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
    });

    if (error) {
      console.warn("⚠️ Resend API returned error:", error.message);
      
      // Check for Resend restrictions (e.g., if domain verification hasn't propagated yet)
      const isRestrictionError = 
        error.message.toLowerCase().includes("unpermitted") || 
        error.message.toLowerCase().includes("own email address") ||
        error.message.toLowerCase().includes("restricted");

      if (isRestrictionError) {
        console.warn(`💡 [MANUAL VERIFICATION] OTP for ${to}: ${otp} (Bypassing Resend restriction)`);
        return; 
      }
      
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${to}: ${data?.id}`);
  } catch (err: any) {
    console.warn("❌ Mail Service Exception:", err.message || err);
    console.warn(`💡 [FALLBACK] OTP for ${to}: ${otp}`);
    
    const isSuppressedError = 
      err.message?.toLowerCase().includes("unpermitted") || 
      err.message?.toLowerCase().includes("own email address") ||
      err.message?.toLowerCase().includes("restricted");

    if (isSuppressedError) {
      return; 
    }
    
    throw err;
  }
};
