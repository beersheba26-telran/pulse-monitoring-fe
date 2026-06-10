import type { ActionData, NotificationData, PatientData } from "../model/dashboard_types";

export default interface NotificationsService {
    getNotificationsDoctor(doctorId: string, signal?: AbortSignal): Promise<NotificationData[]>;
    getNotificationsPatient(patientId: string, signal?: AbortSignal): Promise<NotificationData[]>;
    getPatientByPatientId(patientId: string, signal?: AbortSignal): Promise<PatientData | null>;
    getPatientByNotificationId(notificationId: string, signal?: AbortSignal): Promise<PatientData | null>;
    addActionToNotification(notificationId: string, action: ActionData, signal?: AbortSignal): Promise<void>;
}

export type NotificationsPollingOptions = {
    pollIntervalMs?: number;
    doctorId?: string;
    patientId?: string;
};