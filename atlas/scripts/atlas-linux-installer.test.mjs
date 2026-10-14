import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { LinuxInstallation, createUnit, runtimePlatform, runtimeNetwork } from "./atlas-linux-installer.mjs";

const linux = { skip: process.platform !== "linux" };

test("CLI executes through the current-release symlink instead of silently exiting",linux,t=>{
  const root=mkdtempSync(join(tmpdir(),"atlas-linux-cli-"));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const link=join(root,"atlas-linux-installer.mjs");
  symlinkSync(join(import.meta.dirname,"atlas-linux-installer.mjs"),link);
  const result=spawnSync(process.execPath,[link,"--help"],{encoding:"utf8"});
  assert.equal(result.status,0);
  assert.match(result.stdout,/Usage: prepare --output/);
});

test("health follows explicit private IP, wildcard and quoted port configuration",()=>{
  assert.equal(runtimeNetwork('ATLAS_APP_HOST=192.168.178.117\nATLAS_APP_PORT="4200"\n').healthUrl,"http://192.168.178.117:4200");
  assert.equal(runtimeNetwork("ATLAS_APP_HOST=0.0.0.0\n").healthUrl,"http://127.0.0.1:4176");
  assert.equal(runtimeNetwork("ATLAS_APP_HOST='::'\n").healthUrl,"http://[::1]:4176");
  assert.equal(runtimeNetwork("ATLAS_APP_PORT=4200\nATLAS_APP_PORT=4201\n").ports[0],4201);
});

test("invalid network configuration fails before a deployment can mutate data",()=>{
  assert.throws(()=>runtimeNetwork("ATLAS_APP_PORT=not-a-number\n"),/numeric ATLAS ports/);
  assert.throws(()=>runtimeNetwork("ATLAS_APP_PORT=4174\n"),/distinct valid/);
  assert.throws(()=>runtimeNetwork("ATLAS_APP_HOST=http:\/\/example.com\n"),/IP address/);
});
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "atlas-linux-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, "package");
  const manifest = { kind: "atlas.linux.runtime", schemaVersion: 1, version: "0.1.298", ...runtimePlatform() };
  const entries = ["scripts/atlas-app-server.mjs", "examples/admin-demo/server.mjs", "examples/status-demo/app.js", "examples/admin-demo/mdi-icons.json", "packages/homeassistant/dist/index.js", ...["node-pty","ws","tar"].map(name => "node_modules/" + name + "/index.js")];
  for (const file of entries) { mkdirSync(join(source, file, ".."), { recursive: true }); writeFileSync(join(source,file), ""); }
  writeFileSync(join(source,"atlas-linux-runtime.json"), JSON.stringify(manifest));
  let active = false, healthCalls=0;
  const calls=[];
  const installation = new LinuxInstallation({
    prefix: join(root,"host"), provision: () => {}, portsAvailable: async () => {},
    service: operation => {
      calls.push(operation);
      if(operation==="is-active") return active;
      if(operation==="start") active=true;
      if(operation==="stop") active=false;
      return true;
    },
    health: async () => { healthCalls++; },
  });
  return { root, source, manifest, installation, calls, active:()=>active, healthCalls:()=>healthCalls };
}

function userData(f) {
  mkdirSync(join(f.installation.state,"plugins/custom-plugin"),{recursive:true});
  writeFileSync(join(f.installation.state,"plugins/custom-plugin/project.json"), '{"cards":[{"title":"Existing user project"}]}');
  writeFileSync(join(f.installation.state,"admin-device.json"), '{"installationId":"keep-existing-id"}');
  writeFileSync(f.installation.environment, readFileSync(f.installation.environment,"utf8") + "ATLAS_INSTANCE_ID=keep-existing-id\nATLAS_TERMINAL_TOKEN=keep-existing-token\n");
  return [readFileSync(f.installation.environment),readFileSync(join(f.installation.state,"admin-device.json")),readFileSync(join(f.installation.state,"plugins/custom-plugin/project.json"))];
}
function compareData(f, before) {
  assert.deepEqual(readFileSync(f.installation.environment),before[0]);
  assert.deepEqual(readFileSync(join(f.installation.state,"admin-device.json")),before[1]);
  assert.deepEqual(readFileSync(join(f.installation.state,"plugins/custom-plugin/project.json")),before[2]);
}

test("install, update and rollback preserve configuration, installation identity and plugin projects",linux,async t=>{
  const f=fixture(t);
  await f.installation.deploy(f.source,"install");
  const old=f.installation.readInstallation().current;
  const before=userData(f);
  await f.installation.deploy(f.source,"update");
  const updated=f.installation.readInstallation();
  assert.equal(updated.previous,old);
  assert.notEqual(updated.current,old);
  compareData(f,before);
  assert.deepEqual(readFileSync(join(updated.backup,"data/plugins/custom-plugin/project.json")),before[2]);
  assert.deepEqual(readFileSync(join(updated.backup,"configuration/atlas.env")),before[0]);
  await f.installation.rollback();
  compareData(f,before);
  assert.equal(f.calls.filter(c=>c==="enable").length,1);
  assert(f.active());
});

test("failed health check restores previous release and data",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  const saved=f.installation.readInstallation(), before=userData(f);
  let calls=0;
  f.installation.health=async()=>{if(++calls===1)throw new Error("unhealthy candidate");};
  await assert.rejects(f.installation.deploy(f.source,"update"),/previous runtime restored/);
  assert.deepEqual(f.installation.readInstallation(),saved);
  assert.equal(realpathSync(join(f.installation.app,"current")),saved.current);
  compareData(f,before); assert(f.active());
});

test("backup failure restarts the old service before any release change",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  const saved=f.installation.readInstallation();
  f.installation.backup=()=>{throw new Error("backup failed");};
  await assert.rejects(f.installation.deploy(f.source,"update"),/backup failed/);
  assert.deepEqual(f.installation.readInstallation(),saved); assert(f.active());
});

test("inactive update remains stopped and does not change boot enablement",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  f.installation.service("stop");
  await f.installation.deploy(f.source,"update");
  assert.equal(f.active(),false);
  assert.equal(f.calls.filter(c=>c==="enable").length,1);
});

test("edited unit is rejected before stopping or mutating existing data",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  writeFileSync(f.installation.unit,readFileSync(f.installation.unit,"utf8")+"# custom edits\n");
  const before=userData(f), count=f.calls.length;
  await assert.rejects(f.installation.deploy(f.source,"update"),/unit was edited/);
  compareData(f,before); assert.equal(f.calls.length,count);
});

test("unmanaged existing data is never adopted or overwritten",linux,async t=>{
  const f=fixture(t); mkdirSync(f.installation.state,{recursive:true});
  writeFileSync(join(f.installation.state,"important"),"keep me");
  await assert.rejects(f.installation.deploy(f.source,"install"),/Unmanaged/);
  assert.equal(readFileSync(join(f.installation.state,"important"),"utf8"),"keep me");
  assert.equal(f.calls.length,0);
});

test("architecture/ABI mismatch is rejected before touching existing service",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  writeFileSync(join(f.source,"atlas-linux-runtime.json"),JSON.stringify({...f.manifest,nodeAbi:"wrong"}));
  const count=f.calls.length;
  await assert.rejects(f.installation.deploy(f.source,"update"),/nodeAbi mismatch/);
  assert.equal(f.calls.length,count); assert(f.active());
});

test("port collision never stops unrelated services or activates new install",linux,async t=>{
  const f=fixture(t);
  f.installation.portsAvailable=async()=>{throw new Error("Port is occupied");};
  await assert.rejects(f.installation.deploy(f.source,"install"),/Port is occupied/);
  assert.equal(f.active(),false); assert(!existsSync(f.installation.manifest));
});

test("unit overrides and unrelated files are preserved in update and backup",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  mkdirSync(f.installation.unit+".d"); writeFileSync(join(f.installation.unit+".d","custom.conf"),"[Service]\nMemoryMax=1G\n");
  const unrelated=join(f.root,"fhem.cfg"); writeFileSync(unrelated,"existing FHEM");
  await f.installation.deploy(f.source,"update");
  assert.equal(readFileSync(join(f.installation.readInstallation().backup,"drop-ins/custom.conf"),"utf8"),"[Service]\nMemoryMax=1G\n");
  assert.equal(readFileSync(unrelated,"utf8"),"existing FHEM");
});

test("symlink state path is rejected without writing through it",linux,async t=>{
  const f=fixture(t); const target=join(f.root,"external");mkdirSync(target);
  mkdirSync(join(f.installation.state,".."),{recursive:true}); symlinkSync(target,f.installation.state);
  await assert.rejects(f.installation.deploy(f.source,"install"),/symlink-managed/);
  assert(!existsSync(join(target,"plugins")));
});

test("systemd unit is non-root and shuts down the entire app process group",linux,()=>{
  const unit=createUnit({app:"/opt/atlas",state:"/var/lib/atlas",environment:"/etc/atlas/atlas.env",node:"/usr/local/bin/node"});
  assert.match(unit,/User=atlas/); assert.match(unit,/KillMode=control-group/);
  assert.match(unit,/Environment=HOME=\/var\/lib\/atlas/);
  assert.match(unit,/EnvironmentFile=\/etc\/atlas\/atlas.env/);
  assert.match(unit,/ExecStart=\/usr\/local\/bin\/node \/opt\/atlas\/current\/scripts\/atlas-app-server.mjs/);
});

test("manual backup waits for readiness after restarting an active service",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  const before=userData(f), healthCalls=f.healthCalls();
  const backup=await f.installation.backupRunningInstallation();
  assert(f.active()); assert.equal(f.healthCalls(),healthCalls+1);
  assert.deepEqual(readFileSync(join(backup,"configuration/atlas.env")),before[0]);
  compareData(f,before);
});

test("manual backup failure still restarts and verifies the active service",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  const healthCalls=f.healthCalls();
  f.installation.backup=()=>{throw new Error("backup disk full");};
  await assert.rejects(f.installation.backupRunningInstallation(),/backup disk full/);
  assert(f.active()); assert.equal(f.healthCalls(),healthCalls+1);
});

test("manual backup keeps an inactive installation stopped",linux,async t=>{
  const f=fixture(t); await f.installation.deploy(f.source,"install");
  f.installation.service("stop");
  const healthCalls=f.healthCalls();
  await f.installation.backupRunningInstallation();
  assert.equal(f.active(),false); assert.equal(f.healthCalls(),healthCalls);
});
