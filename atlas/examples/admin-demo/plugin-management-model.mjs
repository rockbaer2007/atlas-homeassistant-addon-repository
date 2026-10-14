// Shared metadata only. Credentials, project contents and package files are excluded.
const types = new Set(["plugin", "card", "integration", "tool", "theme"]);
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
const text = value => typeof value === "string" ? value.slice(0, 2048) : "";
const ids = values => [...new Set(values.filter(value => typeof value === "string" && idPattern.test(value)))].sort();
const strings = values => [...new Set(values.filter(value => typeof value === "string" && value.length <= 128 && !/[\x00-\x1f]/.test(value)))].sort();

function list(value) {
  if (!Array.isArray(value) || value.length > 200) throw new Error("Invalid plugin management list");
  return value;
}

function publicUrl(value) {
  if (!value) return "";
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash
    || url.pathname.includes("/api/hassio_ingress/")) throw new Error("Use a public URL without credentials or session paths");
  return url.href;
}

function localized(value) {
  return Object.fromEntries(["de", "en", "fr"].filter(key => typeof value?.[key] === "string").map(key => [key, text(value[key])]));
}

export function normalizePluginManagement(value) {
  if (!value || typeof value !== "object") throw new Error("Invalid plugin management state");
  const repositories = list(value.repositories).map(repository => {
    const url = publicUrl(repository.url);
    if (!url) throw new Error("Repository URL is required");
    return { id: text(repository.id), name: text(repository.name), url, type: types.has(repository.type) ? repository.type : "plugin" };
  });
  const plugins = list(value.plugins).map(plugin => {
    if (!idPattern.test(plugin.id)) throw new Error("Invalid plugin id");
    const result = { id: plugin.id, name: text(plugin.name) || plugin.id, version: text(plugin.version),
      nameI18n: localized(plugin.nameI18n), description: text(plugin.description), descriptionI18n: localized(plugin.descriptionI18n),
      source: plugin.source === "repository" ? "repository" : "package",
      slug: typeof plugin.slug === "string" && /^[a-z0-9-]+$/.test(plugin.slug) ? plugin.slug : plugin.id.split(".").at(-1),
      capabilities: strings(list(plugin.capabilities ?? plugin.provides ?? [])), provides: strings(list(plugin.provides ?? plugin.capabilities ?? [])),
      extensionPoints: strings(list(plugin.extensionPoints ?? [])),
      repositoryId: text(plugin.repositoryId), repositoryName: text(plugin.repositoryName),
      repositoryType: types.has(plugin.repositoryType) ? plugin.repositoryType : "plugin", installedAt: text(plugin.installedAt),
    };
    // Local asset URLs are rebuilt from the server catalog for each browser address.
    for (const key of ["repositoryUrl", "manifestUrl", "packageUrl"]) result[key] = publicUrl(plugin[key]);
    if (plugin.compatibility && typeof plugin.compatibility === "object") {
      result.compatibility = Object.fromEntries(["atlas", "host", "homeassistant"].filter(key => typeof plugin.compatibility[key] === "string").map(key => [key, text(plugin.compatibility[key])]));
    }
    return result;
  });
  const unique = (entries, key) => [...new Map(entries.map(entry => [entry[key], entry])).values()].sort((a, b) => a[key].localeCompare(b[key]));
  return { repositories: unique(repositories, "url"), plugins: unique(plugins, "id"), activePluginIds: ids(list(value.activePluginIds)) };
}

export function mergePluginManagement(currentValue, incomingValue, preference = "server") {
  const current = normalizePluginManagement(currentValue);
  const incoming = normalizePluginManagement(incomingValue);
  const conflicts = [];
  const merge = (server, local, key, kind) => {
    const result = new Map(server.map(item => [item[key], item]));
    for (const item of local) {
      const existing = result.get(item[key]);
      if (existing && JSON.stringify(existing) !== JSON.stringify(item)) {
        conflicts.push({ kind, id: item[key] });
        if (preference !== "local") continue;
      }
      result.set(item[key], item);
    }
    return [...result.values()];
  };
  const repositories = merge(current.repositories, incoming.repositories, "url", "repository");
  const plugins = merge(current.plugins, incoming.plugins, "id", "plugin");
  const active = new Set(current.activePluginIds);
  const known = new Set(current.plugins.map(plugin => plugin.id));
  for (const plugin of incoming.plugins) {
    const serverActive = active.has(plugin.id);
    const localActive = incoming.activePluginIds.includes(plugin.id);
    if (known.has(plugin.id) && serverActive !== localActive) {
      conflicts.push({ kind: "activation", id: plugin.id });
      if (preference !== "local") continue;
    }
    if (localActive) active.add(plugin.id); else active.delete(plugin.id);
  }
  for (const id of incoming.activePluginIds) if (!known.has(id)) active.add(id);
  return { state: normalizePluginManagement({ repositories, plugins, activePluginIds: [...active] }), conflicts };
}
