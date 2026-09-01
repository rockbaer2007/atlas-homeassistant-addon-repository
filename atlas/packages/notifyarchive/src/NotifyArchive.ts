export type NotifyArchivePriority = "info" | "warning" | "fault" | "critical" | "alarm";

export type NotifyArchiveMessageKind = "alarm" | "notification" | "entity_outage";

export type NotifyArchivePrintMode = "immediate" | "timed" | "page_full" | "archive_only";

export type NotifyArchiveOperatingMode = "normal" | "vacation";

export type NotifyArchiveEscalationChannel = "print" | "email" | "home_assistant" | "awtrix";

export interface NotifyArchivePrinterTarget {
  readonly id: string;
  readonly name: string;
  readonly ippEntityId?: string;
}

export interface NotifyArchiveRetentionPolicy {
  readonly localDays: number;
  readonly sftpDays: number;
}

export interface NotifyArchiveEscalationPolicy {
  readonly enabled: boolean;
  readonly afterMinutes: number;
  readonly channels: readonly NotifyArchiveEscalationChannel[];
}

export interface NotifyArchiveRule {
  readonly id: string;
  readonly name: string;
  readonly kind: NotifyArchiveMessageKind;
  readonly priority: NotifyArchivePriority;
  readonly entityIds?: readonly string[];
  readonly fixedTextEnabled?: boolean;
  readonly fixedText?: string;
  readonly acknowledgementRequired?: boolean;
  readonly escalation?: NotifyArchiveEscalationPolicy;
}

export interface NotifyArchiveSettings {
  readonly mode: NotifyArchiveOperatingMode;
  readonly printMode: NotifyArchivePrintMode;
  readonly selectedPrinterId?: string;
  readonly printers: readonly NotifyArchivePrinterTarget[];
  readonly retention: NotifyArchiveRetentionPolicy;
  readonly timedBatchMinutes?: number;
  readonly pageFullMessageCount?: number;
  readonly quietHours?: {
    readonly enabled: boolean;
    readonly startHour: number;
    readonly endHour: number;
    readonly allowCritical: boolean;
  };
  readonly vacationEmailEveryDays?: number;
  readonly sftpBackupEnabled?: boolean;
}

export interface NotifyArchiveIncomingMessage {
  readonly ruleId: string;
  readonly text: string;
  readonly entityId?: string;
  readonly createdAt: Date;
}

export interface NotifyArchiveMessage {
  readonly id: string;
  readonly ruleId: string;
  readonly kind: NotifyArchiveMessageKind;
  readonly priority: NotifyArchivePriority;
  readonly title: string;
  readonly text: string;
  readonly entityId?: string;
  readonly createdAt: Date;
  readonly acknowledgementRequired: boolean;
  readonly acknowledgedAt?: Date;
  readonly repeatCount: number;
}

export interface NotifyArchivePendingBatch {
  readonly messages: readonly NotifyArchiveMessage[];
  readonly firstMessageAt?: Date;
  readonly lastPrintedAt?: Date;
  readonly lastVacationEmailAt?: Date;
}

export interface NotifyArchiveDecision {
  readonly shouldArchivePdf: boolean;
  readonly shouldBackupToSftp: boolean;
  readonly shouldPrint: boolean;
  readonly shouldSendVacationEmail: boolean;
  readonly selectedPrinter?: NotifyArchivePrinterTarget;
  readonly printReason?: "immediate" | "timed" | "page_full";
  readonly blockedByQuietHours: boolean;
  readonly escalationChannels: readonly NotifyArchiveEscalationChannel[];
  readonly messagesRequiringAcknowledgement: readonly NotifyArchiveMessage[];
}

const retentionMinimumDays = 1;
const defaultTimedBatchMinutes = 30;
const defaultPageFullMessageCount = 20;

export function createNotifyArchiveMessage(
  rule: NotifyArchiveRule,
  incoming: NotifyArchiveIncomingMessage,
): NotifyArchiveMessage {
  const entityAllowed =
    !rule.entityIds || rule.entityIds.length === 0 || !incoming.entityId || rule.entityIds.includes(incoming.entityId);

  if (!entityAllowed) {
    throw new Error(`Entity ${incoming.entityId} is not allowed for NotifyArchive rule ${rule.id}.`);
  }

  const text = rule.fixedTextEnabled && rule.fixedText ? rule.fixedText : incoming.text;

  return {
    id: `${rule.id}:${incoming.createdAt.toISOString()}:${incoming.entityId ?? "message"}`,
    ruleId: rule.id,
    kind: rule.kind,
    priority: rule.priority,
    title: rule.name,
    text,
    entityId: incoming.entityId,
    createdAt: incoming.createdAt,
    acknowledgementRequired: rule.acknowledgementRequired === true,
    repeatCount: 1,
  };
}

export function acknowledgeNotifyArchiveMessage(
  message: NotifyArchiveMessage,
  acknowledgedAt: Date,
): NotifyArchiveMessage {
  return {
    ...message,
    acknowledgedAt,
  };
}

export function evaluateNotifyArchiveDecision(
  settings: NotifyArchiveSettings,
  rules: readonly NotifyArchiveRule[],
  batch: NotifyArchivePendingBatch,
  now: Date,
): NotifyArchiveDecision {
  const messages = batch.messages;
  const selectedPrinter = settings.printers.find((printer) => printer.id === settings.selectedPrinterId);
  const acknowledgementMessages = messages.filter(
    (message) => message.acknowledgementRequired && !message.acknowledgedAt,
  );
  const blockedByQuietHours = isBlockedByQuietHours(settings, messages, now);
  const shouldPrintByMode = getPrintReason(settings, batch, now);
  const vacationMode = settings.mode === "vacation";
  const shouldPrint = !vacationMode && !blockedByQuietHours && shouldPrintByMode !== undefined && selectedPrinter !== undefined;
  const shouldSendVacationEmail = vacationMode && shouldSendVacationDigest(settings, batch, now);

  return {
    shouldArchivePdf: messages.length > 0,
    shouldBackupToSftp: messages.length > 0 && settings.sftpBackupEnabled === true && settings.retention.sftpDays >= retentionMinimumDays,
    shouldPrint,
    shouldSendVacationEmail,
    selectedPrinter,
    printReason: shouldPrint ? shouldPrintByMode : undefined,
    blockedByQuietHours,
    escalationChannels: getEscalationChannels(rules, acknowledgementMessages, now),
    messagesRequiringAcknowledgement: acknowledgementMessages,
  };
}

function getPrintReason(
  settings: NotifyArchiveSettings,
  batch: NotifyArchivePendingBatch,
  now: Date,
): NotifyArchiveDecision["printReason"] {
  if (batch.messages.length === 0 || settings.printMode === "archive_only") {
    return undefined;
  }

  if (settings.printMode === "immediate") {
    return "immediate";
  }

  if (settings.printMode === "page_full") {
    const pageFullMessageCount = settings.pageFullMessageCount ?? defaultPageFullMessageCount;
    return batch.messages.length >= pageFullMessageCount ? "page_full" : undefined;
  }

  const firstMessageAt = batch.firstMessageAt ?? batch.messages[0]?.createdAt;
  if (!firstMessageAt) {
    return undefined;
  }

  const timedBatchMinutes = settings.timedBatchMinutes ?? defaultTimedBatchMinutes;
  return now.getTime() - firstMessageAt.getTime() >= timedBatchMinutes * 60_000 ? "timed" : undefined;
}

function shouldSendVacationDigest(settings: NotifyArchiveSettings, batch: NotifyArchivePendingBatch, now: Date): boolean {
  if (batch.messages.length === 0) {
    return false;
  }

  const everyDays = settings.vacationEmailEveryDays;
  if (!everyDays || everyDays < 2 || everyDays > 7) {
    return false;
  }

  if (!batch.lastVacationEmailAt) {
    return true;
  }

  return now.getTime() - batch.lastVacationEmailAt.getTime() >= everyDays * 24 * 60 * 60_000;
}

function isBlockedByQuietHours(
  settings: NotifyArchiveSettings,
  messages: readonly NotifyArchiveMessage[],
  now: Date,
): boolean {
  const quietHours = settings.quietHours;
  if (!quietHours?.enabled) {
    return false;
  }

  const hour = now.getHours();
  const inQuietHours =
    quietHours.startHour <= quietHours.endHour
      ? hour >= quietHours.startHour && hour < quietHours.endHour
      : hour >= quietHours.startHour || hour < quietHours.endHour;

  if (!inQuietHours) {
    return false;
  }

  if (quietHours.allowCritical) {
    return !messages.some((message) => message.priority === "critical" || message.priority === "alarm");
  }

  return true;
}

function getEscalationChannels(
  rules: readonly NotifyArchiveRule[],
  acknowledgementMessages: readonly NotifyArchiveMessage[],
  now: Date,
): readonly NotifyArchiveEscalationChannel[] {
  const channels = new Set<NotifyArchiveEscalationChannel>();

  for (const message of acknowledgementMessages) {
    const rule = rules.find((candidate) => candidate.id === message.ruleId);
    const escalation = rule?.escalation;
    if (!escalation?.enabled) {
      continue;
    }

    const due = now.getTime() - message.createdAt.getTime() >= escalation.afterMinutes * 60_000;
    if (!due) {
      continue;
    }

    for (const channel of escalation.channels) {
      channels.add(channel);
    }
  }

  return Array.from(channels);
}
