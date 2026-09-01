import {describe,it,expect} from "vitest";
import { DiagnosticSeverities } from "../src/diagnostics";
describe("diagnostics",()=>{
 it("exports severities",()=>{
   expect(DiagnosticSeverities.Info).toBe("info");
 });
});
