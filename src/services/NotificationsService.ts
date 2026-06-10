import type { ActionData, DoctorData, NotificationData, PatientData } from "../model/dashboard_types";

export default interface NotificationsService {
    getNotificationsDoctor(doctorId: string, signal?: AbortSignal): Promise<NotificationData[]>;
    getNotificationsPatient(patientId: string, signal?: AbortSignal): Promise<NotificationData[]>;
    getPatientByPatientId(patientId: string, signal?: AbortSignal): Promise<PatientData | null>;
    getPatientByNotificationId(notificationId: string, signal?: AbortSignal): Promise<PatientData | null>;
    getNotificationHistoryByNotificationId(notificationId: string, signal?: AbortSignal): Promise<ActionData[]>;
    getDoctorByDoctorId(doctorId: string, signal?: AbortSignal): Promise<DoctorData | null>;
    addActionToNotification(notificationId: string, action: ActionData, signal?: AbortSignal): Promise<void>;
}

export type NotificationsPollingOptions = {
    pollIntervalMs?: number;
    doctorId?: string;
    patientId?: string;
};