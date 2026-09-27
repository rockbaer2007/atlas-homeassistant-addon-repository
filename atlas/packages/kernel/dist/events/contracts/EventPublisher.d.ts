import type { Event } from "./Event";
export interface EventPublisher {
    publish<T extends Event>(event: T): Promise<void>;
}
