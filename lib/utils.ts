/**
 * Ensures that a URL starts with a protocol (http:// or https://) or is double slash relative.
 * If not, prepends https:// to make it an absolute external URL instead of a relative path.
 */
export function formatExternalLink(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^(https?:)?\/\/|^(mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
