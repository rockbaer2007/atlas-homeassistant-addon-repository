import { DefaultEventBus, DefaultServiceContainer, ModuleDependencyResolver, } from "@atlas/kernel";
import { DiagnosticSeverities } from "@atlas/foundation";
import { RuntimeConfigurationValidator } from "./RuntimeConfigurationValidator";
import { RuntimeDiagnosticIssueCodes } from "./RuntimeDiagnosticIssueCode";
import { RuntimeHealthStates } from "./RuntimeHealthState";
import { RuntimeModuleStatuses } from "./RuntimeModuleStatus";
import { RuntimeServiceKeys } from "./RuntimeServiceKeys";
export class RuntimeHost {
    application;
    events;
    services;
    stateInternal = "created";
    modulesInternal = [];
    moduleSnapshotsInternal = new Map();
    initializedModuleIds = new Set();
    moduleResolver = new ModuleDependencyResolver();
    configurationValidator = new RuntimeConfigurationValidator();
    publishedHealth;
    constructor(applicationOrConfiguration, events, services) {
        const configuration = this.toConfiguration(applicationOrConfiguration, events, services);
        this.application = configuration.application;
        this.events = configuration.events ?? new DefaultEventBus();
        this.services = configuration.services ?? new DefaultServiceContainer();
        this.configurationValidator.validateApplication(this.application);
        this.services.register(RuntimeServiceKeys.application, this.application);
        this.services.register(RuntimeServiceKeys.events, this.events);
        for (const runtimeModule of configuration.modules ?? []) {
            this.registerModule(runtimeModule);
        }
    }
    get state() {
        return this.stateInternal;
    }
    get modules() {
        return [...this.modulesInternal];
    }
    get moduleDiagnostics() {
        return this.modulesInternal.map(runtimeModule => this.moduleSnapshotsInternal.get(runtimeModule.manifest.id));
    }
    get health() {
        const modules = this.moduleDiagnostics.map(snapshot => this.toModuleHealthReport(snapshot));
        const summary = {
            healthy: modules.filter(module => module.health === RuntimeHealthStates.Healthy).length,
            degraded: modules.filter(module => module.health === RuntimeHealthStates.Degraded).length,
            failed: modules.filter(module => module.health === RuntimeHealthStates.Failed).length,
        };
        return {
            applicationName: this.application.name,
            applicationVersion: this.applicationVersion(),
            state: this.stateInternal,
            health: this.aggregateHealth(summary),
            modules,
            summary,
        };
    }
    get diagnostics() {
        const health = this.health;
        const issues = health.modules
            .filter(module => module.health !== RuntimeHealthStates.Healthy)
            .map(module => this.toDiagnosticIssue(module));
        return {
            context: {
                component: `runtime:${health.applicationName}`,
                version: health.applicationVersion,
            },
            result: {
                ok: health.health === RuntimeHealthStates.Healthy,
                issues,
            },
        };
    }
    registerModule(runtimeModule) {
        this.ensureAvailable();
        if (this.stateInternal !== "created") {
            throw new Error("Runtime modules must be registered before startup.");
        }
        this.configurationValidator.validateModule(runtimeModule);
        if (this.modulesInternal.some(registered => registered.manifest.id === runtimeModule.manifest.id)) {
            throw new Error(`Runtime module already registered: ${runtimeModule.manifest.id}`);
        }
        this.modulesInternal.push(runtimeModule);
        this.moduleSnapshotsInternal.set(runtimeModule.manifest.id, {
            moduleId: runtimeModule.manifest.id,
            moduleVersion: runtimeModule.manifest.version,
            status: RuntimeModuleStatuses.Registered,
        });
    }
    async start() {
        this.ensureAvailable();
        if (this.stateInternal === "running") {
            return;
        }
        if (this.stateInternal === "created") {
            this.validateConfiguration();
            await this.initialize();
        }
        await this.activateModules();
        this.stateInternal = "running";
        await this.publish("runtime.started");
    }
    async stop() {
        this.ensureAvailable();
        if (this.stateInternal !== "running") {
            return;
        }
        this.stateInternal = "stopped";
        await this.publish("runtime.stopped");
    }
    async restart() {
        await this.stop();
        await this.start();
    }
    async dispose() {
        if (this.stateInternal === "disposed") {
            return;
        }
        if (this.stateInternal === "running") {
            await this.stop();
        }
        await this.shutdownModules();
        this.stateInternal = "disposed";
        await this.publish("runtime.disposed");
    }
    async initialize() {
        this.stateInternal = "initialized";
        await this.publish("runtime.initialized");
    }
    validateConfiguration() {
        this.configurationValidator.validateApplication(this.application);
        for (const runtimeModule of this.modulesInternal) {
            this.configurationValidator.validateModule(runtimeModule);
        }
    }
    async activateModules() {
        for (const runtimeModule of this.resolveModules()) {
            if (this.initializedModuleIds.has(runtimeModule.manifest.id)) {
                continue;
            }
            const startedAt = Date.now();
            try {
                await runtimeModule.module.initialize({
                    services: this.services,
                });
                this.initializedModuleIds.add(runtimeModule.manifest.id);
                this.updateModuleSnapshot(runtimeModule, {
                    status: RuntimeModuleStatuses.Initialized,
                    initializedAt: Date.now(),
                    activationDurationMs: Date.now() - startedAt,
                    error: undefined,
                });
                await this.publishModuleInitialized(runtimeModule.manifest.id);
                await this.publishDiagnosticChangeIfNeeded();
            }
            catch (error) {
                this.updateModuleSnapshot(runtimeModule, {
                    status: RuntimeModuleStatuses.Failed,
                    activationDurationMs: Date.now() - startedAt,
                    error: this.errorMessage(error),
                });
                await this.publishDiagnosticChangeIfNeeded();
                throw error;
            }
        }
    }
    resolveModules() {
        const modulesById = new Map(this.modulesInternal.map(runtimeModule => [
            runtimeModule.manifest.id,
            runtimeModule,
        ]));
        const descriptors = this.modulesInternal.map(runtimeModule => ({
            manifest: runtimeModule.manifest,
            loaded: false,
        }));
        return this.moduleResolver.resolve(descriptors).map(descriptor => {
            const runtimeModule = modulesById.get(descriptor.manifest.id);
            if (!runtimeModule) {
                throw new Error(`Runtime module not registered: ${descriptor.manifest.id}`);
            }
            return runtimeModule;
        });
    }
    async shutdownModules() {
        const initializedModules = this.resolveModules()
            .filter(runtimeModule => this.initializedModuleIds.has(runtimeModule.manifest.id))
            .reverse();
        for (const runtimeModule of initializedModules) {
            const startedAt = Date.now();
            try {
                if (this.isStoppableModule(runtimeModule.module)) {
                    await runtimeModule.module.stop();
                    this.updateModuleSnapshot(runtimeModule, {
                        status: RuntimeModuleStatuses.Stopped,
                        stoppedAt: Date.now(),
                        shutdownDurationMs: Date.now() - startedAt,
                        error: undefined,
                    });
                    await this.publishModuleEvent("runtime.module.stopped", runtimeModule.manifest.id);
                    await this.publishDiagnosticChangeIfNeeded();
                }
                if (this.isDisposableModule(runtimeModule.module)) {
                    await runtimeModule.module.dispose();
                    this.updateModuleSnapshot(runtimeModule, {
                        status: RuntimeModuleStatuses.Disposed,
                        disposedAt: Date.now(),
                        shutdownDurationMs: Date.now() - startedAt,
                        error: undefined,
                    });
                    await this.publishModuleEvent("runtime.module.disposed", runtimeModule.manifest.id);
                    await this.publishDiagnosticChangeIfNeeded();
                }
            }
            catch (error) {
                this.updateModuleSnapshot(runtimeModule, {
                    status: RuntimeModuleStatuses.Failed,
                    shutdownDurationMs: Date.now() - startedAt,
                    error: this.errorMessage(error),
                });
                await this.publishDiagnosticChangeIfNeeded();
                throw error;
            }
        }
    }
    async publish(type) {
        await this.events.publish({
            type,
            timestamp: new Date(),
        });
    }
    async publishDiagnosticChangeIfNeeded() {
        const report = this.health;
        if (this.publishedHealth === report.health) {
            return;
        }
        const previousHealth = this.publishedHealth;
        this.publishedHealth = report.health;
        await this.events.publish({
            type: "runtime.diagnostics.changed",
            previousHealth,
            currentHealth: report.health,
            report,
            timestamp: new Date(),
        });
    }
    async publishModuleInitialized(moduleId) {
        await this.publishModuleEvent("runtime.module.initialized", moduleId);
    }
    async publishModuleEvent(type, moduleId) {
        await this.events.publish({
            type,
            moduleId,
            timestamp: new Date(),
        });
    }
    isStoppableModule(module) {
        return typeof module === "object"
            && module !== null
            && "stop" in module
            && typeof module.stop === "function";
    }
    isDisposableModule(module) {
        return typeof module === "object"
            && module !== null
            && "dispose" in module
            && typeof module.dispose === "function";
    }
    updateModuleSnapshot(runtimeModule, update) {
        const current = this.moduleSnapshotsInternal.get(runtimeModule.manifest.id);
        if (!current) {
            throw new Error(`Runtime module diagnostics not found: ${runtimeModule.manifest.id}`);
        }
        this.moduleSnapshotsInternal.set(runtimeModule.manifest.id, {
            ...current,
            ...update,
        });
    }
    errorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    toModuleHealthReport(snapshot) {
        return {
            moduleId: snapshot.moduleId,
            moduleVersion: snapshot.moduleVersion,
            health: this.moduleHealth(snapshot),
            status: snapshot.status,
            error: snapshot.error,
        };
    }
    moduleHealth(snapshot) {
        switch (snapshot.status) {
            case RuntimeModuleStatuses.Failed:
                return RuntimeHealthStates.Failed;
            case RuntimeModuleStatuses.Registered:
            case RuntimeModuleStatuses.Stopped:
                return RuntimeHealthStates.Degraded;
            case RuntimeModuleStatuses.Initialized:
            case RuntimeModuleStatuses.Disposed:
                return RuntimeHealthStates.Healthy;
        }
    }
    aggregateHealth(summary) {
        if (summary.failed > 0) {
            return RuntimeHealthStates.Failed;
        }
        if (summary.degraded > 0) {
            return RuntimeHealthStates.Degraded;
        }
        return RuntimeHealthStates.Healthy;
    }
    applicationVersion() {
        const { major, minor, patch, label } = this.application.version;
        const version = `${major}.${minor}.${patch}`;
        return label ? `${version}-${label}` : version;
    }
    toDiagnosticIssue(module) {
        if (module.health === RuntimeHealthStates.Failed) {
            return {
                code: RuntimeDiagnosticIssueCodes.ModuleFailed,
                message: module.error
                    ? `Runtime module failed: ${module.moduleId} - ${module.error}`
                    : `Runtime module failed: ${module.moduleId}`,
                severity: DiagnosticSeverities.Error,
            };
        }
        return {
            code: RuntimeDiagnosticIssueCodes.ModuleDegraded,
            message: `Runtime module is degraded: ${module.moduleId} (${module.status})`,
            severity: DiagnosticSeverities.Warning,
        };
    }
    toConfiguration(applicationOrConfiguration, events, services) {
        if ("application" in applicationOrConfiguration) {
            return applicationOrConfiguration;
        }
        return {
            application: applicationOrConfiguration,
            events,
            services,
        };
    }
    ensureAvailable() {
        if (this.stateInternal === "disposed") {
            throw new Error("Runtime host has been disposed.");
        }
    }
}
