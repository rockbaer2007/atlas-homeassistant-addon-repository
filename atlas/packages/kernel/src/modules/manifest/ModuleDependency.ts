export type ModuleDependency = Readonly<{
  id:string;
  version:string;
  optional?:boolean;
}>;
