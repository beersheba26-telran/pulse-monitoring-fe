import { describe, expect, it } from "vitest";

import type { NotificationData } from "../model/dashboard_types";
import {
  getSeverityPresentation,
  normalizeNotificationLabel,
  toNotificationPresentation,
} from "./NotificationsDataProcessing";

const baseNotification: NotificationData = {
  id: "1",
  patientId: "13",
  message: "ABnormal JUMP previous value 84 -> current value 107",
  timestamp: new Date("2026-06-09T10:57:08.787Z"),
  type: "JUMP_RATE",
  severity: "minor",
  status: "created",
};

describe("NotificationsDataProcessing", () => {
  it("normalizes labels to uppercase with UNKNOWN fallback", () => {
    expect(normalizeNotificationLabel(" minor ")).toBe("MINOR");
    expect(normalizeNotificationLabel("   ")).toBe("UNKNOWN");
    expect(normalizeNotificationLabel(undefined)).toBe("UNKNOWN");
  });

  it("returns severity presentation with fallback", () => {
    expect(getSeverityPresentation("CRITICAL")).toEqual({
      badgeBg: "red.500",
      badgeText: "white",
      rowBg: "red.100",
    });

    expect(getSeverityPresentation("not_known")).toEqual({
      badgeBg: "gray.200",
      badgeText: "black",
      rowBg: "gray.50",
    });
  });

  it("maps notification domain data to presentation model", () => {
    const presentation = toNotificationPresentation(baseNotification, "Ava Lee");

    expect(presentation.id).toBe("1");
    expect(presentation.patientName).toBe("Ava Lee");
    expect(presentation.severityText).toBe("MINOR");
    expect(presentation.statusText).toBe("CREATED");
    expect(presentation.severityPresentation).toEqual({
      badgeBg: "yellow.300",
      badgeText: "black",
      rowBg: "yellow.50",
    });
    expect(presentation.formattedTimestamp).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/);
    expect(presentation.raw).toBe(baseNotification);
  });
});
