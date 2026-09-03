import { describe, expect, it } from "vitest";
import {
  acknowledgeNotifyArchiveMessage,
  createNotifyArchiveMessage,
  evaluateNotifyArchiveDecision,
  type NotifyArchiveRule,
  type NotifyArchiveSettings,
} from "../src";

const printer = {
  id: "office",
  name: "Canon TS700 series - Büro",
  ippEntityId: "sensor.canon_ts700_series",
};

const baseSettings: NotifyArchiveSettings = {
  mode: "normal",
  printMode: "timed",
  selectedPrinterId: "office",
  printers: [printer],
  retention: {
    localDays: 30,
    sftpDays: 90,
  },
  timedBatchMinutes: 30,
  pageFullMessageCount: 3,
  sftpBackupEnabled: true,
};

const heatingRule: NotifyArchiveRule = {
  id: "heating-fault",
  name: "Heizungsstörung",
  kind: "alarm",
  priority: "alarm",
  entityIds: ["binary_sensor.heizung_stoerung"],
  fixedTextEnabled: true,
  fixedText: "Heizungsstörung erkannt. Bitte Anlage prüfen.",
  acknowledgementRequired: true,
  escalation: {
    enabled: true,
    afterMinutes: 10,
    channels: ["email", "awtrix"],
  },
};

describe("NotifyArchive", () => {
  it("uses fixed alarm text when the rule requests it", () => {
    const message = createNotifyArchiveMessage(heatingRule, {
      ruleId: heatingRule.id,
      entityId: "binary_sensor.heizung_stoerung",
      text: "Normaler Notification-Text",
      createdAt: new Date("2026-08-21T10:00:00.000Z"),
    });

    expect(message.text).toBe("Heizungsstörung erkannt. Bitte Anlage prüfen.");
    expect(message.acknowledgementRequired).toBe(true);
  });

  it("prints a timed normal-mode batch and marks it for local and sftp archive", () => {
    const message = createNotifyArchiveMessage(heatingRule, {
      ruleId: heatingRule.id,
      entityId: "binary_sensor.heizung_stoerung",
      text: "Heizung meldet Störung",
      createdAt: new Date("2026-08-21T10:00:00.000Z"),
    });

    const decision = evaluateNotifyArchiveDecision(
      baseSettings,
      [heatingRule],
      {
        messages: [message],
        firstMessageAt: message.createdAt,
      },
      new Date("2026-08-21T10:31:00.000Z"),
    );

    expect(decision.shouldArchivePdf).toBe(true);
    expect(decision.shouldBackupToSftp).toBe(true);
    expect(decision.shouldPrint).toBe(true);
    expect(decision.printReason).toBe("timed");
    expect(decision.selectedPrinter).toEqual(printer);
  });

  it("stores and sends vacation digest instead of printing in vacation mode", () => {
    const message = createNotifyArchiveMessage(heatingRule, {
      ruleId: heatingRule.id,
      entityId: "binary_sensor.heizung_stoerung",
      text: "Heizung meldet Störung",
      createdAt: new Date("2026-08-21T10:00:00.000Z"),
    });

    const decision = evaluateNotifyArchiveDecision(
      {
        ...baseSettings,
        mode: "vacation",
        vacationEmailEveryDays: 3,
      },
      [heatingRule],
      {
        messages: [message],
        firstMessageAt: message.createdAt,
      },
      new Date("2026-08-21T10:31:00.000Z"),
    );

    expect(decision.shouldPrint).toBe(false);
    expect(decision.shouldArchivePdf).toBe(true);
    expect(decision.shouldBackupToSftp).toBe(true);
    expect(decision.shouldSendVacationEmail).toBe(true);
  });

  it("escalates only unacknowledged acknowledgement-required messages", () => {
    const message = createNotifyArchiveMessage(heatingRule, {
      ruleId: heatingRule.id,
      entityId: "binary_sensor.heizung_stoerung",
      text: "Heizung meldet Störung",
      createdAt: new Date("2026-08-21T10:00:00.000Z"),
    });
    const acknowledgedMessage = acknowledgeNotifyArchiveMessage(message, new Date("2026-08-21T10:03:00.000Z"));

    const pendingDecision = evaluateNotifyArchiveDecision(
      baseSettings,
      [heatingRule],
      {
        messages: [message],
        firstMessageAt: message.createdAt,
      },
      new Date("2026-08-21T10:11:00.000Z"),
    );
    const acknowledgedDecision = evaluateNotifyArchiveDecision(
      baseSettings,
      [heatingRule],
      {
        messages: [acknowledgedMessage],
        firstMessageAt: acknowledgedMessage.createdAt,
      },
      new Date("2026-08-21T10:11:00.000Z"),
    );

    expect(pendingDecision.escalationChannels).toEqual(["email", "awtrix"]);
    expect(pendingDecision.messagesRequiringAcknowledgement).toHaveLength(1);
    expect(acknowledgedDecision.escalationChannels).toEqual([]);
    expect(acknowledgedDecision.messagesRequiringAcknowledgement).toHaveLength(0);
  });
});
