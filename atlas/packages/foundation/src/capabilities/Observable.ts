import type { Subscription } from './Subscription';
export interface Observable<TEvent>{ subscribe(listener:(event:TEvent)=>void): Subscription; }
