export interface StoppableModule {
  stop(): Promise<void>;
}
