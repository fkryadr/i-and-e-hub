/**
 * Converts an IPFS URI (ipfs://CID/...) to an HTTP gateway URL.
 * Falls back to the original URL if it's already an HTTP/HTTPS URL.
 *
 * Uses the Thirdweb IPFS CDN as the primary gateway, which is the same
 * gateway used when uploading via the Thirdweb SDK.
 */
export function resolveImageUrl(
  url: string | null | undefined,
  fallback = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
): string {
  if (!url) return fallback;

  // ipfs://CID  →  https://ipfs.thirdwebcdn.com/ipfs/CID
  if (url.startsWith("ipfs://")) {
    const cid = url.slice("ipfs://".length);
    return `https://ipfs.thirdwebcdn.com/ipfs/${cid}`;
  }

  // Already a valid HTTP(S) URL — return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Unknown scheme — return fallback rather than crashing
  return fallback;
}
