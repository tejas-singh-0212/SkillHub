import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// In-memory OTP store (works for single-server deployments / hackathon demos)
// Key: email, Value: { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired OTPs periodically
function cleanExpired() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(email);
  }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    cleanExpired();

    // Rate-limit: if an OTP was sent less than 30s ago, reject
    const existing = otpStore.get(email);
    if (existing && existing.expiresAt - 4.5 * 60 * 1000 > Date.now()) {
      return NextResponse.json(
        { error: "Please wait 30 seconds before requesting a new OTP" },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp, expiresAt });

    // Try to send via email if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || "587"),
          secure: smtpPort === "465",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"SkillHub" <${smtpUser}>`,
          to: email,
          subject: "Your SkillHub Login OTP",
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f1f5f9; font-size: 24px; margin: 0;">🔐 SkillHub</h1>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Login Verification</p>
              </div>
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center;">
                <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Your one-time verification code is:</p>
                <div style="background: rgba(59,130,246,0.15); border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px; margin: 0 auto; display: inline-block;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #60a5fa; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 16px;">This code expires in <strong style="color: #f59e0b;">5 minutes</strong></p>
              </div>
              <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("Failed to send OTP email:", emailErr);
        otpStore.delete(email); // Clean up since email wasn't sent
        return NextResponse.json(
          { error: "Failed to send OTP email. Please check email configuration." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 }
    );
  }
}

// Export the store so the verify route can access it
export { otpStore };
