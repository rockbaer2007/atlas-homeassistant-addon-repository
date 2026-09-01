import type { ErrorCategory } from "./ErrorCategory";

export interface ErrorCode {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
}
