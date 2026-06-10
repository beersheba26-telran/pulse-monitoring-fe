import axios from "axios";

import type { NotificationData, PatientData } from "../model/dashboard_types";
import type NotificationsService from "./NotificationsService";

type NotificationDto = Omit<NotificationData, "timestamp"> & {
	timestamp: string;
};

type DoctorDto = {
	id: string;
	patient_ids: string[];
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

	async getNotificationsPatient(patientId: string, signal?: AbortSignal): Promise<NotificationData[]> {
		if (!patientId) {
			return [];
		}

		const response = await notificationsApi.get<NotificationDto[]>("/notifications", {
			params: {
				patientId,
				_sort: "-timestamp",
			},
			signal,
		});

		return this.mapNotifications(response.data);
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

		const notificationsResponse = await notificationsApi.get<NotificationDto[]>("/notifications", {
			params: {
				_sort: "-timestamp",
			},
			signal,
		});

		const filteredNotifications = notificationsResponse.data.filter((notification) =>
			doctorPatientIds.has(notification.patientId),
		);

		return this.mapNotifications(filteredNotifications);
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
