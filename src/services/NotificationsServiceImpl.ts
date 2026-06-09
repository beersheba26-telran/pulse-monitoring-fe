import axios from "axios";

import type { NotificationData, PatientData } from "../model/dashboard_types";
import type NotificationsService from "./NotificationsService";

type NotificationDto = Omit<NotificationData, "timestamp"> & {
	timestamp: string;
};

const API_BASE_URL =  "http://localhost:3001";

const notificationsApi = axios.create({
	baseURL: API_BASE_URL,
});

class NotificationsServiceImpl implements NotificationsService {
	async getNotifications(signal?: AbortSignal): Promise<NotificationData[]> {
		const response = await notificationsApi.get<NotificationDto[]>("/notifications", {
			params: {
				_sort: "-timestamp",
			},
			signal,
		});

		return response.data.map((notification) => ({
			...notification,
			timestamp: new Date(notification.timestamp),
		}));
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
}

export const notificationsService = new NotificationsServiceImpl();

export default NotificationsServiceImpl;
