import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Private installation data, outside the runtime/repository. The random key is
// never exposed by an API or included in a browser settings export.
export function createAdminConnectionStore(path, binding) {
  const keyPath = path + ".key";
  const aad = Buffer.from(`atlas-admin-connection:v1:${binding}`);
  function key(create = false) {
    if (!existsSync(keyPath) && create) {
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
      writeFileSync(keyPath, randomBytes(32), { flag: "wx", mode: 0o600 });
    }
    const bytes = readFileSync(keyPath);
    if (bytes.length !== 32) throw new Error("Invalid administration encryption key");
    return bytes;
  }
  return {
    load() {
      if (!existsSync(path)) return undefined;
      const envelope = JSON.parse(readFileSync(path, "utf8"));
      if (envelope.version !== 1) throw new Error("Unsupported administration store");
      const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(envelope.iv, "base64"));
      decipher.setAAD(aad);
      decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, "base64")), decipher.final()]).toString("utf8"));
    },
    save(settings) {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key(true), iv);
      cipher.setAAD(aad);
      const data = Buffer.concat([cipher.update(JSON.stringify(settings), "utf8"), cipher.final()]);
      const temporary = path + "." + randomBytes(8).toString("hex") + ".tmp";
      try {
        writeFileSync(temporary, JSON.stringify({ version: 1, iv: iv.toString("base64"),
          tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") }), { flag: "wx", mode: 0o600 });
        renameSync(temporary, path);
      } finally { rmSync(temporary, { force: true }); }
    },
    clear() { rmSync(path, { force: true }); },
  };
}
