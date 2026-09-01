export interface EventSubscription{readonly id:string;readonly eventType:string;dispose():Promise<void>;}
