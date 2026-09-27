import type { EventPublisher } from "./EventPublisher";
import type { EventSubscriber } from "./EventSubscriber";

export interface EventBus extends EventPublisher, EventSubscriber {}
