import type {Event} from './Event';
import type {EventHandler} from './EventHandler';
import type {EventSubscription} from './EventSubscription';
export interface EventBus{publish<T extends Event>(event:T):Promise<void>;subscribe<T extends Event>(eventType:string,handler:EventHandler<T>):EventSubscription;clear():void;}
