import type { Success } from "./Result";

export function success<T>(value:T): Success<T> {
  return {
    isSuccess:true,
    isFailure:false,
    value
  };
}
