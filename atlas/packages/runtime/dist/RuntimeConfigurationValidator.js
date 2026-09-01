export class RuntimeConfigurationValidator {
    validateApplication(application) {
        if (!this.isNonEmptyString(application.name)) {
            throw new Error("Runtime application name is required.");
        }
        if (!this.isValidVersionPart(application.version.major)) {
            throw new Error("Runtime application version major must be a non-negative integer.");
        }
        if (!this.isValidVersionPart(application.version.minor)) {
            throw new Error("Runtime application version minor must be a non-negative integer.");
        }
        if (!this.isValidVersionPart(application.version.patch)) {
            throw new Error("Runtime application version patch must be a non-negative integer.");
        }
    }
    validateModule(runtimeModule) {
        if (!this.isNonEmptyString(runtimeModule.manifest.id)) {
            throw new Error("Runtime module id is required.");
        }
        if (!this.isNonEmptyString(runtimeModule.manifest.name)) {
            throw new Error(`Runtime module name is required: ${runtimeModule.manifest.id}`);
        }
        if (!this.isNonEmptyString(runtimeModule.manifest.version)) {
            throw new Error(`Runtime module version is required: ${runtimeModule.manifest.id}`);
        }
        if (!Array.isArray(runtimeModule.manifest.dependencies)) {
            throw new Error(`Runtime module dependencies must be an array: ${runtimeModule.manifest.id}`);
        }
        for (const dependency of runtimeModule.manifest.dependencies) {
            if (!this.isNonEmptyString(dependency.id)) {
                throw new Error(`Runtime module dependency id is required: ${runtimeModule.manifest.id}`);
            }
            if (!this.isNonEmptyString(dependency.version)) {
                throw new Error(`Runtime module dependency version is required: ${runtimeModule.manifest.id} -> ${dependency.id}`);
            }
        }
        if (typeof runtimeModule.module.initialize !== "function") {
            throw new Error(`Runtime module initialize function is required: ${runtimeModule.manifest.id}`);
        }
    }
    isNonEmptyString(value) {
        return typeof value === "string" && value.trim().length > 0;
    }
    isValidVersionPart(value) {
        return Number.isInteger(value) && value >= 0;
    }
}
