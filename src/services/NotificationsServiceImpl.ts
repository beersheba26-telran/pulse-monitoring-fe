import axios from "axios";

import type { NotificationData } from "../model/dashboard_types";
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
				_sort: "timestamp",
				_order: "desc",
			},
			signal,
		});

		return response.data.map((notification) => ({
			...notification,
			timestamp: new Date(notification.timestamp),
		}));
	}
}

export const notificationsService = new NotificationsServiceImpl();

export default NotificationsServiceImpl;
