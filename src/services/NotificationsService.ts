import type { NotificationData } from "../model/dashboard_types";

export default interface NotificationsService {
    getNotifications(signal?: AbortSignal): Promise<NotificationData[]>;
}

export type NotificationsPollingOptions = {
    pollIntervalMs?: number;
};