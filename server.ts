import { join } from "path";
import { readFileSync, existsSync } from "fs";

const PORT = Number(process.env.PORT) || 3000;
const BASE_DIR = import.meta.dir;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' https://wa.me; frame-ancestors 'none';"
};

console.log(`🚀 High-performance server starting on http://localhost:${PORT}`);

export default {
  port: PORT,
  hostname: "0.0.0.0",
  fetch(req: Request) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    }

    const filePath = join(BASE_DIR, pathname);

    if (existsSync(filePath)) {
      try {
        const fileContent = readFileSync(filePath);
        const ext = pathname.substring(pathname.lastIndexOf(".")).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        const headers = new Headers({
          ...SECURITY_HEADERS,
          "Content-Type": contentType,
          "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
        });

        if (pathname === "/llms.txt" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
          headers.set("Access-Control-Allow-Origin", "*");
        }

        return new Response(fileContent, { headers });
      } catch (err) {
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("404 Not Found", {
      status: 404,
      headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};
