import nodemailer from 'nodemailer';

interface SendVerificationEmailOptions {
  toEmail: string;
  handle: string;
  code: string;
  token: string;
}

export async function sendVerificationEmail({
  toEmail,
  handle,
  code,
  token,
}: SendVerificationEmailOptions): Promise<{ success: boolean; devMode: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'AutoDB Verification <verify@autodb.tech>';
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autodb.tech';

  const magicLink = `${appBaseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  // If SMTP is not configured, log to server console for seamless dev/testing
  if (!host || !user || !pass) {
    console.log(`
┌─────────────────────────────────────────────────────────────────┐
│ 📧 [AUTODB EMAIL VERIFICATION — DEV / LOCAL FALLBACK]          │
├─────────────────────────────────────────────────────────────────┤
│ To:           ${toEmail} (${handle})
│ 6-Digit Code: ${code}
│ Magic Link:   ${magicLink}
│ Status:       SMTP not configured. Copy code or click link.    │
└─────────────────────────────────────────────────────────────────┘
    `);
    return { success: true, devMode: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `Verify your AutoDB Contributor Account (${code})`,
      text: `Hello ${handle},\n\nYour 6-digit AutoDB verification code is: ${code}\n\nAlternatively, verify instantly by clicking this link:\n${magicLink}\n\nThis verification link expires in 24 hours.\n\n— The AutoDB Team\nPrecision Vehicle Telemetry`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">AutoDB</span>
            <span style="font-size: 11px; font-weight: 700; color: #E11D48; background: #e0f7fa; padding: 2px 8px; border-radius: 6px; margin-left: 8px;">VERIFICATION</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Verify your email address</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Hello <strong>${handle}</strong>, enter the code below to claim your <strong>Verified Contributor</strong> badge on AutoDB:</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f172a;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #475569;">Or click the button below to verify with one click:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${magicLink}" style="display: inline-block; background-color: #E11D48; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 9999px;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">This verification link expires in 24 hours. If you did not request this, you can ignore this message.</p>
        </div>
      `,
    });

    return { success: true, devMode: false };
  } catch (err: any) {
    console.error('Failed to send verification email via SMTP:', err);
    return { success: false, devMode: false, error: err.message || 'SMTP transmission failure' };
  }
}
