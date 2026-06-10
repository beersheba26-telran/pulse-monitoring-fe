import axios from "axios";

import type { ActionData, DoctorData, NotificationData, PatientData } from "../model/dashboard_types";
import type NotificationsService from "./NotificationsService";

type NotificationDto = Omit<NotificationData, "timestamp"> & {
	timestamp: string;
};

type DoctorDto = {
	id: string;
	name: string;
	patient_ids: string[];
};

type ActionDto = Omit<ActionData, "timestamp"> & {
	timestamp: string;
};

type NotificationHistoryDto = {
	id: string;
	notificationId: string;
	actions: ActionDto[];
};

const API_BASE_URL =  "http://localhost:3001";

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

	private sortNotificationsByTimestampDesc(notifications: NotificationData[]): NotificationData[] {
		return [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	}

	async getNotificationsPatient(patientId: string, signal?: AbortSignal): Promise<NotificationData[]> {
		if (!patientId) {
			return [];
		}

		const response = await notificationsApi.get<NotificationDto[]>("/notifications", { signal });

		const filteredNotifications = response.data.filter(
			(notification) => notification.patientId === patientId,
		);

		return this.sortNotificationsByTimestampDesc(this.mapNotifications(filteredNotifications));
	}

	async getNotificationsDoctor(doctorId: string, signal?: AbortSignal): Promise<NotificationData[]> {
		if (!doctorId) {
			return [];
		}

		let doctor: DoctorDto;
		try {
			const doctorResponse = await notificationsApi.get<DoctorDto>(`/doctors/${doctorId}`, {
				signal,
			});
			doctor = doctorResponse.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return [];
			}

			throw error;
		}

		const doctorPatientIds = new Set(doctor.patient_ids ?? []);
		if (doctorPatientIds.size === 0) {
			return [];
		}

		const notificationsResponse = await notificationsApi.get<NotificationDto[]>("/notifications", { signal });

		const filteredNotifications = notificationsResponse.data.filter((notification) =>
			doctorPatientIds.has(notification.patientId),
		);

		return this.sortNotificationsByTimestampDesc(this.mapNotifications(filteredNotifications));
	}

	async getNotificationHistoryByNotificationId(notificationId: string, signal?: AbortSignal): Promise<ActionData[]> {
		if (!notificationId) {
			return [];
		}

		const historyResponse = await notificationsApi.get<NotificationHistoryDto[]>("/notification_history", { signal });
		const notificationHistory = historyResponse.data.find((history) => history.notificationId === notificationId);

		if (!notificationHistory) {
			return [];
		}

		return [...(notificationHistory.actions ?? [])]
			.map((action) => ({
				...action,
				timestamp: new Date(action.timestamp),
			}))
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	}

	async getDoctorByDoctorId(doctorId: string, signal?: AbortSignal): Promise<DoctorData | null> {
		if (!doctorId) {
			return null;
		}

		try {
			const response = await notificationsApi.get<DoctorDto>(`/doctors/${doctorId}`, {
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

	async getPatientByPatientId(patientId: string, signal?: AbortSignal): Promise<PatientData | null> {
		

		try {
			const response = await notificationsApi.get<PatientData>(`/patients/${patientId}`, {
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
		

		try {
			const notificationResponse = await notificationsApi.get<NotificationDto>(`/notifications/${notificationId}`, {
				signal,
			});

			return this.getPatientByPatientId(notificationResponse.data.patientId, signal);
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

		const notificationStatus = action.action;
		const actionToPersist: ActionDto = {
			...action,
			timestamp: action.timestamp.toISOString(),
		};

		await notificationsApi.patch(
			`/notifications/${notificationId}`,
			{
				status: notificationStatus,
			},
			signal ? { signal } : undefined,
		);

		const historyResponse = await notificationsApi.get<NotificationHistoryDto[]>("/notification_history", { signal });

		const existingHistory = historyResponse.data.find((history) => history.notificationId === notificationId);
		if (!existingHistory) {
			await notificationsApi.post(
				"/notification_history",
				{
					notificationId,
					actions: [actionToPersist],
				},
				{ signal },
			);
			return;
		}

		await notificationsApi.patch(
			`/notification_history/${existingHistory.id}`,
			{
				actions: [...(existingHistory.actions ?? []), actionToPersist],
			},
			{ signal },
		);
	}
}

export const notificationsService = new NotificationsServiceImpl();

export default NotificationsServiceImpl;
