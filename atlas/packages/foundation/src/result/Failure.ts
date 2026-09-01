import type { Failure } from "./Result";

export function failure<E>(error:E): Failure<E> {
  return {
    isSuccess:false,
    isFailure:true,
    error
  };
}
