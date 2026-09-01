const retentionMinimumDays = 1;
const defaultTimedBatchMinutes = 30;
const defaultPageFullMessageCount = 20;
export function createNotifyArchiveMessage(rule, incoming) {
    const entityAllowed = !rule.entityIds || rule.entityIds.length === 0 || !incoming.entityId || rule.entityIds.includes(incoming.entityId);
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
export function acknowledgeNotifyArchiveMessage(message, acknowledgedAt) {
    return {
        ...message,
        acknowledgedAt,
    };
}
export function evaluateNotifyArchiveDecision(settings, rules, batch, now) {
    const messages = batch.messages;
    const selectedPrinter = settings.printers.find((printer) => printer.id === settings.selectedPrinterId);
    const acknowledgementMessages = messages.filter((message) => message.acknowledgementRequired && !message.acknowledgedAt);
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
function getPrintReason(settings, batch, now) {
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
function shouldSendVacationDigest(settings, batch, now) {
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
function isBlockedByQuietHours(settings, messages, now) {
    const quietHours = settings.quietHours;
    if (!quietHours?.enabled) {
        return false;
    }
    const hour = now.getHours();
    const inQuietHours = quietHours.startHour <= quietHours.endHour
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
function getEscalationChannels(rules, acknowledgementMessages, now) {
    const channels = new Set();
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
