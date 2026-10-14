const messages = {
  de: { hub: "Plugin Hub", editor: "Card Editor", admin: "Administration", reload: "Neu laden", open: "Separat öffnen", invalid: "Bitte eine gültige ATLAS-Laufzeitadresse in den Integrationseinstellungen hinterlegen.", mixed: "Diese HTTPS-Seite kann ATLAS über HTTP nicht einbetten. Verwende eine HTTPS-Laufzeitadresse oder öffne ATLAS separat.", waiting: "ATLAS wird geladen. Falls die Ansicht leer bleibt, prüfe die Laufzeitadresse und den Zugriff im Browser.", hint: "Die Verbindung zu Home Assistant wird weiterhin in der ATLAS-Administration eingerichtet.", frame: "ATLAS-Laufzeit" },
  en: { hub: "Plugin Hub", editor: "Card Editor", admin: "Administration", reload: "Reload", open: "Open separately", invalid: "Configure a valid ATLAS runtime address in the integration settings.", mixed: "This HTTPS page cannot embed ATLAS over HTTP. Use an HTTPS runtime address or open ATLAS separately.", waiting: "Loading ATLAS. If the view stays blank, check the runtime address and browser access.", hint: "The Home Assistant connection is still configured in ATLAS Administration.", frame: "ATLAS runtime" },
  fr: { hub: "Hub des plugins", editor: "Card Editor", admin: "Administration", reload: "Recharger", open: "Ouvrir séparément", invalid: "Configurez une adresse ATLAS valide dans les paramètres de l’intégration.", mixed: "Cette page HTTPS ne peut pas intégrer ATLAS en HTTP. Utilisez une adresse HTTPS ou ouvrez ATLAS séparément.", waiting: "Chargement d’ATLAS. Si la vue reste vide, vérifiez l’adresse et l’accès dans le navigateur.", hint: "La connexion à Home Assistant reste configurée dans l’Administration ATLAS.", frame: "Runtime ATLAS" },
};

export function runtimeTarget(value, route, language, theme, pageUrl) {
  if (typeof value !== "string" || /[%\s\\\x00-\x1f\x7f]/.test(value)) throw new Error("Invalid runtime URL");
  const base = new URL(value);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error("Invalid runtime URL");
  if (!/^[/A-Za-z0-9._~-]*$/.test(base.pathname) || value.split("/").some(part => part === "." || part === "..")) throw new Error("Invalid runtime path");
  const host = new URL(pageUrl);
  if (base.origin === host.origin && base.pathname === "/") throw new Error("Cannot embed the Home Assistant root");
  if (!["hub", "editor", "admin"].includes(route)) throw new Error("Invalid route");
  base.pathname = base.pathname.replace(/\/$/, "") + "/";
  const url = new URL(route, base);
  url.searchParams.set("language", Object.hasOwn(messages, language) ? language : "en");
  url.searchParams.set("theme", theme === "dark" ? "dark" : "light");
  return { url: url.href, mixed: host.protocol === "https:" && url.protocol === "http:" };
}

export class AtlasRuntimePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._route = "hub";
    this._language = "en";
    this._theme = "light";
    this._runtime = "";
  }

  set hass(value) {
    // Read only presentation preferences. Never retain auth, tokens or entity data.
    const language = String(value?.language || "en").split("-")[0];
    const theme = value?.themes?.darkMode ? "dark" : "light";
    if (language === this._language && theme === this._theme) return;
    this._language = language;
    this._theme = theme;
    this._refresh();
  }

  set panel(value) {
    const runtime = value?.config?.runtime_url || "";
    if (runtime === this._runtime) return;
    this._runtime = runtime;
    this._refresh();
  }

  connectedCallback() {
    if (!this._frame) this._build();
    this._refresh();
  }

  _build() {
    this.shadowRoot.innerHTML = `<style>
      :host{display:flex;flex-direction:column;height:100vh;height:100dvh;min-height:0;color:var(--primary-text-color);background:var(--primary-background-color);font-family:var(--paper-font-body1_-_font-family,Arial,sans-serif)}
      header{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px;border-bottom:1px solid var(--divider-color)}
      strong{margin-right:8px}nav{display:flex;flex-wrap:wrap;gap:6px}button,a{box-sizing:border-box;min-height:36px;min-width:110px;border:1px solid var(--divider-color);border-radius:6px;padding:7px 10px;background:var(--card-background-color);color:inherit;font:inherit;text-decoration:none;text-align:center;cursor:pointer}button[aria-pressed=true]{border-color:var(--primary-color);color:var(--primary-color)}#menu{flex:0 0 36px;min-width:36px}
      p{margin:0;padding:8px 12px;font-size:13px;color:var(--secondary-text-color)}p[role=status]{color:var(--primary-text-color)}iframe{flex:1;width:100%;min-height:360px;border:0;background:var(--primary-background-color)}[hidden]{display:none!important}@media(max-width:600px){header{gap:6px}nav{width:100%}button,a{flex:1;min-width:90px}iframe{min-height:300px}}
      </style><header><button id="menu">&#9776;</button><strong>ATLAS</strong><nav></nav><button id="reload"></button><a id="open" target="_blank" rel="noopener noreferrer"></a></header><p id="hint"></p><p id="status" role="status"></p><iframe referrerpolicy="no-referrer"></iframe>`;
    this._frame = this.shadowRoot.querySelector("iframe");
    this._buttons = {};
    this.shadowRoot.querySelector("#menu").addEventListener("click", event => this._toggleMenu(event));
    for (const route of ["hub", "editor", "admin"]) {
      const button = document.createElement("button");
      button.addEventListener("click", () => { this._route = route; this._refresh(); });
      this.shadowRoot.querySelector("nav").append(button);
      this._buttons[route] = button;
    }
    this.shadowRoot.querySelector("#reload").addEventListener("click", () => {
      if (!this._frame.hidden && this._target) this._frame.src = this._target;
    });
    this._frame.addEventListener("load", () => {
      if (!this._frame.hidden) this.shadowRoot.querySelector("#status").hidden = true;
    });
  }

  _toggleMenu(event) {
    // The original outside click must not dismiss the drawer just opened by HA.
    event?.stopPropagation();
    const request = new Event("hass-toggle-menu", { bubbles: true, composed: true });
    request.detail = { open: true };
    this.dispatchEvent(request);
  }

  _refresh() {
    if (!this._frame) return;
    const text = messages[this._language] || messages.en;
    const menuLabel = {de:"HA-Menü öffnen",en:"Open HA menu",fr:"Ouvrir le menu HA"}[this._language] || "Open HA menu";
    this.shadowRoot.querySelector("#menu").setAttribute("aria-label", menuLabel);
    for (const [route, button] of Object.entries(this._buttons)) {
      button.textContent = text[route];
      button.setAttribute("aria-pressed", String(route === this._route));
    }
    const open = this.shadowRoot.querySelector("#open");
    const reload = this.shadowRoot.querySelector("#reload");
    const status = this.shadowRoot.querySelector("#status");
    open.textContent = text.open;
    reload.textContent = text.reload;
    this.shadowRoot.querySelector("#hint").textContent = text.hint;
    this._frame.title = text.frame;
    try {
      const target = runtimeTarget(this._runtime, this._route, this._language, this._theme, location.href);
      open.href = target.url;
      open.hidden = false;
      reload.disabled = target.mixed;
      this._frame.hidden = target.mixed;
      if (target.mixed) {
        status.textContent = text.mixed;
        status.hidden = false;
        this._frame.removeAttribute("src");
        this._target = undefined;
      } else if (target.url !== this._target) {
        status.textContent = text.waiting;
        status.hidden = false;
        this._target = target.url;
        this._frame.src = target.url;
      }
    } catch {
      status.textContent = text.invalid;
      status.hidden = false;
      open.hidden = true;
      open.removeAttribute("href");
      reload.disabled = true;
      this._frame.hidden = true;
      this._frame.removeAttribute("src");
      this._target = undefined;
    }
  }
}

if (!customElements.get("atlas-runtime-panel")) customElements.define("atlas-runtime-panel", AtlasRuntimePanel);
