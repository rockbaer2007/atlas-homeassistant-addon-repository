import { describe, expect, it } from "vitest";
import type {
  MetadataCollection,
  MetadataEntry,
  MutableMetadataProvider,
  ReadonlyMetadataProvider,
} from "../src";

class TestMetadataProvider implements MutableMetadataProvider {
  private readonly entries = new Map<string, unknown>();

  has(key: string): boolean { return this.entries.has(key); }
  get<T = unknown>(key: string): T | undefined { return this.entries.get(key) as T | undefined; }
  set(key: string, value: unknown): void { this.entries.set(key, value); }
  remove(key: string): boolean { return this.entries.delete(key); }
  clear(): void { this.entries.clear(); }
}

describe("metadata contracts", () => {
  it("provides typed read-only access through the mutable provider contract", () => {
    const provider: MutableMetadataProvider = new TestMetadataProvider();
    const readonlyProvider: ReadonlyMetadataProvider = provider;
    provider.set("enabled", true);
    provider.set("labels", ["local", "safe"]);

    expect(readonlyProvider.has("enabled")).toBe(true);
    expect(readonlyProvider.get<boolean>("enabled")).toBe(true);
    expect(readonlyProvider.get<string[]>("labels")).toEqual(["local", "safe"]);
    expect(provider.remove("enabled")).toBe(true);
    expect(readonlyProvider.has("enabled")).toBe(false);
  });

  it("defines metadata collections as readonly key/value entries", () => {
    const entry: MetadataEntry = { key: "source", value: "atlas" };
    const collection: MetadataCollection = [entry];

    expect(collection).toEqual([{ key: "source", value: "atlas" }]);
  });
});
