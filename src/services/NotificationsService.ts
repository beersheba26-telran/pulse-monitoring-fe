import type { NotificationData, PatientData } from "../model/dashboard_types";

export default interface NotificationsService {
    getNotifications(signal?: AbortSignal): Promise<NotificationData[]>;
    getPatientByPatientId(patientId: string, signal?: AbortSignal): Promise<PatientData | null>;
    getPatientByNotificationId(notificationId: string, signal?: AbortSignal): Promise<PatientData | null>;
}

export type NotificationsPollingOptions = {
    pollIntervalMs?: number;
};