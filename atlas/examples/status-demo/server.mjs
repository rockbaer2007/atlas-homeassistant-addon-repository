import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const host = process.env.ATLAS_DEMO_HOST ?? process.env.ATLAS_HOST ?? "127.0.0.1";
const port = Number(process.env.ATLAS_DEMO_PORT ?? "4174");
const adminPort = Number(process.env.ATLAS_ADMIN_PORT ?? "4175");
const adminHost = process.env.ATLAS_ADMIN_HOST ?? process.env.ATLAS_HOST ?? "127.0.0.1";
const adminUrl = `http://${adminHost}:${adminPort}/`;
const skipAdminAutostart = process.env.ATLAS_SKIP_ADMIN_AUTOSTART === "1";
const suppressSurfaceUrlLogs = process.env.ATLAS_SUPPRESS_SURFACE_URL_LOGS === "1";
const adminApiPaths = new Set([
  "/api/admin-connection",
  "/api/card-translation",
  "/api/homeassistant/lovelace-resources",
]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

if (!skipAdminAutostart) {
  await startAdministrationServerIfNeeded();
}

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (requestUrl.pathname === "/admin" || requestUrl.pathname === "/admin/") {
    response.writeHead(302, { location: createPublicPortUrl(requestUrl, adminPort) });
    response.end();
    return;
  }

  if (adminApiPaths.has(requestUrl.pathname)) {
    void proxyAdminApiRequest(request, response, requestUrl);
    return;
  }

  const requestPath = requestUrl.pathname === "/"
    ? "/examples/status-demo/index.html"
    : requestUrl.pathname;
  const requestedFilePath = resolve(root, `.${normalize(requestPath)}`);
  if (existsSync(requestedFilePath) && statSync(requestedFilePath).isDirectory() && !requestPath.endsWith("/")) {
    response.writeHead(308, { location: `${requestPath}/` });
    response.end();
    return;
  }
  const filePath = resolveRequestFilePath(requestedFilePath);

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  if (!suppressSurfaceUrlLogs) {
    console.log(`ATLAS status demo: http://${host}:${port}/`);
  }
});

async function proxyAdminApiRequest(request, response, requestUrl) {
  try {
    const targetUrl = new URL(requestUrl.pathname, adminUrl);
    targetUrl.search = requestUrl.search;
    const body = await readRequestBody(request);
    const headers = {};
    if (request.headers["content-type"]) {
      headers["content-type"] = request.headers["content-type"];
    }

    const adminResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body.length ? body : undefined,
    });
    const responseBody = await adminResponse.text();
    response.writeHead(adminResponse.status, {
      "content-type": adminResponse.headers.get("content-type") ?? "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(responseBody);
  } catch (error) {
    response.writeHead(502, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(JSON.stringify({
      error: "admin api unavailable",
      message: error instanceof Error ? error.message : String(error),
    }));
  }
}

function createPublicPortUrl(requestUrl, targetPort) {
  const url = new URL("/", requestUrl);
  url.port = String(targetPort);
  return url.toString();
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => resolveBody(Buffer.concat(chunks)));
    request.on("error", rejectBody);
  });
}

async function startAdministrationServerIfNeeded() {
  if (await isServerReady(adminUrl)) {
    console.log(`ATLAS administration already running: ${adminUrl}`);
    return;
  }

  const adminServerPath = resolve(root, "examples/admin-demo/server.mjs");
  const adminProcess = spawn(process.execPath, [adminServerPath], {
    cwd: root,
    env: {
      ...process.env,
      ATLAS_ADMIN_PORT: String(adminPort),
      ATLAS_ADMIN_HOST: adminHost,
    },
    stdio: "inherit",
  });

  adminProcess.on("error", error => {
    console.warn(`ATLAS administration could not start: ${error.message}`);
  });

  if (await waitForServer(adminUrl, 2500)) {
    return;
  }

  console.warn(`ATLAS administration was requested but did not answer at ${adminUrl} yet.`);
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady(url)) return true;
    await new Promise(resolveDelay => setTimeout(resolveDelay, 100));
  }
  return false;
}

async function isServerReady(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

function resolveRequestFilePath(requestedFilePath) {
  if (existsSync(requestedFilePath) && statSync(requestedFilePath).isDirectory()) {
    return resolve(requestedFilePath, "index.js");
  }

  return !existsSync(requestedFilePath) && extname(requestedFilePath) === ""
    ? `${requestedFilePath}.js`
    : requestedFilePath;
}
