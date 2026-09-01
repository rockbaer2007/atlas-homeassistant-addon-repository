import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
const sharedPluginCatalogCookieName = "atlas_plugin_catalog";
const startedAt = new Date().toISOString();
const childProcesses = [];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

await startSurface({
  name: "ATLAS Administration",
  url: adminUrl,
  script: "examples/admin-demo/server.mjs",
  env: {
    ATLAS_ADMIN_HOST: surfaceHost,
    ATLAS_ADMIN_PORT: String(adminPort),
    ATLAS_SUPPRESS_SURFACE_URL_LOGS: "1",
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
    void writeFileStudioTreeResponse(response, requestUrl);
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

async function writeFileStudioTreeResponse(response, requestUrl) {
  const depth = clampNumber(Number(requestUrl.searchParams.get("depth") ?? "3"), 1, 8);
  const relativePath = requestUrl.searchParams.get("path") ?? "";
  const targetPath = resolveFileStudioConfigPath(relativePath);

  if (!targetPath) {
    writeJson(response, 403, {
      kind: "atlas.file-studio.tree",
      root: "/config",
      error: "path outside configured root",
    });
    return;
  }

  if (!existsSync(fileStudioConfigRoot)) {
    writeJson(response, 200, {
      kind: "atlas.file-studio.tree",
      root: "/config",
      exists: false,
      message: "Der Home-Assistant-Konfigurationsordner /config ist noch nicht erreichbar.",
      tree: {
        name: "config",
        path: "/config",
        type: "directory",
        children: [],
      },
    });
    return;
  }

  writeJson(response, 200, {
    kind: "atlas.file-studio.tree",
    root: "/config",
    exists: true,
    tree: readFileStudioTree(targetPath, depth, "/config"),
  });
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
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(body, null, 2));
}

function writeEmptyResponse(response, statusCode) {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
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

function resolveFileStudioConfigPath(relativePath) {
  const normalizedRelativePath = normalize(String(relativePath ?? "").replace(/^[/\\]+/, ""));
  const targetPath = resolve(fileStudioConfigRoot, normalizedRelativePath);

  if (isInsideFileStudioConfigRoot(targetPath)) {
    return targetPath;
  }

  return undefined;
}

function isInsideFileStudioConfigRoot(targetPath) {
  const relativeTargetPath = relative(fileStudioConfigRoot, targetPath);
  return relativeTargetPath === "" || (!relativeTargetPath.startsWith("..") && !isAbsolute(relativeTargetPath));
}

function readFileStudioTree(directoryPath, remainingDepth, displayPath) {
  const name = displayPath === "/config"
    ? "config"
    : displayPath.split("/").filter(Boolean).at(-1) ?? "config";
  const node = {
    name,
    path: displayPath,
    type: "directory",
    children: [],
  };

  if (remainingDepth <= 0) {
    return node;
  }

  try {
    node.children = readdirSync(directoryPath, { withFileTypes: true })
      .filter(entry => !entry.name.startsWith("."))
      .map(entry => readFileStudioTreeEntry(directoryPath, displayPath, entry, remainingDepth))
      .filter(Boolean)
      .sort(sortFileStudioTreeEntries);
  } catch (error) {
    node.error = error instanceof Error ? error.message : "directory could not be read";
  }

  return node;
}

function readFileStudioTreeEntry(parentDirectory, parentDisplayPath, entry, remainingDepth) {
  const entryPath = resolve(parentDirectory, entry.name);
  if (!isInsideFileStudioConfigRoot(entryPath)) {
    return undefined;
  }
  const displayPath = `${parentDisplayPath.replace(/\/$/, "")}/${entry.name}`.replace(/\\/g, "/");

  if (entry.isDirectory()) {
    return readFileStudioTree(entryPath, remainingDepth - 1, displayPath);
  }

  if (!entry.isFile()) {
    return undefined;
  }

  return {
    name: entry.name,
    path: displayPath,
    type: "file",
    extension: extname(entry.name).replace(".", "").toLowerCase(),
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
