const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": MIME_TYPES[".json"] });
  response.end(JSON.stringify(payload));
}

function serveStatic(requestPath, response) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "File not found" });
        return;
      }
      sendJson(response, 500, { error: "Unable to read file" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    response.end(data);
  });
}

function fetchTaf(icao) {
  const url = new URL("https://aviationweather.gov/api/data/taf");
  url.searchParams.set("ids", icao);
  url.searchParams.set("format", "raw");

  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "taf-web-demo/1.0",
          Accept: "text/plain",
        },
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8").trim();

          if (response.statusCode === 204 || !body) {
            resolve({ raw: "", sourceUrl: url.toString() });
            return;
          }

          if (response.statusCode !== 200) {
            reject(
              new Error(
                `TAF API returned ${response.statusCode}: ${body || "Unknown error"}`
              )
            );
            return;
          }

          resolve({ raw: body, sourceUrl: url.toString() });
        });
      }
    );

    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/taf") {
    const icao = (requestUrl.searchParams.get("icao") || "").trim().toUpperCase();

    if (!/^[A-Z0-9]{4}$/.test(icao)) {
      sendJson(response, 400, {
        error: "ICAO code must be 4 letters or digits.",
      });
      return;
    }

    try {
      const taf = await fetchTaf(icao);
      sendJson(response, 200, {
        icao,
        raw: taf.raw,
        fetchedAt: new Date().toISOString(),
        sourceUrl: taf.sourceUrl,
      });
    } catch (error) {
      sendJson(response, 502, {
        error: error.message || "Failed to fetch TAF.",
      });
    }
    return;
  }

  serveStatic(requestUrl.pathname, response);
});

server.listen(PORT, () => {
  console.log(`TAF web app running at http://localhost:${PORT}`);
});
