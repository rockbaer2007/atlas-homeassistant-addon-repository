import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

const terminalElement = document.querySelector("#terminal");
const tokenInput = document.querySelector("#access-token");
const connectButton = document.querySelector("#connect");
const disconnectButton = document.querySelector("#disconnect");
const targetSelect = document.querySelector("#target-select");
const fontInput = document.querySelector("#font-size");
const fontValue = document.querySelector("#font-value");
const status = document.querySelector("#connection-status");
const languageButtons = [...document.querySelectorAll("[data-language]")];
const translations = {
  de: {
    targetLabel: "Ziel", localTarget: "ATLAS lokal", sshTarget: "Home Assistant · SSH",
    fontSize: "Schriftgröße", connect: "Verbinden", disconnect: "Trennen",
    tokenLabel: "Terminal-Zugriffstoken", tokenPlaceholder: "Serverseitig konfiguriertes Token eingeben",
    show: "Anzeigen", hide: "Verbergen", forgetToken: "Gespeichertes Token löschen",
    tokenHelp: "Das Token wird lokal in diesem Browser gespeichert und nur zum Verbinden an den Server gesendet.",
    disconnected: "Getrennt", footer: "ANSI-Farben · Oh-My-Posh-inspirierter Shell-Prompt",
    banner: "Verbindung benötigt ein serverseitiges Zugriffstoken.", tokenRequired: "Bitte das gültige Zugriffstoken eingeben",
    disabled: "Terminal serverseitig deaktiviert", configError: "Serverkonfiguration nicht erreichbar",
    connected: "Verbunden", badToken: "Zugriff verweigert: Token prüfen", denied: "Terminal deaktiviert oder Herkunft nicht erlaubt",
    failed: "Terminal-Verbindung fehlgeschlagen",
  },
  en: {
    targetLabel: "Target", localTarget: "ATLAS local", sshTarget: "Home Assistant · SSH",
    fontSize: "Font size", connect: "Connect", disconnect: "Disconnect",
    tokenLabel: "Terminal access token", tokenPlaceholder: "Enter the token configured on the server",
    show: "Show", hide: "Hide", forgetToken: "Forget saved token",
    tokenHelp: "The token is stored locally in this browser and sent to the server only when connecting.",
    disconnected: "Disconnected", footer: "ANSI colors · Oh My Posh-inspired shell prompt",
    banner: "A server-side access token is required to connect.", tokenRequired: "Enter the valid access token",
    disabled: "Terminal is disabled on the server", configError: "Could not load server configuration",
    connected: "Connected", badToken: "Access denied: check the token", denied: "Terminal disabled or origin not allowed",
    failed: "Terminal connection failed",
  },
};
let currentLanguage = readLanguage();
const socketPath = `${location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "")}/socket`;
let socket;
let accessToken = "";
const tokenStorageKey = "atlas.terminal.accessToken";
tokenInput.value = readStoredToken();

const terminal = new Terminal({
  cursorBlink: true,
  convertEol: false,
  fontFamily: '"Cascadia Code", "Fira Code", Consolas, "Liberation Mono", monospace',
  fontSize: readFontSize(),
  theme: {
    background: "#080d16",
    foreground: "#e7eef8",
    cursor: "#3bd49a",
    selectionBackground: "#345f9a88",
    black: "#18202d", red: "#ff6b73", green: "#3bd49a", yellow: "#ffd166",
    blue: "#5a9bff", magenta: "#d68cff", cyan: "#54d8e8", white: "#dce7f5",
    brightBlack: "#718096", brightRed: "#ff858b", brightGreen: "#66e6b3", brightYellow: "#ffe09a",
    brightBlue: "#82b3ff", brightMagenta: "#e2adff", brightCyan: "#83e6ef", brightWhite: "#ffffff",
  },
});
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(terminalElement);
fitAddon.fit();
applyLanguage();
terminal.writeln(`\x1b[1;36mATLAS Terminal\x1b[0m  ·  \x1b[90m${translate("banner")}\x1b[0m`);

function readLanguage() {
  const stored = localStorage.getItem("atlas.terminal.language");
  if (stored === "de" || stored === "en") return stored;
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "de";
}

function translate(key) {
  return translations[currentLanguage]?.[key] ?? key;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });
  languageButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
  const localOption = targetSelect.querySelector('[value="local"]');
  if (localOption) localOption.textContent = translate("localTarget");
  const sshOption = targetSelect.querySelector('[value="ssh"]');
  if (sshOption) sshOption.textContent = translate("sshTarget");
}

function readFontSize() {
  const stored = Number(localStorage.getItem("atlas.terminal.fontSize"));
  return Number.isInteger(stored) && stored >= 11 && stored <= 26 ? stored : 14;
}

function readStoredToken() {
  try {
    return localStorage.getItem(tokenStorageKey) ?? "";
  } catch {
    return "";
  }
}

function saveStoredToken(value) {
  try {
    if (value) localStorage.setItem(tokenStorageKey, value);
    else localStorage.removeItem(tokenStorageKey);
  } catch {
    // Continue to allow a session when browser storage is unavailable.
  }
}

function setStatus(message, state = "") {
  status.textContent = message;
  status.dataset.state = state;
}

async function loadTerminalConfig() {
  try {
    const response = await fetch(`${location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "")}/config`, { cache: "no-store" });
    const config = await response.json();
    if (config.sshAvailable && !targetSelect.querySelector('[value="ssh"]')) {
      targetSelect.add(new Option(translate("sshTarget"), "ssh"));
    }
    if (!config.enabled) setStatus(translate("disabled"));
  } catch {
    setStatus(translate("configError"), "error");
  }
}

function connect() {
  accessToken = tokenInput.value.trim();
  if (accessToken.length < 32) {
    setStatus(translate("tokenRequired"), "error");
    tokenInput.focus();
    return;
  }
  const scheme = location.protocol === "https:" ? "wss:" : "ws:";
  const basePath = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  const query = new URLSearchParams({
    target: targetSelect.value,
    cols: String(terminal.cols),
    rows: String(terminal.rows),
  });
  const url = `${scheme}//${location.host}${basePath}/socket?${query}`;
  socket = new WebSocket(url, ["atlas-terminal.v1", `atlas-auth.${accessToken}`]);
  socket.addEventListener("open", () => {
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    targetSelect.disabled = true;
    tokenInput.disabled = true;
    setStatus(translate("connected"), "connected");
    terminal.clear();
    fitAddon.fit();
    send({ type: "resize", cols: terminal.cols, rows: terminal.rows });
    terminal.focus();
  });
  socket.addEventListener("message", event => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "output") terminal.write(message.data);
      else if (message.type === "error") setStatus(message.message, "error");
      else if (message.type === "exit") {
        terminal.writeln(`\r\n\x1b[90m[Sitzung beendet: ${message.code ?? "unbekannt"}]\x1b[0m`);
        disconnect();
      }
    } catch {
      terminal.write(String(event.data));
    }
  });
  socket.addEventListener("close", event => {
    if (event.code === 4401) setStatus(translate("badToken"), "error");
    else if (event.code === 4403) setStatus(translate("denied"), "error");
    else setStatus(translate("disconnected"));
    resetControls();
  });
  socket.addEventListener("error", () => setStatus(translate("failed"), "error"));
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function disconnect() {
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, "User disconnected");
  socket = undefined;
  accessToken = "";
  tokenInput.disabled = false;
  resetControls();
}

function resetControls() {
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  targetSelect.disabled = false;
}

terminal.onData(data => send({ type: "input", data }));
fontInput.value = String(terminal.options.fontSize);
fontValue.value = `${terminal.options.fontSize} px`;
fontInput.addEventListener("input", () => {
  const size = Number(fontInput.value);
  terminal.options.fontSize = size;
  fontValue.value = `${size} px`;
  localStorage.setItem("atlas.terminal.fontSize", String(size));
  fitAddon.fit();
  send({ type: "resize", cols: terminal.cols, rows: terminal.rows });
});
connectButton.addEventListener("click", connect);
disconnectButton.addEventListener("click", disconnect);
tokenInput.addEventListener("input", () => saveStoredToken(tokenInput.value));
document.querySelector("#forget-token").addEventListener("click", () => {
  saveStoredToken("");
  tokenInput.value = "";
  tokenInput.focus();
});
document.querySelector("#toggle-token").addEventListener("click", event => {
  const visible = tokenInput.type === "text";
  tokenInput.type = visible ? "password" : "text";
  event.currentTarget.textContent = translate(visible ? "show" : "hide");
});
languageButtons.forEach(button => button.addEventListener("click", () => {
  currentLanguage = button.dataset.language;
  localStorage.setItem("atlas.terminal.language", currentLanguage);
  applyLanguage();
}));
window.addEventListener("resize", () => {
  fitAddon.fit();
  send({ type: "resize", cols: terminal.cols, rows: terminal.rows });
});
loadTerminalConfig();
