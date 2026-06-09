import { useQuery } from "@tanstack/react-query";

import type { NotificationData } from "../model/dashboard_types";
import type { NotificationsPollingOptions } from "./NotificationsService";
import { notificationsService } from "./NotificationsServiceImpl";

export const notificationsQueryKey = ["notifications"] as const;

export const DEFAULT_NOTIFICATIONS_POLL_INTERVAL_MS = 5000;

export function useNotificationsPolling(options?: NotificationsPollingOptions) {
    const pollIntervalMs =
        options?.pollIntervalMs ?? DEFAULT_NOTIFICATIONS_POLL_INTERVAL_MS;

    return useQuery<NotificationData[]>({
        queryKey: notificationsQueryKey,
        queryFn: ({ signal }) => notificationsService.getNotifications(signal),
        refetchInterval: pollIntervalMs,
        staleTime: Math.floor(pollIntervalMs * 0.8),
        gcTime: 5 * 60 * 1000,
        retry: 1,
    });
}
