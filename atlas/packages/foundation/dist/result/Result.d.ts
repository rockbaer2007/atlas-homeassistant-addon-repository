export type Result<T, E> = Success<T> | Failure<E>;
export interface Success<T> {
    readonly isSuccess: true;
    readonly isFailure: false;
    readonly value: T;
}
export interface Failure<E> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: E;
}
