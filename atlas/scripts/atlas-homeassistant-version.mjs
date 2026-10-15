import semver from "semver";

// HA uses Python-style prereleases. Never turn a beta/dev build into a stable
// release merely to make a plugin's stable range match.
export function normalizeHomeAssistantVersion(value) {
  if (typeof value !== "string" || value.length > 80) return undefined;
  const stableOrSemver = semver.valid(value);
  if (stableOrSemver) return stableOrSemver;
  const match = /^(\d+\.\d+\.\d+)(?:(b|rc)(\d+)|\.dev(\d+))$/.exec(value);
  if (!match) return undefined;
  const label = match[2] === "b" ? "beta" : match[2] ?? "dev";
  return semver.valid(`${match[1]}-${label}.${match[3] ?? match[4]}`) ?? undefined;
}

export async function discoverHomeAssistantVersion(settings, { fetchImpl = fetch, timeoutMs = 3000 } = {}) {
  const unavailable = reason => ({ status: "unavailable", reason });
  if (!settings?.url || !settings?.token) return unavailable("not-configured");
  let url;
  try {
    url = new URL(settings.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return unavailable("invalid-url");
    url.pathname = "/api/config";
    url.search = "";
    url.hash = "";
  } catch { return unavailable("invalid-url"); }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { authorization: `Bearer ${settings.token}`, accept: "application/json" },
      redirect: "error", signal: controller.signal,
    });
    if (!response.ok) {
      await response.body?.cancel();
      return unavailable([401, 403].includes(response.status) ? "unauthorized" : "http-error");
    }
    // /api/config contains private configuration. Bound it, extract only the
    // version and never forward or log the payload or remote error messages.
    let size = 0;
    const chunks = [];
    if (!response.body) return unavailable("invalid-response");
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 256 * 1024) return unavailable("invalid-response");
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const version = normalizeHomeAssistantVersion(body?.version);
    if (!version) return unavailable("invalid-version");
    return { status: "available", source: "admin-rest", version, rawVersion: body.version };
  } catch {
    return unavailable(controller.signal.aborted ? "timeout" : "request-failed");
  } finally { clearTimeout(timer); }
}
