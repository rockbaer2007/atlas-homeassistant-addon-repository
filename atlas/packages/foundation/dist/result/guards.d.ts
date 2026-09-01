import type { Failure, Result, Success } from "./Result";
export declare function isSuccess<T, E>(result: Result<T, E>): result is Success<T>;
export declare function isFailure<T, E>(result: Result<T, E>): result is Failure<E>;
