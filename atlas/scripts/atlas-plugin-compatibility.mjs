import semver from "semver";

// Evaluate every declaration independently: a catalog cannot loosen a manifest.
export function checkPluginCompatibility(sources, context) {
  const checks = [];
  let declared = false;
  for (const [source, value] of Object.entries(sources)) {
    if (value === undefined) continue;
    declared = true;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      checks.push({ source, field: "metadata", status: "unsupported", reason: "invalid" });
      continue;
    }
    for (const [field, required] of Object.entries(value)) {
      if (required === "" || required === undefined) continue;
      const key = field === "homeassistant" ? "homeAssistant" : field;
      const check = { source, field: key, required, status: "supported", reason: "matches" };
      if (!["atlas", "host", "homeAssistant"].includes(key)) {
        check.status = "unknown"; check.reason = "unknown-field";
      } else if (key === "host") {
        const hosts = typeof required === "string" ? [required] : required;
        if (!Array.isArray(hosts) || !hosts.length || hosts.some(h => typeof h !== "string" || !h.trim())) {
          check.status = "unsupported"; check.reason = "invalid";
        } else if (!hosts.some(h => context.hosts.includes(h))) {
          check.status = "unsupported"; check.reason = "mismatch";
        }
        check.actual = context.hosts.join(", ");
      } else {
        check.actual = key === "atlas" ? context.atlas : context.homeAssistant;
        if (typeof required !== "string" || required.length > 256 || !semver.validRange(required)) {
          check.status = "unsupported"; check.reason = "invalid";
        } else if (!semver.valid(check.actual ?? "")) {
          check.status = "unknown"; check.reason = "unavailable";
        } else if (!semver.satisfies(check.actual, required)) {
          check.status = "unsupported"; check.reason = "mismatch";
        }
      }
      checks.push(check);
    }
  }
  if (!declared || !checks.length) checks.push({ field: "metadata", status: "unknown", reason: "missing" });
  const status = checks.some(c => c.status === "unsupported") ? "unsupported"
    : checks.some(c => c.status === "unknown") ? "unknown" : "supported";
  return { status, checks };
}

export function compatibilityHostContext(distribution) {
  // administration-local is the historic name for the common Node installer.
  const hosts = ["administration-local", distribution];
  if (distribution === "home-assistant-app-preview") hosts.push("homeassistant");
  if (distribution === "standalone-docker-preview") hosts.push("docker");
  if (distribution === "linux-installer") hosts.push("linux");
  return hosts;
}
