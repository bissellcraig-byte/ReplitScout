const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = "0.0.0.0";
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404 Not Found</h1>");
        return;
      }
      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<h1>404 Not Found</h1>");
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        });
        res.end(data);
      });
    });
  } catch (e) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Static server running at http://${HOST}:${PORT}`);
});
