/**
 * Build the XMnote import endpoint while preserving compatibility with the
 * legacy `ip + port` configuration.
 */
export function buildXMnoteApiUrl(ip: string, port?: number): string {
  const input = ip.trim();
  if (!input) {
    throw new Error("XMnote server address is required");
  }

  if (/^https?:\/\//i.test(input)) {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("XMnote server URL must use HTTP or HTTPS");
    }

    const path = url.pathname.replace(/\/+$/, "");
    url.pathname = path.endsWith("/send") ? path : `${path}/send`;
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  if (!Number.isInteger(port) || port! <= 0 || port! > 65535) {
    throw new Error("XMnote server port must be between 1 and 65535");
  }

  if (/[/?#@\s]/.test(input)) {
    throw new Error("XMnote server address must be a host name or IP address");
  }

  // URL requires IPv6 literals to be enclosed in square brackets.
  const host =
    input.includes(":") && !input.startsWith("[") ? `[${input}]` : input;
  return new URL(`http://${host}:${port}/send`).toString();
}

export function isCompleteXMnoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}
