import type { Failure, Result, Success } from "./Result";

export function isSuccess<T,E>(result: Result<T,E>): result is Success<T> {
  return result.isSuccess;
}

export function isFailure<T,E>(result: Result<T,E>): result is Failure<E> {
  return result.isFailure;
}
