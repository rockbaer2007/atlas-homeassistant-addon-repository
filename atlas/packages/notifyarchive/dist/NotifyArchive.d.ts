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
export declare function createNotifyArchiveMessage(rule: NotifyArchiveRule, incoming: NotifyArchiveIncomingMessage): NotifyArchiveMessage;
export declare function acknowledgeNotifyArchiveMessage(message: NotifyArchiveMessage, acknowledgedAt: Date): NotifyArchiveMessage;
export declare function evaluateNotifyArchiveDecision(settings: NotifyArchiveSettings, rules: readonly NotifyArchiveRule[], batch: NotifyArchivePendingBatch, now: Date): NotifyArchiveDecision;
