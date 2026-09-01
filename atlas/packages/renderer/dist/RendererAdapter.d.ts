import type { RendererMountRequest, RendererMountResult } from "./RendererMount";
export type RendererAdapterMountResult = RendererMountResult | Promise<RendererMountResult>;
export type RendererAdapter = Readonly<{
    name: string;
    mount(request: RendererMountRequest): RendererAdapterMountResult;
}>;
export declare function createRendererAdapter(adapter: RendererAdapter): RendererAdapter;
