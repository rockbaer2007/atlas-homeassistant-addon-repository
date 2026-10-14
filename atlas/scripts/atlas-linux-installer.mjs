import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, isIP } from "node:net";

const repository = resolve(import.meta.dirname, "..");
const runtimeEntries = ["package.json", "scripts", "examples/admin-demo", "examples/plugin-hub", "examples/status-demo", "packages", "atlas-plugins/homeassistant-card-editor", "node_modules"];
const requiredFiles = ["scripts/atlas-app-server.mjs", "examples/admin-demo/server.mjs", "examples/status-demo/app.js", "examples/admin-demo/mdi-icons.json", "packages/homeassistant/dist/index.js"];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 60000, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message ?? result.stderr?.trim() ?? result.status}`);
  return result.stdout?.trim() ?? "";
}

export function runtimePlatform() {
  const glibc = process.report.getReport().header.glibcVersionRuntime;
  return { platform: process.platform, arch: process.arch, nodeAbi: process.versions.modules, libc: glibc ? "glibc" : "musl" };
}

export function runtimeNetwork(contents) {
  const setting = (name, fallback) => {
    const lines = contents.split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith(name + "="));
    let value = lines.at(-1)?.slice(name.length + 1).trim() ?? fallback;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return value;
  };
  const ports = ["APP", "ADMIN", "DEMO"].map((name, index) => {
    const value = setting("ATLAS_" + name + "_PORT", String([4176, 4175, 4174][index]));
    if (!/^\d+$/.test(value)) throw new Error("Use numeric ATLAS ports in the environment file");
    return Number(value);
  });
  if (new Set(ports).size !== 3 || ports.some(port => port < 1 || port > 65535)) throw new Error("Use three distinct valid ATLAS ports");
  let host = setting("ATLAS_APP_HOST", setting("ATLAS_HOST", "127.0.0.1"));
  if (!isIP(host) && host !== "localhost") throw new Error("Use an IP address or localhost for ATLAS_APP_HOST");
  if (host === "0.0.0.0") host = "127.0.0.1";
  if (host === "::") host = "::1";
  return { ports, healthUrl: `http://${isIP(host) === 6 ? "[" + host + "]" : host}:${ports[0]}` };
}

export function validateRuntime(source) {
  const manifest = JSON.parse(readFileSync(join(source, "atlas-linux-runtime.json"), "utf8"));
  const actual = runtimePlatform();
  if (manifest.kind !== "atlas.linux.runtime" || manifest.schemaVersion !== 1
      || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(manifest.version)) throw new Error("Invalid Linux runtime manifest");
  for (const field of ["platform", "arch", "nodeAbi", "libc"]) {
    if (manifest[field] !== actual[field]) throw new Error(`Runtime ${field} mismatch; build a package for this Linux host and Node ABI`);
  }
  for (const file of requiredFiles) if (!existsSync(join(source, file))) throw new Error(`Incomplete runtime: ${file}`);
  run(process.execPath, ["-e", 'require("node-pty"); require("ws"); require("tar");'], { cwd: source });
  return manifest;
}

export function prepareLinuxRuntime(output) {
  if (process.platform !== "linux" || !["x64", "arm64"].includes(process.arch)) throw new Error("Prepare the runtime on Linux x64 or arm64");
  if (existsSync(output)) throw new Error("Output already exists; choose a new package directory");
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Node.js 22 or newer is required");
  for (const file of requiredFiles) if (!existsSync(join(repository, file))) throw new Error(`Run pnpm build first: missing ${file}`);
  const version = readFileSync(join(repository, "packaging/home-assistant-app/atlas/config.yaml"), "utf8").match(/^version: "(.*?)"/m)?.[1];
  if (!version) throw new Error("Missing ATLAS app version");
  mkdirSync(output, { recursive: true, mode: 0o755 });
  for (const entry of runtimeEntries) cpSync(join(repository, entry), join(output, entry), { recursive: true, verbatimSymlinks: true });
  writeFileSync(join(output, "atlas-linux-runtime.json"), JSON.stringify({
    kind: "atlas.linux.runtime", schemaVersion: 1, version, ...runtimePlatform(), preparedAt: new Date().toISOString(),
  }, null, 2) + "\n");
  validateRuntime(output);
  console.log(`Prepared Linux runtime ${version}: ${output}`);
}

export function createUnit({ app, state, environment, node }) {
  return `# Managed by ATLAS Linux installer; put local changes in atlas.service.d/.
[Unit]
Description=ATLAS Administration and Home Assistant Card Editor
After=network.target

[Service]
Type=exec
User=atlas
Group=atlas
WorkingDirectory=${state}
Environment=HOME=${state}
EnvironmentFile=${environment}
ExecStart=${node} ${app}/current/scripts/atlas-app-server.mjs
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
KillMode=control-group
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
`;
}

export class LinuxInstallation {
  constructor({ prefix = "/", service, provision, health, portsAvailable } = {}) {
    if (!isAbsolute(prefix) || !/^\/[a-zA-Z0-9_./-]*$/.test(prefix)) throw new Error("Use an absolute prefix without spaces or systemd specifiers");
    this.prefix = resolve(prefix);
    this.app = join(this.prefix, "opt/atlas");
    this.state = join(this.prefix, "var/lib/atlas");
    this.environment = join(this.prefix, "etc/atlas/atlas.env");
    this.unit = join(this.prefix, "etc/systemd/system/atlas.service");
    this.backups = join(this.prefix, "var/backups/atlas");
    this.manifest = join(this.app, "installation.json");
    this.service = service ?? ((...args) => {
      if (args[0] === "is-active") return spawnSync("systemctl", [...args, "atlas.service"], { timeout: 60000 }).status === 0;
      run("systemctl", args[0] === "daemon-reload" ? args : [...args, "atlas.service"]);
      return true;
    });
    this.provision = provision ?? (() => this.provisionAccount());
    this.health = health ?? (() => this.waitHealthy());
    this.portsAvailable = portsAvailable ?? (() => this.checkPorts());
  }

  assertPaths() {
    for (const path of [this.app, this.state, this.environment, this.unit, this.backups]) {
      let candidate = path;
      while (candidate !== dirname(candidate)) {
        if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) throw new Error(`Refusing symlink-managed path: ${candidate}`);
        candidate = dirname(candidate);
      }
    }
  }

  readInstallation() {
    if (!existsSync(this.manifest)) return undefined;
    const saved = JSON.parse(readFileSync(this.manifest, "utf8"));
    if (saved.kind !== "atlas.linux.installation" || saved.state !== this.state || saved.node !== process.execPath) throw new Error("Installation identity/path mismatch; explicit migration required");
    this.assertRelease(saved.current);
    if (saved.previous) this.assertRelease(saved.previous);
    return saved;
  }

  assertRelease(path) {
    if (!isAbsolute(path) || dirname(path) !== join(this.app, "releases") || lstatSync(path).isSymbolicLink()) throw new Error("Invalid managed release");
  }

  provisionAccount() {
    const result = spawnSync("getent", ["passwd", "atlas"], { encoding: "utf8" });
    if (result.status === 0) {
      const account = result.stdout.trim().split(":");
      if (!(Number(account[2]) > 0 && Number(account[3]) > 0)) throw new Error("The atlas service account must not use root UID/GID");
      if (account[5] !== this.state) throw new Error("Existing atlas account has a different home; refusing to adopt it");
      if (run("id", ["-gn", "atlas"]) !== "atlas") throw new Error("Existing atlas account has a different primary group");
    } else {
      run("useradd", ["--system", "--user-group", "--home-dir", this.state, "--shell", "/usr/sbin/nologin", "atlas"]);
    }
    // Never recursively change ownership of existing plugin/user files.
    run("chown", ["atlas:atlas", this.state]);
  }

  backup() {
    this.assertPaths();
    mkdirSync(this.backups, { recursive: true, mode: 0o700 });
    const backup = mkdtempSync(join(this.backups, new Date().toISOString().replace(/[:.]/g, "-") + "-"));
    for (const [name, source] of [["data", this.state], ["configuration", dirname(this.environment)], ["unit", this.unit], ["drop-ins", this.unit + ".d"], ["installation.json", this.manifest]]) {
      if (existsSync(source)) cpSync(source, join(backup, name), { recursive: true, verbatimSymlinks: true, preserveTimestamps: true });
    }
    writeFileSync(join(backup, "backup.json"), JSON.stringify({ kind: "atlas.linux.backup", state: this.state, createdAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
    console.log(`Backup: ${backup}`);
    return backup;
  }

  switchRelease(release) {
    this.assertRelease(release);
    const pending = join(this.app, ".current-" + randomUUID());
    symlinkSync(release, pending);
    renameSync(pending, join(this.app, "current"));
  }

  saveInstallation(saved) {
    const pending = this.manifest + ".pending";
    writeFileSync(pending, JSON.stringify(saved, null, 2) + "\n", { mode: 0o600 });
    renameSync(pending, this.manifest);
  }

  async waitHealthy() {
    const contents = readFileSync(this.environment, "utf8");
    const { healthUrl } = runtimeNetwork(contents);
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await fetch(healthUrl + "/health", { signal: AbortSignal.timeout(1000) });
        const health = await response.json();
        if (response.ok && health.app === "atlas" && health.status === "ok"
            && this.service("is-active", "--quiet")) {
          const appResponse = await fetch(healthUrl + "/app", { signal: AbortSignal.timeout(1000) });
          const app = await appResponse.json();
          if (appResponse.ok && app.version === this.readInstallation().version
              && app.distribution?.current === "linux-installer") return;
        }
      } catch { /* Wait for the app and both child surfaces. */ }
      await new Promise(done => setTimeout(done, 500));
    }
    throw new Error("ATLAS /health did not become ready");
  }

  async checkPorts() {
    const contents = existsSync(this.environment) ? readFileSync(this.environment, "utf8") : "";
    const { ports } = runtimeNetwork(contents);
    for (const port of ports) await new Promise((done, reject) => {
      const probe = createServer();
      probe.once("error", () => reject(new Error(`Port ${port} is occupied; choose free ATLAS ports`)));
      probe.listen(port, "0.0.0.0", () => probe.close(done));
    });
  }

  async deploy(source, operation) {
    this.assertPaths();
    const previous = this.readInstallation();
    if (operation === "install" && previous) throw new Error("Already installed; use update");
    if (operation !== "install" && !previous) throw new Error("No managed installation; refusing to adopt existing data");
    if (!previous && (existsSync(this.unit) || existsSync(this.environment)
      || (existsSync(this.state) && readdirSync(this.state).length))) throw new Error("Unmanaged ATLAS configuration/data exists; export and migrate explicitly");
    if (previous && (!existsSync(join(this.app, "current")) || realpathSync(join(this.app, "current")) !== previous.current)) throw new Error("Current release was changed outside the installer");
    const unit = createUnit({ app: this.app, state: this.state, environment: this.environment, node: process.execPath });
    if (previous && readFileSync(this.unit, "utf8") !== unit) throw new Error("Managed unit was edited; keep local settings in atlas.service.d/");
    const sourceManifest = validateRuntime(source);
    runtimeNetwork(existsSync(this.environment) ? readFileSync(this.environment, "utf8") : "");
    const wasActive = previous ? this.service("is-active", "--quiet") !== false : false;
    if (previous) this.service("stop");
    let backup;
    try { backup = this.backup(); }
    catch (error) { if (wasActive) this.service("start"); throw error; }
    const saved = { kind: "atlas.linux.installation", node: process.execPath, state: this.state, version: sourceManifest.version };
    try {
      await this.portsAvailable();
      mkdirSync(join(this.app, "releases"), { recursive: true, mode: 0o755 });
      mkdirSync(this.state, { recursive: true, mode: 0o700 });
      this.provision();
      const release = join(this.app, "releases", sourceManifest.version + "-" + randomUUID());
      cpSync(source, release, { recursive: true, verbatimSymlinks: true });
      validateRuntime(release);
      if (!previous) {
        mkdirSync(dirname(this.environment), { recursive: true, mode: 0o700 });
        mkdirSync(dirname(this.unit), { recursive: true });
        writeFileSync(this.environment, `NODE_ENV=production
ATLAS_HOST=127.0.0.1
ATLAS_APP_HOST=127.0.0.1
ATLAS_APP_PORT=4176
ATLAS_ADMIN_PORT=4175
ATLAS_DEMO_PORT=4174
ATLAS_DISTRIBUTION_TARGET=linux-installer
ATLAS_PLUGIN_DATA_ROOT=${this.state}/plugins
ATLAS_ADMIN_DEVICE_FILE=${this.state}/admin-device.json
ATLAS_FILE_STUDIO_HISTORY_ROOT=${this.state}/file-history
ATLAS_FILE_STUDIO_TRASH_ROOT=${this.state}/file-trash
ATLAS_TERMINAL_ENABLED=0
`, { mode: 0o600, flag: "wx" });
        writeFileSync(this.unit, unit, { mode: 0o644, flag: "wx" });
      }
      this.switchRelease(release);
      this.saveInstallation({ ...saved, current: release, ...(previous ? { previous: previous.current } : {}), backup });
      this.service("daemon-reload");
      if (!previous) this.service("enable");
      this.service("start");
      await this.health();
      if (previous && !wasActive) this.service("stop");
      console.log(`ATLAS ${saved.version} is ready. Persistent data: ${this.state}`);
    } catch (error) {
      try { this.service("stop"); } catch { /* Continue recovery after service failure. */ }
      if (previous) {
        this.switchRelease(previous.current);
        this.saveInstallation(previous);
        if (wasActive) { this.service("start"); await this.health(); }
      }
      throw new Error(`Deployment failed; ${previous ? "previous runtime restored" : "new installation remains stopped"}. Data backup: ${backup}. ${error.message}`);
    }
  }

  async rollback() {
    const saved = this.readInstallation();
    if (!saved?.previous) throw new Error("No previous release");
    const previous = saved.previous;
    // deploy performs the same validation, backup and health-checked transaction.
    await this.deploy(previous, "update");
  }

  async backupRunningInstallation() {
    if (!this.readInstallation()) throw new Error("No managed installation");
    const active = this.service("is-active", "--quiet");
    this.service("stop");
    try { return this.backup(); }
    finally {
      if (active) { this.service("start"); await this.health(); }
    }
  }
}

export async function main(args) {
  const [operation, ...rest] = args;
  if (operation === "--help" || !operation) {
    console.log("Usage: prepare --output <new-directory> | install/update --source <runtime-directory> | rollback | backup | status");
    return;
  }
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    if (!["--source", "--output"].includes(rest[index]) || !rest[index + 1]) throw new Error("Usage: prepare --output <new-directory> | install/update --source <runtime-directory> | rollback | backup | status");
    options[rest[index].slice(2)] = resolve(rest[index + 1]);
  }
  if (operation === "prepare" && options.output) return prepareLinuxRuntime(options.output);
  if (process.platform !== "linux" || Number(process.versions.node.split(".")[0]) < 22) throw new Error("Linux and Node.js >=22 required");
  if (process.getuid() !== 0) throw new Error("Run the system installer as root");
  if (readFileSync("/proc/1/comm", "utf8").trim() !== "systemd") throw new Error("A running systemd host is required");
  const installer = new LinuxInstallation({ service: (...args) => {
    const result = spawnSync("systemctl", args[0] === "daemon-reload" ? args : [...args, "atlas.service"], { encoding: "utf8", timeout: 60000 });
    if (args[0] === "is-active") return result.status === 0;
    if (result.error || result.status !== 0) throw new Error(`systemctl ${args[0]} failed: ${result.error?.message ?? result.stderr?.trim()}`);
    return true;
  } });
  // Exclusive lock covers service stop, backup, deployment and recovery.
  mkdirSync("/run/lock", { recursive: true });
  const lock = "/run/lock/atlas-installer.lock";
  writeFileSync(lock, String(process.pid), { flag: "wx", mode: 0o600 });
  try {
    if (["install", "update"].includes(operation) && options.source) return await installer.deploy(options.source, operation);
    if (operation === "rollback") return await installer.rollback();
    if (operation === "backup") {
      return await installer.backupRunningInstallation();
    }
    if (operation === "status") {
      const saved = installer.readInstallation();
      console.log(JSON.stringify({ installed: Boolean(saved), version: saved?.version, active: installer.service("is-active", "--quiet"), state: installer.state }, null, 2));
      return;
    }
    throw new Error("Unknown operation or missing source/output");
  } finally { unlinkSync(lock); }
}

if (import.meta.main ?? (process.argv[1] && realpathSync(resolve(process.argv[1])) === fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
