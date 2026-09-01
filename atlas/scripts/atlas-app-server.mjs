import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, normalize, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const host = process.env.ATLAS_APP_HOST ?? process.env.ATLAS_HOST ?? "127.0.0.1";
const surfaceHost = process.env.ATLAS_HOST ?? host;
const healthHost = surfaceHost === "0.0.0.0" ? "127.0.0.1" : surfaceHost;
const appPort = Number(process.env.ATLAS_APP_PORT ?? "4176");
const adminPort = Number(process.env.ATLAS_ADMIN_PORT ?? "4175");
const editorPort = Number(process.env.ATLAS_DEMO_PORT ?? "4174");
const distributionTarget = process.env.ATLAS_DISTRIBUTION_TARGET ?? "standalone-docker-preview";
const adminUrl = `http://${healthHost}:${adminPort}/`;
const editorUrl = `http://${healthHost}:${editorPort}/`;
const pluginRoot = resolve(root, "atlas-plugins");
const fileStudioConfigRoot = resolve(process.env.ATLAS_FILE_STUDIO_CONFIG_ROOT ?? "/config");
const fileStudioAddonsRoot = resolve(process.env.ATLAS_FILE_STUDIO_ADDONS_ROOT ?? "/addons");
const fileStudioAllowAddons = process.env.ATLAS_FILE_STUDIO_ALLOW_ADDONS === "1";
const adminConnectionCookieName = "atlas_admin_connection";
const sharedPluginCatalogCookieName = "atlas_plugin_catalog";
const startedAt = new Date().toISOString();
const childProcesses = [];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
};
const fileStudioImageMimeTypes = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".bmp", "image/bmp"],
  [".ico", "image/x-icon"],
]);

await startSurface({
  name: "ATLAS Administration",
  url: adminUrl,
  script: "examples/admin-demo/server.mjs",
    env: {
      ATLAS_ADMIN_HOST: surfaceHost,
      ATLAS_ADMIN_PORT: String(adminPort),
      ATLAS_SUPPRESS_SURFACE_URL_LOGS: "1",
      ATLAS_FILE_STUDIO_ALLOW_ADDONS: fileStudioAllowAddons ? "1" : "0",
    },
  });

await startSurface({
  name: "ATLAS Home Assistant Card Editor",
  url: editorUrl,
  script: "examples/status-demo/server.mjs",
  env: {
    ATLAS_DEMO_HOST: surfaceHost,
    ATLAS_ADMIN_HOST: surfaceHost,
    ATLAS_DEMO_PORT: String(editorPort),
    ATLAS_ADMIN_PORT: String(adminPort),
    ATLAS_SKIP_ADMIN_AUTOSTART: "1",
    ATLAS_SUPPRESS_SURFACE_URL_LOGS: "1",
  },
});

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${appPort}`}`);
  const routePath = createRoutePath(requestUrl.pathname);

  if (request.method === "OPTIONS") {
    writeEmptyResponse(response, 204);
    return;
  }

  if (routePath === "/health") {
    void writeHealthResponse(response);
    return;
  }

  if (routePath === "/app") {
    void writeAppResponse(response, requestUrl, request.headers.cookie);
    return;
  }

  if (routePath === "/api/plugins") {
    void writePluginCatalogResponse(response, requestUrl, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/tree") {
    void writeFileStudioTreeResponse(response, requestUrl, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/file") {
    void writeFileStudioFileResponse(response, requestUrl, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/asset") {
    void writeFileStudioAssetResponse(response, requestUrl, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/validate") {
    void writeFileStudioValidationResponse(request, response);
    return;
  }

  if (routePath === "/api/file-studio/write") {
    void writeFileStudioWriteResponse(request, response, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/create-file") {
    void writeFileStudioCreateFileResponse(request, response, request.headers.cookie);
    return;
  }

  if (routePath === "/api/file-studio/create-directory") {
    void writeFileStudioCreateDirectoryResponse(request, response, request.headers.cookie);
    return;
  }

  if (routePath === "/") {
    const activePlugins = readLaunchablePluginCatalog(requestUrl, request.headers.cookie);
    if (activePlugins.length === 1) {
      response.writeHead(302, { location: activePlugins[0].entryUrl });
      response.end();
      return;
    }

    serveStaticFile(response, resolve(root, "examples/plugin-hub/index.html"));
    return;
  }

  if (routePath === "/hub" || routePath === "/hub/") {
    serveStaticFile(response, resolve(root, "examples/plugin-hub/index.html"));
    return;
  }

  if (routePath.startsWith("/examples/plugin-hub/")) {
    serveStaticPath(response, routePath, resolve(root, "examples/plugin-hub"));
    return;
  }

  if (routePath.startsWith("/plugin-assets/")) {
    servePluginAsset(response, routePath);
    return;
  }

  if (routePath === "/admin" || routePath === "/admin/") {
    response.writeHead(302, { location: createPublicSurfaceUrl(requestUrl, adminPort) });
    response.end();
    return;
  }

  if (routePath === "/editor" || routePath === "/editor/") {
    response.writeHead(302, { location: createPublicSurfaceUrl(requestUrl, editorPort) });
    response.end();
    return;
  }

  writeJson(response, 404, {
    error: "not found",
    links: {
      admin: createPublicSurfaceUrl(requestUrl, adminPort),
      editor: createPublicSurfaceUrl(requestUrl, editorPort),
      hub: new URL("/hub", requestUrl).toString(),
      app: new URL("/app", requestUrl).toString(),
      health: new URL("/health", requestUrl).toString(),
    },
  });
}).listen(appPort, host, () => {
  console.log(`ATLAS app server: http://${host}:${appPort}/`);
  console.log(`ATLAS health: http://${host}:${appPort}/health`);
  console.log(`ATLAS administration: ${adminUrl}`);
  console.log(`ATLAS card editor: ${editorUrl}`);
});

function createRoutePath(pathname) {
  const knownPrefixes = [
    "/api/plugins",
    "/api/file-studio/tree",
    "/api/file-studio/file",
    "/api/file-studio/asset",
    "/api/file-studio/validate",
    "/api/file-studio/write",
    "/api/file-studio/create-file",
    "/api/file-studio/create-directory",
    "/examples/plugin-hub/",
    "/plugin-assets/",
  ];
  for (const prefix of knownPrefixes) {
    const index = pathname.indexOf(prefix);
    if (index >= 0) {
      return pathname.slice(index);
    }
  }

  const knownSuffixes = [
    "/health",
    "/app",
    "/hub",
    "/hub/",
    "/admin",
    "/admin/",
    "/editor",
    "/editor/",
  ];
  for (const suffix of knownSuffixes) {
    if (pathname === suffix || pathname.endsWith(suffix)) {
      return suffix;
    }
  }

  return pathname.endsWith("/") ? "/" : pathname;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    for (const childProcess of childProcesses) {
      childProcess.kill(signal);
    }
    process.exit(0);
  });
}

async function startSurface({ name, url, script, env }) {
  if (await isServerReady(url)) {
    console.log(`${name} already running: ${url}`);
    return;
  }

  const childProcess = spawn(process.execPath, [resolve(root, script)], {
    cwd: root,
    env: {
      ...process.env,
      ...env,
    },
    stdio: "inherit",
  });
  childProcesses.push(childProcess);

  childProcess.on("exit", (code, signal) => {
    if (code === 0 || signal) {
      return;
    }
    console.warn(`${name} exited with code ${code}.`);
  });

  childProcess.on("error", error => {
    console.warn(`${name} could not start: ${error.message}`);
  });

  if (!(await waitForServer(url, 5000))) {
    console.warn(`${name} did not answer at ${url} within 5s.`);
  }
}

async function writeHealthResponse(response) {
  const surfaces = {
    administration: {
      url: adminUrl,
      ready: await isServerReady(adminUrl),
    },
    cardEditor: {
      url: editorUrl,
      ready: await isServerReady(editorUrl),
    },
  };
  const ready = Object.values(surfaces).every(surface => surface.ready);

  writeJson(response, ready ? 200 : 503, {
    status: ready ? "ok" : "degraded",
    app: "atlas",
    surfaces,
  });
}

async function writeAppResponse(response, requestUrl, cookieHeader) {
  const publicAdminUrl = createPublicSurfaceUrl(requestUrl, adminPort);
  const publicEditorUrl = createPublicSurfaceUrl(requestUrl, editorPort);
  const surfaces = {
    administration: {
      url: publicAdminUrl,
      healthUrl: adminUrl,
      port: adminPort,
      ready: await isServerReady(adminUrl),
    },
    cardEditor: {
      url: publicEditorUrl,
      healthUrl: editorUrl,
      port: editorPort,
      ready: await isServerReady(editorUrl),
    },
  };
  const ready = Object.values(surfaces).every(surface => surface.ready);

  writeJson(response, ready ? 200 : 503, {
    kind: "atlas.app.runtime",
    name: "ATLAS",
    version: packageJson.version ?? "0.0.0-local",
    status: ready ? "ok" : "degraded",
    startedAt,
    urls: {
      app: new URL("/", requestUrl).toString(),
      hub: new URL("/hub", requestUrl).toString(),
      health: new URL("/health", requestUrl).toString(),
      admin: publicAdminUrl,
      editor: publicEditorUrl,
    },
    ports: {
      app: appPort,
      admin: adminPort,
      editor: editorPort,
    },
    distribution: {
      current: distributionTarget,
      order: [
        "standalone-docker",
        "home-assistant-app",
        "linux-installer",
        "home-assistant-hacs",
      ],
    },
    surfaces,
    plugins: readPluginCatalog(requestUrl, cookieHeader),
  });
}

async function writePluginCatalogResponse(response, requestUrl, cookieHeader) {
  writeJson(response, 200, {
    kind: "atlas.plugin.catalog",
    plugins: readPluginCatalog(requestUrl, cookieHeader),
  });
}

async function writeFileStudioTreeResponse(response, requestUrl, cookieHeader) {
  const depth = clampNumber(Number(requestUrl.searchParams.get("depth") ?? "3"), 1, 8);
  const relativePath = requestUrl.searchParams.get("path") ?? "";
  const access = createFileStudioAccessContext(cookieHeader);
  const rootScope = resolveFileStudioRootScope(relativePath, access);
  const targetPath = resolveFileStudioPath(relativePath, access);

  if (!targetPath) {
    writeJson(response, 403, {
      kind: "atlas.file-studio.tree",
      root: access.allowAddons ? "/" : "/config",
      roots: createFileStudioRootSummaries(access),
      error: "path outside configured root",
    });
    return;
  }

  if (access.allowAddons && (!relativePath || relativePath === "/" || relativePath === ".")) {
    writeJson(response, 200, {
      kind: "atlas.file-studio.tree",
      root: "/",
      roots: createFileStudioRootSummaries(access),
      exists: true,
      tree: createFileStudioVirtualRoot(depth, access),
    });
    return;
  }

  if (!existsSync(targetPath)) {
    writeJson(response, 200, {
      kind: "atlas.file-studio.tree",
      root: rootScope.displayPath,
      roots: createFileStudioRootSummaries(access),
      exists: false,
      message: `${rootScope.displayPath} ist noch nicht erreichbar.`,
      tree: {
        name: rootScope.displayPath.split("/").filter(Boolean).at(-1) ?? "config",
        path: rootScope.displayPath,
        type: "directory",
        children: [],
      },
    });
    return;
  }

  writeJson(response, 200, {
    kind: "atlas.file-studio.tree",
    root: access.allowAddons ? "/" : rootScope.displayPath,
    roots: createFileStudioRootSummaries(access),
    exists: true,
    tree: access.allowAddons && (!relativePath || relativePath === "/" || relativePath === ".")
      ? createFileStudioVirtualRoot(depth, access)
      : readFileStudioTree(targetPath, depth, rootScope.displayPath, access),
  });
}

async function writeFileStudioFileResponse(response, requestUrl, cookieHeader) {
  const relativePath = requestUrl.searchParams.get("path") ?? "";
  const access = createFileStudioAccessContext(cookieHeader);
  const targetPath = resolveFileStudioPath(relativePath, access);

  if (!targetPath) {
    writeJson(response, 403, {
      kind: "atlas.file-studio.file",
      error: "path outside configured root",
    });
    return;
  }

  if (!existsSync(targetPath) || !statSync(targetPath).isFile()) {
    writeJson(response, 404, {
      kind: "atlas.file-studio.file",
      error: "file not found",
    });
    return;
  }

  const stats = statSync(targetPath);
  writeJson(response, 200, {
    kind: "atlas.file-studio.file",
    path: createFileStudioDisplayPath(targetPath, access),
    name: targetPath.split(/[\\/]/).at(-1) ?? "",
    extension: extname(targetPath).replace(".", "").toLowerCase(),
    content: readFileSync(targetPath, "utf8"),
    size: stats.size,
    modifiedAt: stats.mtime.toISOString(),
    readonly: false,
  });
}

async function writeFileStudioAssetResponse(response, requestUrl, cookieHeader) {
  const relativePath = requestUrl.searchParams.get("path") ?? "";
  const access = createFileStudioAccessContext(cookieHeader);
  const targetPath = resolveFileStudioPath(relativePath, access);

  if (!targetPath) {
    writeJson(response, 403, {
      kind: "atlas.file-studio.asset",
      error: "path outside configured root",
    });
    return;
  }

  if (!existsSync(targetPath) || !statSync(targetPath).isFile()) {
    writeJson(response, 404, {
      kind: "atlas.file-studio.asset",
      error: "file not found",
    });
    return;
  }

  const extension = extname(targetPath).toLowerCase();
  const mimeType = fileStudioImageMimeTypes.get(extension);
  if (!mimeType) {
    writeJson(response, 415, {
      kind: "atlas.file-studio.asset",
      error: "unsupported asset type",
    });
    return;
  }

  const stats = statSync(targetPath);
  response.writeHead(200, {
    "content-type": mimeType,
    "content-length": stats.size,
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  createReadStream(targetPath).pipe(response);
}

async function writeFileStudioValidationResponse(request, response) {
  const body = await readJsonRequestBody(request);
  const content = typeof body.content === "string" ? body.content : "";
  const filename = typeof body.path === "string" ? body.path : "";

  writeJson(response, 200, {
    kind: "atlas.file-studio.validation",
    ...validateFileStudioContent(content, filename),
  });
}

async function writeFileStudioWriteResponse(request, response, cookieHeader) {
  const body = await readJsonRequestBody(request);
  const access = createFileStudioAccessContext(cookieHeader);
  const targetPath = resolveFileStudioPath(body.path, access);

  if (!targetPath) {
    writeJson(response, 403, {
      kind: "atlas.file-studio.write",
      ok: false,
      error: "path outside configured root",
    });
    return;
  }

  if (!existsSync(targetPath) || !statSync(targetPath).isFile()) {
    writeJson(response, 404, {
      kind: "atlas.file-studio.write",
      ok: false,
      error: "file not found",
    });
    return;
  }

  const content = typeof body.content === "string" ? body.content : "";
  const validation = validateFileStudioContent(content, body.path);
  if (!validation.ok && validation.blocking) {
    writeJson(response, 422, {
      kind: "atlas.file-studio.write",
      ok: false,
      validation,
      error: validation.message,
    });
    return;
  }

  writeFileSync(targetPath, content, "utf8");
  const stats = statSync(targetPath);
  writeJson(response, 200, {
    kind: "atlas.file-studio.write",
    ok: true,
    path: createFileStudioDisplayPath(targetPath, access),
    size: stats.size,
    modifiedAt: stats.mtime.toISOString(),
    validation,
  });
}

async function writeFileStudioCreateFileResponse(request, response, cookieHeader) {
  const body = await readJsonRequestBody(request);
  const result = createFileStudioPath(body.parentPath, body.name, "file", createFileStudioAccessContext(cookieHeader));
  writeJson(response, result.status, result.body);
}

async function writeFileStudioCreateDirectoryResponse(request, response, cookieHeader) {
  const body = await readJsonRequestBody(request);
  const result = createFileStudioPath(body.parentPath, body.name, "directory", createFileStudioAccessContext(cookieHeader));
  writeJson(response, result.status, result.body);
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

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(body, null, 2));
}

function writeEmptyResponse(response, statusCode) {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end();
}

function clampNumber(value, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }
  return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
}

function createPublicSurfaceUrl(requestUrl, port) {
  const url = new URL("/", requestUrl);
  url.port = String(port);
  return url.toString();
}

function createFileStudioAccessContext(cookieHeader = "") {
  return {
    allowAddons: isHomeAssistantAppDistribution()
      ? fileStudioAllowAddons
      : fileStudioAllowAddons || readFileStudioAccessFromCookie(cookieHeader).allowAddonsPath,
  };
}

function readFileStudioAccessFromCookie(cookieHeader) {
  const encodedSettings = readCookie(cookieHeader, adminConnectionCookieName);
  if (!encodedSettings) {
    return { allowAddonsPath: false };
  }
  try {
    const settings = JSON.parse(decodeURIComponent(encodedSettings));
    return {
      allowAddonsPath: settings?.fileStudioAccess?.allowAddonsPath === true,
    };
  } catch {
    return { allowAddonsPath: false };
  }
}

function isHomeAssistantAppDistribution() {
  return distributionTarget.startsWith("home-assistant-app");
}

function createFileStudioRootScopes(access = createFileStudioAccessContext()) {
  return [
    {
      id: "homeassistant-config",
      label: "Home Assistant /config",
      displayPath: "/config",
      physicalPath: fileStudioConfigRoot,
      enabled: true,
      readonly: false,
      source: "default",
    },
    {
      id: "homeassistant-addons",
      label: "Home Assistant /addons",
      displayPath: "/addons",
      physicalPath: fileStudioAddonsRoot,
      enabled: access.allowAddons,
      readonly: false,
      source: "approval",
    },
  ];
}

function createFileStudioRootSummaries(access) {
  return createFileStudioRootScopes(access).map(scope => ({
    id: scope.id,
    label: scope.label,
    path: scope.displayPath,
    enabled: scope.enabled,
    readonly: scope.readonly,
    source: scope.source,
  }));
}

function enabledFileStudioRootScopes(access) {
  return createFileStudioRootScopes(access).filter(scope => scope.enabled);
}

function normalizeFileStudioDisplayInput(value) {
  const normalized = String(value ?? "").replace(/\\/g, "/").trim();
  if (!normalized || normalized === "." || normalized === "/") {
    return "";
  }
  return `/${normalized.replace(/^\/+/, "")}`.replace(/\/+$/, "");
}

function resolveFileStudioRootScope(value, access) {
  const displayPath = normalizeFileStudioDisplayInput(value);
  if (!displayPath) {
    return enabledFileStudioRootScopes(access)[0];
  }
  return enabledFileStudioRootScopes(access)
    .find(scope => displayPath === scope.displayPath || displayPath.startsWith(`${scope.displayPath}/`));
}

function resolveFileStudioPath(value, access) {
  const scope = resolveFileStudioRootScope(value, access);
  if (!scope) {
    return undefined;
  }

  const displayPath = normalizeFileStudioDisplayInput(value);
  const relativeInput = displayPath === scope.displayPath
    ? ""
    : displayPath.slice(scope.displayPath.length).replace(/^\/+/, "");
  const targetPath = resolve(scope.physicalPath, normalize(relativeInput));

  return isInsideFileStudioRootScope(scope, targetPath) ? targetPath : undefined;
}

function createFileStudioDisplayPath(targetPath, access) {
  const scope = enabledFileStudioRootScopes(access)
    .find(candidate => isInsideFileStudioRootScope(candidate, targetPath));
  if (!scope) {
    return "";
  }
  const relativeTargetPath = relative(scope.physicalPath, targetPath).replace(/\\/g, "/");
  if (!relativeTargetPath) {
    return scope.displayPath;
  }
  return `${scope.displayPath}/${relativeTargetPath}`.replace(/\/$/, "");
}

function isInsideFileStudioRootScope(scope, targetPath) {
  const relativeTargetPath = relative(scope.physicalPath, targetPath);
  return relativeTargetPath === "" || (!relativeTargetPath.startsWith("..") && !isAbsolute(relativeTargetPath));
}

async function readJsonRequestBody(request) {
  if (request.method !== "POST") {
    return {};
  }

  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2_000_000) {
      throw new Error("request body too large");
    }
  }

  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body);
}

function createFileStudioPath(parentPath, name, type, access) {
  const parentDirectory = resolveFileStudioPath(parentPath, access);
  const parentScope = resolveFileStudioRootScope(parentPath, access);
  const normalizedName = String(name ?? "").trim();
  const invalidReason = validateFileStudioName(normalizedName);
  if (invalidReason) {
    return {
      status: 400,
      body: {
        kind: `atlas.file-studio.${type}.create`,
        ok: false,
        error: invalidReason,
      },
    };
  }

  if (!parentDirectory || !parentScope || !existsSync(parentDirectory) || !statSync(parentDirectory).isDirectory()) {
    return {
      status: 404,
      body: {
        kind: `atlas.file-studio.${type}.create`,
        ok: false,
        error: "parent directory not found",
      },
    };
  }

  const targetPath = resolve(parentDirectory, normalizedName);
  if (!isInsideFileStudioRootScope(parentScope, targetPath)) {
    return {
      status: 403,
      body: {
        kind: `atlas.file-studio.${type}.create`,
        ok: false,
        error: "path outside configured root",
      },
    };
  }

  if (existsSync(targetPath)) {
    return {
      status: 409,
      body: {
        kind: `atlas.file-studio.${type}.create`,
        ok: false,
        error: "file or directory already exists",
      },
    };
  }

  if (type === "directory") {
    mkdirSync(targetPath);
  } else {
    writeFileSync(targetPath, "", "utf8");
  }

  const stats = statSync(targetPath);
  return {
    status: 200,
    body: {
      kind: `atlas.file-studio.${type}.create`,
      ok: true,
      path: createFileStudioDisplayPath(targetPath, access),
      name: normalizedName,
      type,
      extension: type === "file" ? extname(normalizedName).replace(".", "").toLowerCase() : undefined,
      size: type === "file" ? stats.size : undefined,
      modifiedAt: stats.mtime.toISOString(),
    },
  };
}

function validateFileStudioName(name) {
  if (!name) {
    return "name is required";
  }
  if (name === "." || name === ".." || name.includes("..")) {
    return "relative path segments are not allowed";
  }
  if (/[\\/]/.test(name)) {
    return "path separators are not allowed";
  }
  return undefined;
}

function validateFileStudioContent(content, filename) {
  const extension = extname(String(filename ?? "")).replace(".", "").toLowerCase();
  if (!["yaml", "yml"].includes(extension)) {
    return {
      ok: true,
      blocking: false,
      message: "Keine YAML-Prüfung für diesen Dateityp nötig.",
    };
  }

  const lines = content.split(/\r?\n/);
  const tabLine = lines.findIndex(line => /^\s*\t|\s+\t/.test(line));
  if (tabLine >= 0) {
    return {
      ok: false,
      blocking: true,
      line: tabLine + 1,
      message: `YAML enthält Tabs in Zeile ${tabLine + 1}. Bitte Leerzeichen verwenden.`,
    };
  }

  return {
    ok: true,
    blocking: false,
    message: "YAML-Basisprüfung bestanden.",
  };
}

function readFileStudioTree(directoryPath, remainingDepth, displayPath, access) {
  const directoryStats = statSync(directoryPath);
  const name = displayPath === "/config"
    ? "config"
    : displayPath === "/addons"
      ? "addons"
    : displayPath.split("/").filter(Boolean).at(-1) ?? "config";
  const node = {
    name,
    path: displayPath,
    type: "directory",
    modifiedAt: directoryStats.mtime.toISOString(),
    children: [],
  };

  if (remainingDepth <= 0) {
    return node;
  }

  try {
    node.children = readdirSync(directoryPath, { withFileTypes: true })
      .filter(entry => !entry.name.startsWith("."))
      .map(entry => readFileStudioTreeEntry(directoryPath, displayPath, entry, remainingDepth, access))
      .filter(Boolean)
      .sort(sortFileStudioTreeEntries);
  } catch (error) {
    node.error = error instanceof Error ? error.message : "directory could not be read";
  }

  return node;
}

function readFileStudioTreeEntry(parentDirectory, parentDisplayPath, entry, remainingDepth, access) {
  const entryPath = resolve(parentDirectory, entry.name);
  const scope = resolveFileStudioRootScope(parentDisplayPath, access);
  if (!scope || !isInsideFileStudioRootScope(scope, entryPath)) {
    return undefined;
  }
  const displayPath = `${parentDisplayPath.replace(/\/$/, "")}/${entry.name}`.replace(/\\/g, "/");
  const entryStats = statSync(entryPath);

  if (entry.isDirectory()) {
    return readFileStudioTree(entryPath, remainingDepth - 1, displayPath, access);
  }

  if (!entry.isFile()) {
    return undefined;
  }

  return {
    name: entry.name,
    path: displayPath,
    type: "file",
    extension: extname(entry.name).replace(".", "").toLowerCase(),
    size: entryStats.size,
    modifiedAt: entryStats.mtime.toISOString(),
  };
}

function createFileStudioVirtualRoot(depth, access) {
  return {
    name: "ATLAS",
    path: "/",
    type: "directory",
    children: enabledFileStudioRootScopes(access).map(scope => {
      if (!existsSync(scope.physicalPath)) {
        return {
          name: scope.displayPath.replace("/", ""),
          path: scope.displayPath,
          type: "directory",
          children: [],
          error: `${scope.displayPath} ist noch nicht erreichbar.`,
        };
      }
      return readFileStudioTree(scope.physicalPath, Math.max(1, depth) - 1, scope.displayPath, access);
    }),
  };
}

function sortFileStudioTreeEntries(left, right) {
  if (left.type !== right.type) {
    return left.type === "directory" ? -1 : 1;
  }
  return left.name.localeCompare(right.name, "de", { sensitivity: "base" });
}

function readPluginCatalog(requestUrl, cookieHeader = "") {
  const localPlugins = existsSync(pluginRoot)
    ? readdirSync(pluginRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => readPluginManifest(entry.name, requestUrl))
      .filter(Boolean)
    : [];
  const sharedPlugins = readSharedPluginCatalog(cookieHeader, requestUrl);
  const pluginsById = new Map(localPlugins.map(plugin => [plugin.id, plugin]));

  for (const plugin of sharedPlugins) {
    const existing = pluginsById.get(plugin.id);
    pluginsById.set(plugin.id, existing
      ? {
        ...plugin,
        ...existing,
        version: plugin.version || existing.version,
        status: plugin.status || existing.status,
        description: plugin.description || existing.description,
        descriptionI18n: plugin.descriptionI18n || existing.descriptionI18n,
      }
      : plugin);
  }

  return [...pluginsById.values()]
    .sort((left, right) => (left.order ?? 999) - (right.order ?? 999) || left.name.localeCompare(right.name));
}

function readLaunchablePluginCatalog(requestUrl, cookieHeader = "") {
  return readPluginCatalog(requestUrl, cookieHeader).filter(plugin =>
    plugin.status === "active" && Boolean(plugin.entryUrl),
  );
}

function readPluginManifest(directoryName, requestUrl) {
  const manifestPath = resolve(pluginRoot, directoryName, "atlas-plugin.json");
  if (!manifestPath.startsWith(pluginRoot) || !existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const id = typeof manifest.id === "string" && manifest.id.trim()
      ? manifest.id.trim()
      : directoryName;
    const entryUrl = createPluginEntryUrl(manifest.entry, requestUrl);

    return {
      id,
      name: typeof manifest.name === "string" ? manifest.name : id,
      nameI18n: normalizeLocalizedPluginText(manifest.nameI18n),
      version: typeof manifest.version === "string" ? manifest.version : "0.0.0",
      description: typeof manifest.description === "string" ? manifest.description : "",
      descriptionI18n: normalizeLocalizedPluginText(manifest.descriptionI18n),
      status: typeof manifest.status === "string" ? manifest.status : "available",
      order: Number.isFinite(manifest.order) ? manifest.order : 999,
      capabilities: Array.isArray(manifest.capabilities)
        ? manifest.capabilities.filter(capability => typeof capability === "string")
        : [],
      iconUrl: createPluginAssetUrl(directoryName, manifest.icon, requestUrl),
      logoUrl: createPluginAssetUrl(directoryName, manifest.logo, requestUrl),
      previewUrl: createPluginAssetUrl(directoryName, manifest.preview, requestUrl),
      entryUrl,
    };
  } catch {
    return undefined;
  }
}

function normalizeLocalizedPluginText(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .filter(([locale, text]) => locale.trim() && typeof text === "string" && text.trim())
    .map(([locale, text]) => [locale.trim().toLowerCase(), text.trim()]);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function readSharedPluginCatalog(cookieHeader, requestUrl) {
  const encodedCatalog = readCookie(cookieHeader, sharedPluginCatalogCookieName);
  if (!encodedCatalog) {
    return [];
  }

  try {
    const catalog = JSON.parse(decodeURIComponent(encodedCatalog));
    return Array.isArray(catalog.plugins)
      ? catalog.plugins.map(plugin => normalizeSharedPlugin(plugin, requestUrl)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function normalizeSharedPlugin(plugin, requestUrl) {
  if (!plugin || typeof plugin !== "object" || Array.isArray(plugin)) {
    return undefined;
  }
  const id = typeof plugin.id === "string" && plugin.id.trim() ? plugin.id.trim() : "";
  if (!id) {
    return undefined;
  }

  return {
    id,
    name: typeof plugin.name === "string" && plugin.name.trim() ? plugin.name.trim() : id,
    nameI18n: normalizeLocalizedPluginText(plugin.nameI18n),
    version: typeof plugin.version === "string" ? plugin.version : "0.0.0",
    description: typeof plugin.description === "string" ? plugin.description : "",
    descriptionI18n: normalizeLocalizedPluginText(plugin.descriptionI18n),
    status: ["active", "available", "disabled"].includes(plugin.status) ? plugin.status : "available",
    order: Number.isFinite(plugin.order) ? plugin.order : 999,
    capabilities: Array.isArray(plugin.capabilities)
      ? plugin.capabilities.filter(capability => typeof capability === "string")
      : [],
    iconUrl: typeof plugin.iconUrl === "string" ? plugin.iconUrl : "",
    logoUrl: typeof plugin.logoUrl === "string" ? plugin.logoUrl : "",
    previewUrl: typeof plugin.previewUrl === "string" ? plugin.previewUrl : "",
    entryUrl: createPluginEntryUrl(plugin.entry, requestUrl),
  };
}

function readCookie(cookieHeader, name) {
  if (typeof cookieHeader !== "string" || !cookieHeader.trim()) {
    return "";
  }
  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : "";
}

function createPluginEntryUrl(entry, requestUrl) {
  if (entry === "admin") {
    return createPublicSurfaceUrl(requestUrl, adminPort);
  }
  if (entry === "editor") {
    return createPublicSurfaceUrl(requestUrl, editorPort);
  }
  if (typeof entry === "string" && entry.trim()) {
    return new URL(entry, requestUrl).toString();
  }
  return "";
}

function createPluginAssetUrl(directoryName, assetPath, requestUrl) {
  if (typeof assetPath !== "string" || !assetPath.trim()) {
    return "";
  }
  return new URL(`/plugin-assets/${encodeURIComponent(directoryName)}/${assetPath}`, requestUrl).toString();
}

function servePluginAsset(response, pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const directoryName = parts[1] ? decodeURIComponent(parts[1]) : "";
  const assetPath = parts.slice(2).join("/");
  if (!directoryName || !assetPath) {
    writeEmptyResponse(response, 404);
    return;
  }
  const pluginDirectory = resolve(pluginRoot, directoryName);
  serveStaticFile(response, resolve(pluginDirectory, normalize(assetPath)), pluginDirectory);
}

function serveStaticPath(response, pathname, baseDirectory = root) {
  serveStaticFile(response, resolve(root, `.${normalize(pathname)}`), baseDirectory);
}

function serveStaticFile(response, filePath, baseDirectory = root) {
  if (!filePath.startsWith(baseDirectory) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    writeEmptyResponse(response, 404);
    return;
  }

  response.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}
