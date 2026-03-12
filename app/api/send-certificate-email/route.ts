import { NextRequest, NextResponse } from "next/server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// ── MailerSend client ─────────────────────────────────────────────────────────
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN ?? "",
});

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attendeeName, attendeeEmail, eventName, txHash, nftId } = body as {
      attendeeName: string;
      attendeeEmail: string;
      eventName: string;
      txHash?: string;
      nftId?: string;
    };

    // ── Debug: log incoming payload ───────────────────────────────────────────
    console.log("[send-certificate-email] Payload received:", {
      attendeeName,
      attendeeEmail,
      eventName,
      txHash,
      nftId,
    });

    if (!attendeeName || !attendeeEmail || !eventName) {
      return NextResponse.json(
        { success: false, error: "attendeeName, attendeeEmail, and eventName are required." },
        { status: 400 }
      );
    }

    // ── Build URLs ────────────────────────────────────────────────────────────
    const explorerUrl = txHash
      ? `https://amoy.polygonscan.com/tx/${txHash}`
      : nftId
      ? `https://amoy.polygonscan.com/nft/${process.env.NEXT_PUBLIC_CERT_CONTRACT_ADDRESS ?? ""}/${nftId}`
      : null;

    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/profile`;

    // ── HTML Email Template ───────────────────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Certificate is Ready 🎓</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0c29;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0c29;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:16px;padding:12px 28px;">
                <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">✦ I&E Hub</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(160deg,#1e1b4b,#1a1a2e);border:1px solid rgba(139,92,246,0.4);border-radius:20px;padding:48px 40px;text-align:center;">

              <!-- Seal -->
              <div style="font-size:64px;margin-bottom:16px;">🎓</div>

              <!-- Heading -->
              <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#e9d5ff;line-height:1.3;">
                Congratulations, ${attendeeName}!
              </h1>

              <!-- Subheading -->
              <p style="margin:0 0 24px;font-size:16px;color:#a78bfa;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                Your Certificate Has Been Minted
              </p>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(139,92,246,0.5),transparent);margin:0 0 28px;"></div>

              <!-- Body text -->
              <p style="margin:0 0 16px;font-size:16px;color:#c4b5fd;line-height:1.7;">
                Your official <strong style="color:#fff;">Certificate of Attendance</strong> for
              </p>
              <p style="margin:0 0 28px;font-size:22px;font-weight:700;color:#fff;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:14px 24px;display:inline-block;">
                ${eventName}
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.7;">
                has been officially minted as an NFT and sent directly to your Web3 wallet on the
                <strong style="color:#c4b5fd;">Polygon Amoy</strong> network. This certificate is permanent,
                verifiable, and belongs to you forever on the blockchain.
              </p>

              <!-- CTA Buttons -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  ${explorerUrl ? `
                  <td style="padding-right:12px;">
                    <a href="${explorerUrl}" target="_blank"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;letter-spacing:0.02em;">
                      🔗 View on Explorer
                    </a>
                  </td>` : ""}
                  <td>
                    <a href="${profileUrl}" target="_blank"
                       style="display:inline-block;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.5);color:#a78bfa;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;letter-spacing:0.02em;">
                      📥 View &amp; Download PDF
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(139,92,246,0.3),transparent);margin:32px 0 24px;"></div>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                This email was sent by <strong style="color:#a78bfa;">I&E Hub Admin</strong> on behalf of the event organiser.<br/>
                If you believe this was sent in error, please disregard this message.
              </p>
            </td>
          </tr>

          <!-- Bottom spacer -->
          <tr><td style="height:24px;"></td></tr>
          <tr>
            <td align="center" style="font-size:12px;color:#4b5563;">
              © ${new Date().getFullYear()} I&E Hub · Powered by Polygon Amoy &amp; Thirdweb
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ── Build MailerSend objects ───────────────────────────────────────────────
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL ?? "";
    if (!fromEmail) {
      console.error("[send-certificate-email] MAILERSEND_FROM_EMAIL is not set.");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: sender email not set." },
        { status: 500 }
      );
    }

    const sender    = new Sender(fromEmail, "I&E Hub Admin");
    const recipient = new Recipient(attendeeEmail, attendeeName);

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([recipient])
      .setSubject(`🎓 Your Certificate for "${eventName}" has been minted!`)
      .setHtml(html)
      .setText(
        `Congratulations ${attendeeName}! Your Certificate of Attendance for "${eventName}" has been minted to your Web3 wallet.${explorerUrl ? ` View it on Polygonscan: ${explorerUrl}` : ""} Download your PDF on your profile: ${profileUrl}`
      );

    // ── Send ──────────────────────────────────────────────────────────────────
    console.log("[send-certificate-email] Sending via MailerSend to:", attendeeEmail);
    try {
      const response = await mailerSend.email.send(emailParams);
      console.log("[send-certificate-email] MailerSend response status:", response.statusCode);

      if (response.statusCode >= 400) {
        const errBody = JSON.stringify(response.body);
        console.error("[send-certificate-email] MailerSend error body:", errBody);
        return NextResponse.json(
          { success: false, error: `MailerSend error ${response.statusCode}: ${errBody}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (sendErr) {
      console.error("[send-certificate-email] mailerSend.email.send threw:", sendErr);
      return NextResponse.json(
        {
          success: false,
          error: sendErr instanceof Error ? sendErr.message : String(sendErr),
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[send-certificate-email] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
