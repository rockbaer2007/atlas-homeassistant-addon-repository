import {describe,it,expect} from "vitest";
import {DefaultServiceContainer,ServiceLifetimes} from "../src/container";
import {DefaultServiceProvider} from "../src/di";

describe("DefaultServiceProvider",()=>{
  it("resolves typed service key",()=>{
    const key={id:Symbol("svc")};
    const c=new DefaultServiceContainer();
    c.add({key:key.id,lifetime:ServiceLifetimes.Singleton,factory:()=>42});
    const p=new DefaultServiceProvider(c);
    expect(p.get(key)).toBe(42);
  });
});
