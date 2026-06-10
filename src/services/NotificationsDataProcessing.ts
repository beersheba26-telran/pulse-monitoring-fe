import type { NotificationData } from "../model/dashboard_types";

export type NotificationSeverityPresentation = {
  badgeBg: string;
  badgeText: string;
  rowBg: string;
};

export type NotificationPresentation = {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  message: string;
  severityText: string;
  statusText: string;
  formattedTimestamp: string;
  severityPresentation: NotificationSeverityPresentation;
  raw: NotificationData;
};

const SEVERITY_PRESENTATION: Record<string, NotificationSeverityPresentation> = {
  MINOR: { badgeBg: "yellow.300", badgeText: "black", rowBg: "yellow.50" },
  MAJOR: { badgeBg: "orange.800", badgeText: "white", rowBg: "orange.100" },
  CRITICAL: { badgeBg: "red.500", badgeText: "white", rowBg: "red.100" },
};

const DEFAULT_SEVERITY_PRESENTATION: NotificationSeverityPresentation = {
  badgeBg: "gray.200",
  badgeText: "black",
  rowBg: "gray.50",
};

const DEFAULT_UNKNOWN_LABEL = "UNKNOWN";

export function normalizeNotificationLabel(label?: string): string {
  const trimmed = label?.trim();
  if (!trimmed) {
    return DEFAULT_UNKNOWN_LABEL;
  }

  return trimmed.toUpperCase();
}

export function formatNotificationDateTime(timestamp: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

export function getSeverityPresentation(severity?: string): NotificationSeverityPresentation {
  const severityKey = normalizeNotificationLabel(severity);
  return SEVERITY_PRESENTATION[severityKey] ?? DEFAULT_SEVERITY_PRESENTATION;
}

export function toNotificationPresentation(
  notification: NotificationData,
  patientName = "Unknown patient",
): NotificationPresentation {
  const severityText = normalizeNotificationLabel(notification.severity);
  const statusText = normalizeNotificationLabel(notification.status);

  return {
    id: notification.id,
    patientId: notification.patientId,
    patientName,
    type: notification.type,
    message: notification.message,
    severityText,
    statusText,
    formattedTimestamp: formatNotificationDateTime(notification.timestamp),
    severityPresentation: getSeverityPresentation(notification.severity),
    raw: notification,
  };
}
