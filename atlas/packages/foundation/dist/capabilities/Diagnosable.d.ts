export interface Diagnosable<TSnapshot> {
    createSnapshot(): TSnapshot;
}
