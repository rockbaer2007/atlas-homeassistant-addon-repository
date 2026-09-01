import type { Version } from "@atlas/foundation";

export interface Application {
  readonly name: string;
  readonly version: Version;
}
