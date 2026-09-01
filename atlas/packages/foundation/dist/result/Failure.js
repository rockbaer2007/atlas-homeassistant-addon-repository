export function failure(error) {
    return {
        isSuccess: false,
        isFailure: true,
        error
    };
}
