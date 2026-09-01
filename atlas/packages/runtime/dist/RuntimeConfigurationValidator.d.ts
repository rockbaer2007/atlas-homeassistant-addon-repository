import type { Application } from "@atlas/kernel";
import type { RuntimeModule } from "./RuntimeModule";
export declare class RuntimeConfigurationValidator {
    validateApplication(application: Application): void;
    validateModule(runtimeModule: RuntimeModule): void;
    private isNonEmptyString;
    private isValidVersionPart;
}
