export interface Validatable<TResult = boolean> {
    validate(): TResult;
}
