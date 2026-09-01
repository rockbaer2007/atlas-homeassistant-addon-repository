export const RendererMountReportConsumerDiagnosticCodes = {
    NotConsumed: "renderer.mount.report.consumer.not_consumed",
    ConsumerFailed: "renderer.mount.report.consumer.failed",
};
export const RendererMountReportConsumerDiagnosticPolicyCodes = {
    ConsumerDiagnosticsFailed: "renderer.mount.report.consumer.diagnostics.policy.consumer_failed",
    IssueLimitExceeded: "renderer.mount.report.consumer.diagnostics.policy.issue_limit_exceeded",
};
export function createRendererMountReportConsumer(consumer) {
    return {
        ...consumer,
    };
}
export function createRendererMountReportConsumerRegistry(consumers) {
    return {
        consumers: [...consumers],
    };
}
export function createRendererMountReportConsumerLookupRequest(request) {
    return {
        ...request,
    };
}
export function createRendererMountReportConsumerLookupResult(result) {
    return {
        ...result,
    };
}
export function createRendererMountReportConsumerSelectionRequest(request) {
    return {
        ...request,
        candidates: [...request.candidates],
    };
}
export function createRendererMountReportConsumerSelectionResult(result) {
    return {
        ...result,
    };
}
export function createRendererMountReportConsumerConflict(conflict) {
    return {
        ...conflict,
        consumers: [...conflict.consumers],
    };
}
export function createRendererMountReportConsumerConflictResolution(resolution) {
    return {
        ...resolution,
        conflict: createRendererMountReportConsumerConflict(resolution.conflict),
    };
}
export function findRendererMountReportConsumer(registry, request) {
    const consumer = registry.consumers.find(candidate => candidate.name === request.name);
    return createRendererMountReportConsumerLookupResult({
        name: request.name,
        ...(consumer ? { consumer } : {}),
    });
}
export function findRendererMountReportConsumerConflicts(registry) {
    const consumersByName = new Map();
    for (const consumer of registry.consumers) {
        const consumers = consumersByName.get(consumer.name) ?? [];
        consumers.push(consumer);
        consumersByName.set(consumer.name, consumers);
    }
    return [...consumersByName.entries()]
        .filter(([, consumers]) => consumers.length > 1)
        .map(([name, consumers]) => createRendererMountReportConsumerConflict({
        name,
        consumers,
    }));
}
export function selectFirstRendererMountReportConsumerCandidate(request) {
    const consumer = request.candidates[0];
    return createRendererMountReportConsumerSelectionResult({
        name: request.name,
        ...(consumer ? { consumer } : {}),
    });
}
export function resolveRendererMountReportConsumerConflictWithFirstCandidate(conflict) {
    const selection = selectFirstRendererMountReportConsumerCandidate(createRendererMountReportConsumerSelectionRequest({
        name: conflict.name,
        candidates: conflict.consumers,
    }));
    return createRendererMountReportConsumerConflictResolution({
        conflict,
        resolved: Boolean(selection.consumer),
        ...(selection.consumer ? { consumer: selection.consumer } : {}),
    });
}
export function resolveRendererMountReportConsumerRegistryConflictsWithFirstCandidate(registry) {
    return findRendererMountReportConsumerConflicts(registry)
        .map(resolveRendererMountReportConsumerConflictWithFirstCandidate);
}
export async function consumeRendererMountReports(consumer, consumption) {
    return consumer.consume(consumption);
}
export async function consumeAndInspectRendererMountReports(consumer, consumption) {
    let result;
    try {
        result = await consumeRendererMountReports(consumer, consumption);
    }
    catch (error) {
        result = {
            consumerName: consumer.name,
            consumed: false,
            summary: consumption.summary,
            error: error instanceof Error ? error.message : String(error),
        };
    }
    return {
        consumerName: result.consumerName,
        result,
        diagnostic: inspectRendererMountReportConsumerResult(result),
    };
}
export async function consumeAndInspectRendererMountReportConsumers(consumers, consumption, policy) {
    const executions = [];
    for (const consumer of consumers) {
        executions.push(await consumeAndInspectRendererMountReports(consumer, consumption));
    }
    const aggregation = aggregateRendererMountReportConsumerDiagnostics(executions.map(execution => execution.diagnostic));
    const summary = summarizeRendererMountReportConsumerDiagnosticAggregation(aggregation);
    return {
        executions,
        aggregation,
        summary,
        ...(policy ? {
            policyEvaluation: evaluateRendererMountReportConsumerDiagnosticPolicy(summary, policy),
        } : {}),
    };
}
export async function consumeAndInspectRendererMountReportConsumerRegistry(registry, consumption, policy) {
    return {
        registry,
        batch: await consumeAndInspectRendererMountReportConsumers(registry.consumers, consumption, policy),
    };
}
export function reviewRendererMountReportConsumerDiagnosticRegistryExecution(execution) {
    const conflicts = findRendererMountReportConsumerConflicts(execution.registry);
    const policyOk = execution.batch.policyEvaluation?.result.ok;
    const issues = [
        ...execution.batch.aggregation.result.issues,
        ...conflicts.map(conflict => ({
            code: "renderer.mount.report.consumer.registry.execution.conflict",
            message: `${conflict.name} has ${conflict.consumers.length} Renderer mount report consumers`,
            severity: "error",
        })),
        ...(execution.batch.policyEvaluation?.result.issues ?? []),
    ];
    return {
        context: {
            component: "renderer.mount.report.consumer.registry.execution.closure",
        },
        result: {
            ok: issues.length === 0,
            registryConsumerCount: execution.registry.consumers.length,
            executedConsumerCount: execution.batch.executions.length,
            conflictCount: conflicts.length,
            diagnosticsOk: execution.batch.aggregation.result.ok,
            ...(policyOk === undefined ? {} : { policyOk }),
            issues,
        },
    };
}
export function createRendererMountReportConsumerDiagnosticDelivery(name, closure) {
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery",
        name,
        ready: closure.result.ok,
        issueCount: closure.result.issues.length,
        closure,
    };
}
export function createRendererMountReportConsumerDiagnosticDeliveryManifest(name, deliveries) {
    const copiedDeliveries = [...deliveries];
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery.manifest",
        name,
        deliveries: copiedDeliveries,
        readyCount: copiedDeliveries.filter(delivery => delivery.ready).length,
        blockedCount: copiedDeliveries.filter(delivery => !delivery.ready).length,
        issueCount: copiedDeliveries
            .reduce((issueCount, delivery) => issueCount + delivery.issueCount, 0),
    };
}
export function reviewRendererMountReportConsumerDiagnosticDeliveryManifest(manifest) {
    const issues = manifest.deliveries
        .flatMap(delivery => delivery.closure.result.issues);
    return {
        context: {
            component: "renderer.mount.report.consumer.diagnostics.delivery.manifest.closure",
            manifestName: manifest.name,
        },
        result: {
            ok: manifest.blockedCount === 0 && issues.length === 0,
            deliveryCount: manifest.deliveries.length,
            readyCount: manifest.readyCount,
            blockedCount: manifest.blockedCount,
            issueCount: issues.length,
            issues,
        },
    };
}
export function createRendererMountReportConsumerDiagnosticDeliveryBundle(name, closures) {
    const copiedClosures = [...closures];
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle",
        name,
        ready: copiedClosures.every(closure => closure.result.ok),
        manifestCount: copiedClosures.length,
        issueCount: copiedClosures
            .reduce((issueCount, closure) => issueCount + closure.result.issueCount, 0),
        closures: copiedClosures,
    };
}
export function snapshotRendererMountReportConsumerDiagnosticDeliveryBundle(bundle) {
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle.snapshot",
        bundleName: bundle.name,
        ready: bundle.ready,
        manifestCount: bundle.manifestCount,
        issueCount: bundle.issueCount,
        manifestNames: bundle.closures.map(closure => closure.context.manifestName),
    };
}
export function createRendererMountReportConsumerDiagnosticDeliverySnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    };
}
export function createRendererMountReportConsumerDiagnosticDeliveryExport(name, catalog) {
    return {
        kind: "renderer.mount.report.consumer.diagnostics.delivery.export",
        name,
        ready: catalog.blockedCount === 0,
        snapshotCount: catalog.snapshots.length,
        issueCount: catalog.issueCount,
        catalog,
    };
}
export function createRendererIntegrationPreparation(name, deliveryExport) {
    return {
        kind: "renderer.integration.preparation",
        name,
        ready: deliveryExport.ready,
        issueCount: deliveryExport.issueCount,
        deliveryExport,
        boundaries: {
            transport: false,
            dom: false,
            homeAssistant: false,
            theme: false,
            platform: false,
        },
    };
}
export function reviewRendererIntegrationPreparationReadiness(preparation) {
    const blockedBoundaries = Object.entries(preparation.boundaries)
        .filter(([, enabled]) => !enabled)
        .map(([boundary]) => boundary);
    const issues = [
        ...(!preparation.ready ? [{
                code: "renderer.integration.preparation.not_ready",
                message: `${preparation.name} is not ready for Renderer integration`,
                severity: "error",
            }] : []),
    ];
    return {
        context: {
            component: "renderer.integration",
            preparationName: preparation.name,
        },
        result: {
            ready: issues.length === 0,
            issueCount: preparation.issueCount,
            blockedBoundaries,
            issues,
        },
    };
}
export function createRendererIntegrationHandoff(name, readiness) {
    return {
        kind: "renderer.integration.handoff",
        name,
        ready: readiness.result.ready,
        issueCount: readiness.result.issueCount,
        readiness,
    };
}
export function snapshotRendererIntegrationHandoff(handoff) {
    return {
        kind: "renderer.integration.handoff.snapshot",
        handoffName: handoff.name,
        ready: handoff.ready,
        issueCount: handoff.issueCount,
        preparationName: handoff.readiness.context.preparationName,
    };
}
export function createRendererIntegrationHandoffSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.integration.handoff.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    };
}
export function reviewRendererConcreteIntegrationBoundary(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.review",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        boundaries: {
            transport: false,
            dom: false,
            homeAssistant: false,
            theme: false,
            platform: false,
        },
    };
}
export function createRendererConcreteIntegrationBoundaryDecision(name, review) {
    const candidates = Object.keys(review.boundaries);
    return {
        kind: "renderer.concrete.integration.boundary.decision",
        name,
        ready: review.ready,
        issueCount: review.issueCount,
        review,
        candidates,
        ...(review.ready ? { selectedBoundary: candidates[0] } : {}),
    };
}
export function createRendererConcreteIntegrationBoundaryPlan(name, decision) {
    return {
        kind: "renderer.concrete.integration.boundary.plan",
        name,
        ready: decision.ready,
        issueCount: decision.issueCount,
        decision,
        steps: ["review", "decide", "prepare"],
        ...(decision.selectedBoundary ? { plannedBoundary: decision.selectedBoundary } : {}),
    };
}
export function snapshotRendererConcreteIntegrationBoundaryPlan(plan) {
    return {
        kind: "renderer.concrete.integration.boundary.plan.snapshot",
        planName: plan.name,
        ready: plan.ready,
        issueCount: plan.issueCount,
        stepCount: plan.steps.length,
        ...(plan.plannedBoundary ? { plannedBoundary: plan.plannedBoundary } : {}),
    };
}
export function createRendererConcreteIntegrationBoundaryPlanSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.plan.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    };
}
export function prepareRendererConcreteIntegrationBoundaryExecution(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.preparation",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        execution: {
            prepared: catalog.blockedCount === 0,
            executable: false,
            planCount: catalog.snapshots.length,
        },
    };
}
export function closeRendererConcreteIntegrationBoundaryExecution(name, preparation) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.closure",
        name,
        ready: preparation.ready,
        issueCount: preparation.issueCount,
        preparation,
        result: {
            closed: true,
            executable: false,
            planCount: preparation.execution.planCount,
        },
    };
}
export function snapshotRendererConcreteIntegrationBoundaryExecutionClosure(closure) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.closure.snapshot",
        closureName: closure.name,
        ready: closure.ready,
        issueCount: closure.issueCount,
        planCount: closure.result.planCount,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.execution.closure.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryExecutionDelivery(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.delivery",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryExecutionDelivery(delivery) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot",
        deliveryName: delivery.name,
        ready: delivery.ready,
        issueCount: delivery.issueCount,
        closureSnapshotCount: delivery.catalog.snapshots.length,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryExecutionExport(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.export",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryExecutionExport(executionExport) {
    return {
        kind: "renderer.concrete.integration.boundary.execution.export.snapshot",
        exportName: executionExport.name,
        ready: executionExport.ready,
        issueCount: executionExport.issueCount,
        deliverySnapshotCount: executionExport.catalog.snapshots.length,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.execution.export.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function finalizeRendererConcreteIntegrationBoundary(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        finalized: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryFinalization(finalization) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization.snapshot",
        finalizationName: finalization.name,
        ready: finalization.ready,
        issueCount: finalization.issueCount,
        exportSnapshotCount: finalization.catalog.snapshots.length,
        finalized: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.finalization.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryFinalizationHandoff(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization.handoff",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        finalized: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryFinalizationHandoff(handoff) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot",
        handoffName: handoff.name,
        ready: handoff.ready,
        issueCount: handoff.issueCount,
        finalizationSnapshotCount: handoff.catalog.snapshots.length,
        finalized: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryFinalizationExport(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization.export",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        finalized: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryFinalizationExport(finalizationExport) {
    return {
        kind: "renderer.concrete.integration.boundary.finalization.export.snapshot",
        exportName: finalizationExport.name,
        ready: finalizationExport.ready,
        issueCount: finalizationExport.issueCount,
        handoffSnapshotCount: finalizationExport.catalog.snapshots.length,
        finalized: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.finalization.export.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryRelease(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.release",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        released: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryRelease(release) {
    return {
        kind: "renderer.concrete.integration.boundary.release.snapshot",
        releaseName: release.name,
        ready: release.ready,
        issueCount: release.issueCount,
        snapshotCount: release.catalog.snapshots.length,
        released: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.release.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseExport(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.release.export",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        exported: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryReleaseExport(releaseExport) {
    return {
        kind: "renderer.concrete.integration.boundary.release.export.snapshot",
        exportName: releaseExport.name,
        ready: releaseExport.ready,
        issueCount: releaseExport.issueCount,
        releaseSnapshotCount: releaseExport.catalog.snapshots.length,
        exported: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.release.export.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function closeRendererConcreteIntegrationBoundaryRelease(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.release.closure",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        closed: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryReleaseClosure(closure) {
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.snapshot",
        closureName: closure.name,
        ready: closure.ready,
        issueCount: closure.issueCount,
        exportSnapshotCount: closure.catalog.snapshots.length,
        closed: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseClosureExport(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.export",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        exported: true,
        executable: false,
    };
}
export function snapshotRendererConcreteIntegrationBoundaryReleaseClosureExport(releaseExport) {
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot",
        exportName: releaseExport.name,
        ready: releaseExport.ready,
        issueCount: releaseExport.issueCount,
        closureSnapshotCount: releaseExport.catalog.snapshots.length,
        exported: true,
        executable: false,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog(name, snapshots) {
    const copiedSnapshots = [...snapshots];
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot.catalog",
        name,
        snapshots: copiedSnapshots,
        readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
        blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
        issueCount: copiedSnapshots
            .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
        executableCount: 0,
    };
}
export function createRendererConcreteIntegrationBoundaryReleaseClosureDelivery(name, catalog) {
    return {
        kind: "renderer.concrete.integration.boundary.release.closure.delivery",
        name,
        ready: catalog.blockedCount === 0,
        issueCount: catalog.issueCount,
        catalog,
        delivered: true,
        executable: false,
    };
}
export function inspectRendererMountReportConsumerResult(result) {
    const issues = [
        ...(!result.consumed ? [{
                code: RendererMountReportConsumerDiagnosticCodes.NotConsumed,
                message: `${result.consumerName} did not consume Renderer mount reports`,
                severity: "error",
            }] : []),
        ...(result.error ? [{
                code: RendererMountReportConsumerDiagnosticCodes.ConsumerFailed,
                message: result.error,
                severity: "error",
            }] : []),
    ];
    return {
        context: {
            component: "renderer.mount.report.consumer",
            consumerName: result.consumerName,
        },
        result: {
            ok: issues.length === 0,
            issues,
        },
    };
}
export function aggregateRendererMountReportConsumerDiagnostics(reports) {
    const copiedReports = reports.map(report => ({
        context: {
            ...report.context,
        },
        result: {
            ok: report.result.ok,
            issues: [...report.result.issues],
        },
    }));
    const issues = copiedReports.flatMap(report => report.result.issues);
    return {
        context: {
            component: "renderer.mount.report.consumer.diagnostics",
            consumerNames: copiedReports.map(report => report.context.consumerName),
        },
        result: {
            ok: issues.length === 0,
            reports: copiedReports,
            issues,
        },
    };
}
export function summarizeRendererMountReportConsumerDiagnosticAggregation(aggregation) {
    const okConsumerCount = aggregation.result.reports
        .filter(report => report.result.ok).length;
    const failedConsumerCount = aggregation.result.reports.length - okConsumerCount;
    return {
        ok: aggregation.result.ok,
        consumerCount: aggregation.result.reports.length,
        okConsumerCount,
        failedConsumerCount,
        issueCount: aggregation.result.issues.length,
    };
}
export function evaluateRendererMountReportConsumerDiagnosticPolicy(summary, policy = {}) {
    const requireAllConsumersOk = policy.requireAllConsumersOk ?? true;
    const issues = [
        ...(requireAllConsumersOk && summary.failedConsumerCount > 0 ? [{
                code: RendererMountReportConsumerDiagnosticPolicyCodes.ConsumerDiagnosticsFailed,
                message: `${summary.failedConsumerCount} Renderer mount report consumers failed diagnostics`,
                severity: "error",
            }] : []),
        ...(policy.maxIssueCount !== undefined && summary.issueCount > policy.maxIssueCount ? [{
                code: RendererMountReportConsumerDiagnosticPolicyCodes.IssueLimitExceeded,
                message: `Renderer mount report consumer diagnostics reported ${summary.issueCount} issues, exceeding ${policy.maxIssueCount}`,
                severity: "error",
            }] : []),
    ];
    return {
        context: {
            component: "renderer.mount.report.consumer.diagnostics.policy",
        },
        result: {
            ok: issues.length === 0,
            summary,
            issues,
        },
    };
}
