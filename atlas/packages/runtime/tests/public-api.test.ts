import { describe, expect, it } from "vitest";

import type {
  RuntimeDiagnosticEvent,
  RuntimeEvent,
  RuntimeHealthReport,
  RuntimeHealthState,
  RuntimeHostConfiguration,
  RuntimeModule,
  RuntimeModuleHealthReport,
  RuntimeModuleSnapshot,
  RuntimeModuleStatus,
  RuntimePlugin,
  RuntimePluginActivationContext,
  RuntimePluginAdministrationAction,
  RuntimePluginAdministrationEntry,
  RuntimePluginAdministrationStatus,
  RuntimePluginAdministrationSummary,
  RuntimePluginAdministrationView,
  RuntimePluginDescriptor,
  RuntimePluginInstallPackage,
  RuntimePluginInstallPackageFile,
  RuntimePluginManifest,
} from "../src";
import {
  createRuntimeModuleFromPlugin,
  createRuntimePluginAdministrationView,
  createRuntimePluginInstallPackage,
  describeRuntimePlugin,
  normalizeRuntimePluginPackageName,
  RuntimeConfigurationValidator,
  RuntimeDiagnosticIssueCodes,
  RuntimeHealthStates,
  RuntimeHost,
  RuntimePluginCatalog,
  RuntimeModuleStatuses,
  RuntimeServiceKeys,
} from "../src";

describe("runtime public API", () => {
  it("exports the Runtime package value surface from the package root", () => {
    expect(RuntimeHost).toBeTypeOf("function");
    expect(RuntimeConfigurationValidator).toBeTypeOf("function");
    expect(RuntimeDiagnosticIssueCodes.ModuleDegraded).toBe("runtime.module.degraded");
    expect(RuntimeDiagnosticIssueCodes.ModuleFailed).toBe("runtime.module.failed");
    expect(RuntimeHealthStates.Healthy).toBe("healthy");
    expect(RuntimeHealthStates.Degraded).toBe("degraded");
    expect(RuntimeHealthStates.Failed).toBe("failed");
    expect(RuntimeModuleStatuses.Registered).toBe("registered");
    expect(RuntimeModuleStatuses.Initialized).toBe("initialized");
    expect(RuntimeModuleStatuses.Stopped).toBe("stopped");
    expect(RuntimeModuleStatuses.Disposed).toBe("disposed");
    expect(RuntimeModuleStatuses.Failed).toBe("failed");
    expect(RuntimeServiceKeys.application).toBeTypeOf("symbol");
    expect(RuntimeServiceKeys.application.description).toBe("@atlas/runtime/application");
    expect(RuntimeServiceKeys.events).toBeTypeOf("symbol");
    expect(RuntimeServiceKeys.events.description).toBe("@atlas/runtime/events");
    expect(createRuntimeModuleFromPlugin).toBeTypeOf("function");
    expect(createRuntimePluginAdministrationView).toBeTypeOf("function");
    expect(describeRuntimePlugin).toBeTypeOf("function");
    expect(createRuntimePluginInstallPackage).toBeTypeOf("function");
    expect(normalizeRuntimePluginPackageName).toBeTypeOf("function");
    expect(RuntimePluginCatalog).toBeTypeOf("function");
  });

  it("exports the Runtime package type surface from the package root", () => {
    const healthState: RuntimeHealthState = RuntimeHealthStates.Healthy;
    const moduleStatus: RuntimeModuleStatus = RuntimeModuleStatuses.Registered;
    const moduleSnapshot: RuntimeModuleSnapshot = {
      moduleId: "api-module",
      moduleVersion: "1.0.0",
      status: moduleStatus,
    };
    const moduleHealth: RuntimeModuleHealthReport = {
      moduleId: moduleSnapshot.moduleId,
      moduleVersion: moduleSnapshot.moduleVersion,
      health: healthState,
      status: moduleStatus,
    };
    const healthReport: RuntimeHealthReport = {
      applicationName: "api",
      applicationVersion: "1.0.0",
      state: "created",
      health: healthState,
      modules: [moduleHealth],
      summary: {
        healthy: 1,
        degraded: 0,
        failed: 0,
      },
    };
    const diagnosticEvent: RuntimeDiagnosticEvent = {
      type: "runtime.diagnostics.changed",
      timestamp: new Date(),
      currentHealth: healthState,
      report: healthReport,
    };
    const runtimeEvent: RuntimeEvent = diagnosticEvent;
    const runtimeModule: RuntimeModule = {
      manifest: {
        id: "api-module",
        name: "API module",
        version: "1.0.0",
        dependencies: [],
      },
      module: {
        async initialize() {},
      },
    };
    const pluginManifest: RuntimePluginManifest = {
      id: "api-plugin",
      name: "API plugin",
      version: "1.0.0",
      extensionPoints: ["runtime.service"],
      provides: ["api-service"],
    };
    const pluginDescriptor: RuntimePluginDescriptor = describeRuntimePlugin({
      manifest: pluginManifest,
      async activate() {},
    });
    const pluginAdministrationStatus: RuntimePluginAdministrationStatus = "available";
    const pluginAdministrationAction: RuntimePluginAdministrationAction = "activate";
    const pluginAdministrationEntry: RuntimePluginAdministrationEntry = {
      ...pluginDescriptor,
      status: pluginAdministrationStatus,
      actions: [pluginAdministrationAction],
    };
    const pluginAdministrationSummary: RuntimePluginAdministrationSummary = {
      total: 1,
      active: 0,
      available: 1,
      disabled: 0,
    };
    const pluginAdministrationView: RuntimePluginAdministrationView = {
      plugins: [pluginAdministrationEntry],
      summary: pluginAdministrationSummary,
    };
    const pluginInstallPackageFile: RuntimePluginInstallPackageFile = {
      path: "atlas-plugin.json",
      mediaType: "application/json",
      content: "{}",
    };
    const pluginInstallPackage: RuntimePluginInstallPackage = createRuntimePluginInstallPackage({
      plugin: pluginDescriptor,
      files: [pluginInstallPackageFile],
    });
    const pluginContext: RuntimePluginActivationContext = {
      plugin: pluginManifest,
      services: {
        add() {},
        descriptors() {
          return [];
        },
      },
    };
    const runtimePlugin: RuntimePlugin = {
      manifest: pluginManifest,
      async activate(context) {
        expect(context.plugin.id).toBe(pluginContext.plugin.id);
      },
    };
    const configuration: RuntimeHostConfiguration = {
      application: {
        name: "api",
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
      },
      modules: [runtimeModule],
    };

    expect(runtimeEvent.type).toBe("runtime.diagnostics.changed");
    expect(pluginDescriptor.extensionPoints).toEqual(["runtime.service"]);
    expect(pluginAdministrationView.summary.available).toBe(1);
    expect(pluginInstallPackage.files.map(file => file.path)).toContain("atlas-plugin.json");
    expect(pluginContext.plugin.provides).toEqual(["api-service"]);
    expect(createRuntimeModuleFromPlugin(runtimePlugin).manifest.id).toBe("api-plugin");
    expect(configuration.modules).toEqual([runtimeModule]);
  });
});
