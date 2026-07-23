export interface ParsedDevice {
  browser: string;
  os: string;
}

// Best-effort heuristic parser for display purposes only (sessions list,
// new-device alerts) — not a security boundary. A full UA database (e.g.
// ua-parser-js) would be more accurate but isn't warranted just to label a
// sessions list with a browser/OS name.
export const parseUserAgent = (userAgent?: string): ParsedDevice => {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };

  const os = /windows/i.test(userAgent)
    ? 'Windows'
    : /mac os/i.test(userAgent)
      ? 'macOS'
      : /android/i.test(userAgent)
        ? 'Android'
        : /iphone|ipad/i.test(userAgent)
          ? 'iOS'
          : /linux/i.test(userAgent)
            ? 'Linux'
            : 'Unknown';

  const browser = /edg\//i.test(userAgent)
    ? 'Edge'
    : /chrome\//i.test(userAgent)
      ? 'Chrome'
      : /firefox\//i.test(userAgent)
        ? 'Firefox'
        : /safari\//i.test(userAgent)
          ? 'Safari'
          : 'Unknown';

  return { browser, os };
};
