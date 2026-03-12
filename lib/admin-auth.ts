import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "dev-session-secret-change-in-production";

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) return false;

  try {
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;

    const [username, expiryStr, signature] = parts;
    const payload = `${username}:${expiryStr}`;
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) return false;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    return signature === expectedSig;
  } catch {
    return false;
  }
}
