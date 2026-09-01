import type { SnapshotMetadata } from "./SnapshotMetadata";
export type Snapshot<T> = Readonly<{
  metadata: SnapshotMetadata;
  payload: T;
}>;