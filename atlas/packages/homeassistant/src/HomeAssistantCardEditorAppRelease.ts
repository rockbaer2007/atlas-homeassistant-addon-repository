export type HomeAssistantCardEditorAppReleaseStatus =
  | "ready"
  | "in-progress"
  | "planned";

export type HomeAssistantCardEditorAppReleaseEntrypoint = Readonly<{
  id: "administration" | "card-editor";
  label: string;
  url: string;
  port: number;
}>;

export type HomeAssistantCardEditorAppReleaseCheck = Readonly<{
  id: string;
  label: string;
  status: HomeAssistantCardEditorAppReleaseStatus;
  reason: string;
}>;

export type HomeAssistantCardEditorAppReleaseTarget = Readonly<{
  id:
    | "standalone-docker"
    | "home-assistant-app"
    | "linux-installer"
    | "home-assistant-hacs"
    | "atlas-plugin";
  label: string;
  status: HomeAssistantCardEditorAppReleaseStatus;
  reason: string;
}>;

export type HomeAssistantCardEditorAppReleaseReadiness = Readonly<{
  kind: "atlas.homeassistant.card-editor.app-release-readiness";
  appId: "atlas.homeassistant.card-editor";
  name: "ATLAS Home Assistant Card Editor";
  version: string;
  releaseChannel: "local-preview";
  summary: Readonly<{
    ready: number;
    inProgress: number;
    planned: number;
  }>;
  entrypoints: readonly HomeAssistantCardEditorAppReleaseEntrypoint[];
  checks: readonly HomeAssistantCardEditorAppReleaseCheck[];
  targets: readonly HomeAssistantCardEditorAppReleaseTarget[];
  recommendedNextStep: string;
}>;

const checks: readonly HomeAssistantCardEditorAppReleaseCheck[] = [
  {
    id: "admin-session-handoff",
    label: "Administration session handoff",
    status: "ready",
    reason: "The editor receives Home Assistant connection settings from Administration without shared token storage.",
  },
  {
    id: "problem-report-preview",
    label: "Opt-in problem reports",
    status: "ready",
    reason: "The editor previews sanitized debug data before copy or GitHub issue creation.",
  },
  {
    id: "plugin-install-package",
    label: "Reference plugin package",
    status: "ready",
    reason: "Administration can export the Home Assistant Card Editor as an .atlas-plugin.json package.",
  },
  {
    id: "hacs-card-bundle",
    label: "HACS card bundle export",
    status: "in-progress",
    reason: "Card bundles can be exported and imported, while the final installable repository flow still needs release wiring.",
  },
  {
    id: "home-assistant-frontend",
    label: "Home Assistant frontend integration",
    status: "planned",
    reason: "The local app and reference plugin path come before the later native Home Assistant/HACS frontend integration.",
  },
];

const targets: readonly HomeAssistantCardEditorAppReleaseTarget[] = [
  {
    id: "standalone-docker",
    label: "Standalone Docker container",
    status: "ready",
    reason: "Dockerfile and Compose wiring build the local image, start the app surfaces and pass the container health check.",
  },
  {
    id: "home-assistant-app",
    label: "Home Assistant App / Add-on",
    status: "in-progress",
    reason: "The App/Add-on scaffold builds a local preview image from the verified container runtime and reports its app target through /app.",
  },
  {
    id: "linux-installer",
    label: "Linux VM / LXC installer",
    status: "planned",
    reason: "Add a systemd-based installer for VM, LXC or bare Linux after the container path is stable.",
  },
  {
    id: "atlas-plugin",
    label: "ATLAS reference plugin",
    status: "ready",
    reason: "The Card Editor is registered as the first official ATLAS reference plugin and can be exported as a plugin package.",
  },
  {
    id: "home-assistant-hacs",
    label: "Home Assistant / HACS integration",
    status: "planned",
    reason: "HACS-oriented card bundles exist first; native Home Assistant frontend installation remains a later integration target.",
  },
];

export function createHomeAssistantCardEditorAppReleaseReadiness(): HomeAssistantCardEditorAppReleaseReadiness {
  const summary = checks.reduce(
    (accumulator, check) => {
      if (check.status === "ready") return { ...accumulator, ready: accumulator.ready + 1 };
      if (check.status === "in-progress") return { ...accumulator, inProgress: accumulator.inProgress + 1 };
      return { ...accumulator, planned: accumulator.planned + 1 };
    },
    { ready: 0, inProgress: 0, planned: 0 },
  );

  return {
    kind: "atlas.homeassistant.card-editor.app-release-readiness",
    appId: "atlas.homeassistant.card-editor",
    name: "ATLAS Home Assistant Card Editor",
    version: "0.2.0-alpha.13",
    releaseChannel: "local-preview",
    summary,
    entrypoints: [
      {
        id: "administration",
        label: "ATLAS Administration",
        url: "http://127.0.0.1:4175/",
        port: 4175,
      },
      {
        id: "card-editor",
        label: "ATLAS Home Assistant Card Editor",
        url: "http://127.0.0.1:4174/",
        port: 4174,
      },
    ],
    checks,
    targets,
    recommendedNextStep: "Install the prepared Home Assistant App/Add-on package in a local Home Assistant /addons directory, then add the Linux installer after the container contract stays stable.",
  };
}
