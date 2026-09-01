import type { Event } from './Event';
export type EventHandler<T extends Event=Event>=(event:T)=>void|Promise<void>;
