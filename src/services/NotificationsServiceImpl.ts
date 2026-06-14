import axios from "axios";

import type { ActionData, NotificationData, PatientData } from "../model/dashboard_types";
import type NotificationsService from "./NotificationsService";

type NotificationDto = Omit<NotificationData, "timestamp"> & {
	timestamp: string;
};

type ActionDto = Omit<ActionData, "timestamp"> & {
	timestamp: string;
};

const API_BASE_URL = "https://qrfd5s2xt9.execute-api.us-east-1.amazonaws.com";

const notificationsApi = axios.create({
	baseURL: API_BASE_URL,
});

class NotificationsServiceImpl implements NotificationsService {
	private mapNotifications(notifications: NotificationDto[]): NotificationData[] {
		return notifications.map((notification) => ({
			...notification,
			timestamp: new Date(notification.timestamp),
		}));
	}

	private mapActions(actions: ActionDto[]): ActionData[] {
		return [...actions]
			.map((action) => ({
				...action,
				timestamp: new Date(action.timestamp),
			}))
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	}

	async getNotificationsPatient(patientId: string, signal?: AbortSignal): Promise<NotificationData[]> {
		if (!patientId) {
			return [];
		}

		const response = await notificationsApi.get<NotificationDto[]>(`/notifications/patient/${patientId}`, {
			signal,
		});

		return this.mapNotifications(response.data ?? []);
	}

	async getNotificationsDoctor(doctorId: string, signal?: AbortSignal): Promise<NotificationData[]> {
		if (!doctorId) {
			return [];
		}

		const response = await notificationsApi.get<NotificationDto[]>(`/notifications/doctor/${doctorId}`, {
			signal,
		});

		return this.mapNotifications(response.data ?? []);
	}

	async getNotificationHistoryByNotificationId(notificationId: string, signal?: AbortSignal): Promise<ActionData[]> {
		if (!notificationId) {
			return [];
		}

		const response = await notificationsApi.get<ActionDto[]>(`/notifications/history/${notificationId}`, {
			signal,
		});

		return this.mapActions(response.data ?? []);
	}

	async getPatientByPatientId(patientId: string, signal?: AbortSignal): Promise<PatientData | null> {
		if (!patientId) {
			return null;
		}

		try {
			const response = await notificationsApi.get<PatientData>(`/patient/${patientId}`, {
				signal,
			});

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}

			throw error;
		}
	}

	async getPatientByNotificationId(notificationId: string, signal?: AbortSignal): Promise<PatientData | null> {
		if (!notificationId) {
			return null;
		}

		try {
			const response = await notificationsApi.get<PatientData>(`/patient/notifications/${notificationId}`, {
				signal,
			});

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}

			throw error;
		}
	}

	async addActionToNotification(notificationId: string, action: ActionData, signal?: AbortSignal): Promise<void> {
		if (!notificationId) {
			throw new Error("notificationId is required");
		}

		await notificationsApi.post(
			`/notifications/history/${notificationId}`,
			{
				...action,
				timestamp: action.timestamp.toISOString(),
			},
			signal ? { signal } : undefined,
		);
	}
}

export const notificationsService = new NotificationsServiceImpl();

export default NotificationsServiceImpl;
