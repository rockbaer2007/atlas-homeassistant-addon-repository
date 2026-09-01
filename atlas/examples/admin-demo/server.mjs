import { createHash, randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const host = process.env.ATLAS_ADMIN_HOST ?? process.env.ATLAS_HOST ?? "127.0.0.1";
const port = Number(process.env.ATLAS_ADMIN_PORT ?? "4175");
const suppressSurfaceUrlLogs = process.env.ATLAS_SUPPRESS_SURFACE_URL_LOGS === "1";
const defaultTranslationApiEndpoint = "https://api.deepl.com/v2/translate";
const translationProviderValues = ["none", "chatgpt", "gemini", "deepl-free", "deepl-pro", "custom-ai"];
const parcelProviderDefaults = [
  {
    id: "dhl",
    name: "DHL",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "deutsche-post",
    name: "Deutsche Post",
    region: "DE",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.deutschepost.de/sendung/simpleQuery.html?piececode={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "hermes",
    name: "Hermes",
    region: "DE",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#{trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "dpd",
    name: "DPD",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://tracking.dpd.de/status/de_DE/parcel/{trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "gls",
    name: "GLS",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://gls-group.com/DE/de/paketverfolgung?match={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "ups",
    name: "UPS",
    region: "Global",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.ups.com/track?loc=de_DE&tracknum={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "fedex",
    name: "FedEx",
    region: "Global",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "amazon",
    name: "Amazon Logistics",
    region: "Global",
    authMode: "account-required",
    status: "manual-account",
    trackingUrl: "https://www.amazon.de/progress-tracker/package",
    capabilities: ["account-link", "manual-status"],
  },
];
const openAiTranslationModel = process.env.ATLAS_OPENAI_TRANSLATION_MODEL ?? "gpt-5.6-luna";
const adminDeviceFilePath = process.env.ATLAS_ADMIN_DEVICE_FILE
  ? resolve(process.env.ATLAS_ADMIN_DEVICE_FILE)
  : join(homedir(), ".atlas", "admin-device.json");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};
let adminConnectionSettings = createInitialAdminConnectionSettingsFromEnv();
let adminDeviceBinding;

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  if (requestUrl.pathname === "/api/admin-connection") {
    void handleAdminConnectionRequest(request, response);
    return;
  }
  if (requestUrl.pathname === "/api/card-translation") {
    void handleCardTranslationRequest(request, response);
    return;
  }
  if (requestUrl.pathname === "/api/homeassistant/lovelace-resources") {
    void handleHomeAssistantLovelaceResourcesRequest(request, response);
    return;
  }
  if (requestUrl.pathname === "/api/admin-device") {
    void handleAdminDeviceRequest(request, response);
    return;
  }

  const requestPath = requestUrl.pathname === "/"
    ? "/examples/admin-demo/index.html"
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
    console.log(`ATLAS administration: http://${host}:${port}/`);
  }
});

async function handleAdminConnectionRequest(request, response) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  writeCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET") {
    response.writeHead(adminConnectionSettings ? 200 : 404, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(JSON.stringify(adminConnectionSettings
      ? sanitizeAdminConnectionSettings(adminConnectionSettings, {
          includeSecrets: canReadAdminConnectionSecrets(request, requestUrl),
        })
      : { error: "not configured" }));
    return;
  }

  if (request.method === "PUT") {
    const body = await readRequestBody(request);
    const settings = JSON.parse(body || "{}");
    adminConnectionSettings = normalizeAdminConnectionSettings(settings, adminConnectionSettings);
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.method === "DELETE") {
    adminConnectionSettings = undefined;
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "method not allowed" }));
}

async function handleAdminDeviceRequest(request, response) {
  writeCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }

  response.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(getAdminDeviceBinding()));
}

async function handleHomeAssistantLovelaceResourcesRequest(request, response) {
  writeCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "GET") {
    writeJsonResponse(response, 405, { error: "method not allowed" });
    return;
  }

  if (!adminConnectionSettings?.url || !adminConnectionSettings?.token) {
    writeJsonResponse(response, 409, { error: "admin connection is not configured" });
    return;
  }

  const websocketResult = await requestHomeAssistantLovelaceResourcesViaWebSocket(
    adminConnectionSettings.url,
    adminConnectionSettings.token,
  );
  if (websocketResult.ok) {
    writeJsonResponse(response, 200, {
      source: "admin-websocket",
      command: websocketResult.command,
      resources: websocketResult.resources,
    });
    return;
  }

  const url = deriveHomeAssistantRestApiUrl(adminConnectionSettings.url, "/api/lovelace/config");
  if (!url) {
    writeJsonResponse(response, 400, { error: "home assistant url is invalid" });
    return;
  }

  try {
    const homeAssistantResponse = await fetch(url, {
      headers: {
        authorization: `Bearer ${adminConnectionSettings.token}`,
        accept: "application/json",
      },
    });
    const body = await homeAssistantResponse.json().catch(() => undefined);
    if (!homeAssistantResponse.ok) {
      writeJsonResponse(response, homeAssistantResponse.status, {
        error: [
          websocketResult.error ? `Admin WebSocket failed: ${websocketResult.error}` : "",
          body?.message ?? body?.error ?? `Home Assistant returned HTTP ${homeAssistantResponse.status}`,
        ].filter(Boolean).join(". "),
      });
      return;
    }

    writeJsonResponse(response, 200, {
      source: "admin-rest",
      resources: extractLovelaceResourcesFromPayload(body),
    });
  } catch (error) {
    writeJsonResponse(response, 502, {
      error: [
        websocketResult.error ? `Admin WebSocket failed: ${websocketResult.error}` : "",
        error instanceof Error ? error.message : "Home Assistant resource request failed",
      ].filter(Boolean).join(". "),
    });
  }
}

async function handleCardTranslationRequest(request, response) {
  writeCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }

  if (!adminConnectionSettings) {
    writeJsonResponse(response, 409, { error: "admin connection is not configured" });
    return;
  }

  const body = await readRequestBody(request);
  const translationRequest = normalizeCardTranslationRequest(JSON.parse(body || "{}"));
  if (!translationRequest.ok) {
    writeJsonResponse(response, 400, { error: translationRequest.error });
    return;
  }

  if (translationRequest.value.provider !== "chatgpt") {
    writeJsonResponse(response, 501, {
      error: `provider ${translationRequest.value.provider} is not connected yet`,
    });
    return;
  }

  const apiKey = adminConnectionSettings.translationApiKeys.chatgpt;
  if (!apiKey) {
    writeJsonResponse(response, 409, { error: "chatgpt api key is not configured" });
    return;
  }

  try {
    const translatedLocales = await translateCardLocaleWithOpenAi({
      apiKey,
      languages: translationRequest.value.languages,
      sourceLocale: translationRequest.value.sourceLocale,
    });
    writeJsonResponse(response, 200, {
      provider: "chatgpt",
      model: openAiTranslationModel,
      locales: translatedLocales,
    });
  } catch (error) {
    writeJsonResponse(response, 502, {
      error: error instanceof Error ? error.message : "translation request failed",
    });
  }
}

function writeJsonResponse(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function writeCorsHeaders(request, response) {
  const origin = typeof request.headers.origin === "string"
    ? request.headers.origin
    : createEditorOriginFromRequest(request);
  if (isEditorOriginForRequest(request, origin)) {
    response.setHeader("access-control-allow-origin", origin);
  }
  response.setHeader("access-control-allow-methods", "GET, PUT, POST, DELETE, OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}

function createEditorOriginFromRequest(request) {
  try {
    const url = new URL(`http://${request.headers.host ?? "localhost"}`);
    url.port = "4174";
    return url.origin;
  } catch {
    return "";
  }
}

function isEditorOriginForRequest(request, origin) {
  if (!origin) {
    return false;
  }
  try {
    const requestUrl = new URL(`http://${request.headers.host ?? "localhost"}`);
    const originUrl = new URL(origin);
    return originUrl.hostname === requestUrl.hostname && originUrl.port === "4174";
  } catch {
    return false;
  }
}

function deriveHomeAssistantRestApiUrl(sourceUrl, pathname) {
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    url.pathname = pathname;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function deriveHomeAssistantWebSocketApiUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/api/websocket";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

async function requestHomeAssistantLovelaceResourcesViaWebSocket(sourceUrl, token) {
  const websocketUrl = deriveHomeAssistantWebSocketApiUrl(sourceUrl);
  if (!websocketUrl) {
    return { ok: false, error: "home assistant websocket url is invalid" };
  }
  if (typeof WebSocket !== "function") {
    return { ok: false, error: "server WebSocket runtime is unavailable" };
  }

  const commands = ["lovelace/resources", "lovelace/resources/list"];
  const failures = [];
  for (const command of commands) {
    const result = await requestHomeAssistantLovelaceResourcesCommand(websocketUrl, token, command);
    if (result.ok) return result;
    failures.push(`${command}: ${result.error}`);
  }
  return { ok: false, error: failures.join("; ") };
}

function requestHomeAssistantLovelaceResourcesCommand(websocketUrl, token, command) {
  return new Promise(resolveRequest => {
    let settled = false;
    let requestSent = false;
    const socket = new WebSocket(websocketUrl);
    const timeout = setTimeout(() => {
      finish({ ok: false, command, error: "timeout after 8s" });
    }, 8000);

    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        socket.close();
      } catch {
        // Ignore close errors after a failed Home Assistant connection.
      }
      resolveRequest(result);
    };

    socket.addEventListener("message", event => {
      let message;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }

      if (message?.type === "auth_required") {
        socket.send(JSON.stringify({ type: "auth", access_token: token }));
        return;
      }

      if (message?.type === "auth_invalid") {
        finish({ ok: false, command, error: message.message ?? "auth invalid" });
        return;
      }

      if (message?.type === "auth_ok" && !requestSent) {
        requestSent = true;
        socket.send(JSON.stringify({ id: 1, type: command }));
        return;
      }

      if (message?.id === 1 && message?.type === "result") {
        if (!message.success) {
          finish({ ok: false, command, error: message.message ?? "command failed" });
          return;
        }
        finish({
          ok: true,
          command,
          resources: extractLovelaceResourcesFromPayload(message.result),
        });
      }
    });

    socket.addEventListener("error", () => {
      finish({ ok: false, command, error: "websocket error" });
    });

    socket.addEventListener("close", () => {
      if (!settled) finish({ ok: false, command, error: "websocket closed" });
    });
  });
}

function extractLovelaceResourcesFromPayload(payload) {
  const resources = [];
  const visit = value => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && typeof item.url === "string" && item.url.trim()) {
          resources.push({
            url: item.url.trim(),
            ...(typeof item.type === "string" && item.type.trim() ? { type: item.type.trim() } : {}),
          });
        }
      }
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === "resources" && Array.isArray(child)) {
        visit(child);
      } else if (child && typeof child === "object" && !Array.isArray(child)) {
        visit(child);
      }
    }
  };
  visit(payload);
  const seen = new Set();
  return resources.filter(resource => {
    const key = resource.url.split("?")[0].toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getAdminDeviceBinding() {
  if (adminDeviceBinding) {
    return adminDeviceBinding;
  }

  const installationId = readOrCreateAdminInstallationId();
  adminDeviceBinding = {
    version: 1,
    installationId,
    bindingFingerprint: createHash("sha256")
      .update(`atlas-admin-device:${installationId}`)
      .digest("hex"),
    source: process.env.ATLAS_INSTANCE_ID ? "env" : "local-data",
  };
  return adminDeviceBinding;
}

function readOrCreateAdminInstallationId() {
  if (process.env.ATLAS_INSTANCE_ID?.trim()) {
    return process.env.ATLAS_INSTANCE_ID.trim();
  }

  try {
    if (existsSync(adminDeviceFilePath)) {
      const saved = JSON.parse(readFileSync(adminDeviceFilePath, "utf8"));
      if (typeof saved.installationId === "string" && saved.installationId.trim()) {
        return saved.installationId.trim();
      }
    }
  } catch {
    // A broken local identity file is replaced with a new installation identity.
  }

  const installationId = randomUUID();
  try {
    mkdirSync(dirname(adminDeviceFilePath), { recursive: true });
    writeFileSync(
      adminDeviceFilePath,
      JSON.stringify({
        version: 1,
        installationId,
        createdAt: new Date().toISOString(),
      }, null, 2),
      "utf8",
    );
  } catch {
    // If local data is unavailable, the runtime-only identity still keeps copied secrets from silently loading elsewhere.
  }
  return installationId;
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 65536) {
        rejectBody(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

function normalizeAdminConnectionSettings(settings, previousSettings) {
  const translationProvider = normalizeTranslationProvider(settings.translationProvider);
  const translationApiKeys = normalizeTranslationApiKeys(settings.translationApiKeys, previousSettings?.translationApiKeys);
  return {
    url: typeof settings.url === "string" ? settings.url : "",
    token: typeof settings.token === "string" ? settings.token : "",
    rememberToken: settings.rememberToken === true,
    autoConnectEditor: settings.autoConnectEditor === true,
    editorStartMode: normalizeEditorStartMode(settings.editorStartMode),
    translationProvider,
    translationApiEndpoint: normalizeTranslationApiEndpoint(settings.translationApiEndpoint),
    translationApiKeys,
    translationApiKeyConfigured: hasTranslationApiKey(translationProvider, translationApiKeys),
    parcelProviders: normalizeParcelProviderSettings(settings.parcelProviders),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeTranslationProvider(value) {
  return translationProviderValues.includes(value) ? value : "none";
}

function normalizeTranslationApiEndpoint(value) {
  if (typeof value !== "string" || !value.trim()) {
    return defaultTranslationApiEndpoint;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : defaultTranslationApiEndpoint;
  } catch {
    return defaultTranslationApiEndpoint;
  }
}

function normalizeTranslationApiKeys(keys, previousKeys = {}) {
  return Object.fromEntries(
    translationProviderValues
      .filter(provider => provider !== "none")
      .map(provider => {
        const nextKey = typeof keys?.[provider] === "string" ? keys[provider].trim() : "";
        const previousKey = typeof previousKeys?.[provider] === "string" ? previousKeys[provider].trim() : "";
        return [provider, nextKey || previousKey];
      }),
  );
}

function hasTranslationApiKey(provider, keys) {
  return Boolean(keys?.[normalizeTranslationProvider(provider)]?.trim());
}

function normalizeParcelProviderSettings(value) {
  const savedProviders = Array.isArray(value?.providers) ? value.providers : Array.isArray(value) ? value : [];
  const savedById = new Map(savedProviders
    .filter(provider => provider && typeof provider.id === "string")
    .map(provider => [provider.id, provider]));

  return {
    version: 1,
    providers: parcelProviderDefaults.map(provider => {
      const saved = savedById.get(provider.id);
      return {
        ...provider,
        enabled: typeof saved?.enabled === "boolean"
          ? saved.enabled
          : provider.status === "ready",
        trackingUrl: typeof saved?.trackingUrl === "string" && saved.trackingUrl.trim()
          ? saved.trackingUrl.trim()
          : provider.trackingUrl,
      };
    }),
  };
}

function createInitialAdminConnectionSettingsFromEnv() {
  const url = process.env.ATLAS_ADMIN_HOME_ASSISTANT_URL?.trim() ?? "";
  const token = process.env.ATLAS_ADMIN_HOME_ASSISTANT_TOKEN?.trim() ?? "";
  const rememberToken = process.env.ATLAS_ADMIN_REMEMBER_HOME_ASSISTANT_TOKEN === "1";
  const autoConnectEditor = process.env.ATLAS_ADMIN_AUTO_CONNECT_EDITOR === "1";
  const editorStartMode = normalizeEditorStartMode(process.env.ATLAS_ADMIN_EDITOR_START_MODE);
  const tokenUsable = isPlausibleHomeAssistantAccessToken(token);

  if (!url && (!rememberToken || !token) && !autoConnectEditor && editorStartMode === "simple") {
    return undefined;
  }

  if (rememberToken && token && !tokenUsable) {
    console.warn(`ATLAS ignored Add-on Home Assistant token value with length ${token.length}.`);
  } else if (rememberToken && tokenUsable) {
    console.log(`ATLAS imported Add-on Home Assistant token with length ${token.length}.`);
  }

  return normalizeAdminConnectionSettings({
    url,
    token: rememberToken && tokenUsable ? token : "",
    rememberToken,
    autoConnectEditor,
    editorStartMode,
    translationProvider: "none",
  });
}

function normalizeEditorStartMode(value) {
  return value === "expert" ? "expert" : "simple";
}

function isPlausibleHomeAssistantAccessToken(token) {
  if (!token) return false;
  if (token.length < 80) return false;
  if (/^\*+$/.test(token) || /^•+$/.test(token)) return false;
  return true;
}

function canReadAdminConnectionSecrets(request, requestUrl) {
  return requestUrl.searchParams.get("includeSecrets") === "1"
    && !isEditorOriginForRequest(request, request.headers.origin);
}

function sanitizeAdminConnectionSettings(settings, { includeSecrets = false } = {}) {
  return {
    url: settings.url,
    token: settings.token,
    rememberToken: settings.rememberToken,
    autoConnectEditor: settings.autoConnectEditor,
    editorStartMode: normalizeEditorStartMode(settings.editorStartMode),
    distributionTarget: process.env.ATLAS_DISTRIBUTION_TARGET ?? "standalone-docker-preview",
    translationProvider: settings.translationProvider,
    translationApiEndpoint: settings.translationApiEndpoint,
    translationApiKeyConfigured: settings.translationApiKeyConfigured,
    translationApiKeyConfiguredByProvider: Object.fromEntries(
      translationProviderValues
        .filter(provider => provider !== "none")
        .map(provider => [provider, hasTranslationApiKey(provider, settings.translationApiKeys)]),
    ),
    parcelProviders: normalizeParcelProviderSettings(settings.parcelProviders),
    ...(includeSecrets ? { translationApiKeys: settings.translationApiKeys } : {}),
    updatedAt: settings.updatedAt,
  };
}

function normalizeCardTranslationRequest(request) {
  const provider = normalizeTranslationProvider(request.provider);
  const languages = Array.isArray(request.languages)
    ? [...new Set(request.languages.map(language => String(language).trim().toLowerCase()).filter(language => /^[a-z]{2}$/.test(language) && language !== "en"))]
    : [];
  const sourceLocale = request.sourceLocale;
  if (!provider || provider === "none") {
    return { ok: false, error: "translation provider is required" };
  }
  if (languages.length === 0) {
    return { ok: false, error: "at least one target language is required" };
  }
  if (!sourceLocale || typeof sourceLocale !== "object" || !sourceLocale.card || typeof sourceLocale.card !== "object") {
    return { ok: false, error: "source locale card content is required" };
  }

  return {
    ok: true,
    value: {
      provider,
      languages,
      sourceLocale: {
        card: {
          title: String(sourceLocale.card.title ?? ""),
          unavailable: String(sourceLocale.card.unavailable ?? ""),
          replaceDemoEntities: String(sourceLocale.card.replaceDemoEntities ?? ""),
        },
      },
    },
  };
}

async function translateCardLocaleWithOpenAi({ apiKey, languages, sourceLocale }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: openAiTranslationModel,
      store: false,
      instructions: [
        "You translate Home Assistant custom card locale strings.",
        "Return only JSON matching the schema.",
        "Preserve product names, placeholders, punctuation style and technical terms such as Home Assistant, ATLAS, HACS and entity IDs.",
        "Do not add explanations.",
      ].join(" "),
      input: JSON.stringify({
        sourceLanguage: "en",
        targetLanguages: languages,
        sourceCardLocale: sourceLocale.card,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "atlas_card_locale_translations",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["translations"],
            properties: {
              translations: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["language", "card"],
                  properties: {
                    language: { type: "string" },
                    card: {
                      type: "object",
                      additionalProperties: false,
                      required: ["title", "unavailable", "replaceDemoEntities"],
                      properties: {
                        title: { type: "string" },
                        unavailable: { type: "string" },
                        replaceDemoEntities: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  const responseBody = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(responseBody?.error?.message ?? `OpenAI translation failed with HTTP ${response.status}`);
  }

  const outputText = extractOpenAiOutputText(responseBody);
  if (!outputText) {
    throw new Error("OpenAI translation did not return JSON text");
  }

  const parsed = JSON.parse(outputText);
  const translations = Array.isArray(parsed.translations) ? parsed.translations : [];
  return translations
    .filter(translation => languages.includes(String(translation.language ?? "").toLowerCase()))
    .map(translation => {
      const language = String(translation.language).toLowerCase();
      return {
        language,
        path: `locales/${language}.json`,
        status: "machine",
        content: {
          _meta: {
            language,
            status: "machine",
            sourceLanguage: "en",
            provider: "chatgpt",
            model: openAiTranslationModel,
            note: "Machine translated by the configured ChatGPT/OpenAI provider. Review before publishing.",
          },
          card: {
            title: String(translation.card?.title ?? sourceLocale.card.title),
            unavailable: String(translation.card?.unavailable ?? sourceLocale.card.unavailable),
            replaceDemoEntities: String(translation.card?.replaceDemoEntities ?? sourceLocale.card.replaceDemoEntities),
          },
        },
      };
    });
}

function extractOpenAiOutputText(responseBody) {
  if (typeof responseBody?.output_text === "string") {
    return responseBody.output_text;
  }

  for (const item of responseBody?.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function resolveRequestFilePath(requestedFilePath) {
  if (existsSync(requestedFilePath) && statSync(requestedFilePath).isDirectory()) {
    return resolve(requestedFilePath, "index.js");
  }

  return !existsSync(requestedFilePath) && extname(requestedFilePath) === ""
    ? `${requestedFilePath}.js`
    : requestedFilePath;
}
