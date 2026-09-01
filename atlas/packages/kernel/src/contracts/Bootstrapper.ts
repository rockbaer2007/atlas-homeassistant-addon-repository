export interface Bootstrapper {
  initialize(): Promise<void>;
  configure(): Promise<void>;
  run(): Promise<void>;
  shutdown(): Promise<void>;
}
