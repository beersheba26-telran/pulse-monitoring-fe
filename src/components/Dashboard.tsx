import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import ActionPopover from "./ActionPopover";
import type { ActionOption, NotificationData } from "../model/dashboard_types";
import { useNotificationsPolling } from "../services/useNotificationsPolling";
import { notificationsService } from "../services/NotificationsServiceImpl";
import type { AuthResponse } from "../model/auth_types";
import { toNotificationPresentation } from "../services/NotificationsDataProcessing";

type DashboardProps = {
  userId: AuthResponse["userId"];
  role: AuthResponse["role"];
};

const Dashboard = ({ userId, role }: DashboardProps) => {
  const { data, isLoading, isError, error, isFetching } = useNotificationsPolling({
    pollIntervalMs: 5000,
    doctorId: role === "doctor" ? userId : undefined,
    patientId: role === "patient" ? userId : undefined,
  });
  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);

  const addActionMutation = useMutation({
    mutationFn: async ({ action, report }: { action: ActionOption; report: string }) => {
      if (!selectedNotification) {
        throw new Error("No selected notification");
      }

      await notificationsService.addActionToNotification(selectedNotification.id, {
        action,
        timestamp: new Date(),
        report,
        doctor_id: userId,
      });
    },
  });

  const patientQuery = useQuery({
    queryKey: ["patient", selectedPatientId],
    queryFn: ({ signal }) => notificationsService.getPatientByPatientId(selectedPatientId!, signal),
    enabled: Boolean(isPatientPopoverOpen && selectedPatientId),
    retry: 1,
  });

  const patientIds = useMemo(
    () => Array.from(new Set((data ?? []).map((notification) => notification.patientId))),
    [data],
  );

  const patientNameQueries = useQueries({
    queries: patientIds.map((patientId) => ({
      queryKey: ["patient-name", patientId],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        notificationsService.getPatientByPatientId(patientId, signal),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    })),
  });

  const patientNameById = useMemo(
    () => {
      const map = new Map<string, string>();

      patientNameQueries.forEach((query, index) => {
        const patient = query.data;
        if (patient) {
          map.set(patientIds[index], patient.name);
        }
      });

      return map;
    },
    [patientIds, patientNameQueries],
  );

  const loadingPatientIds = useMemo(
    () =>
      new Set(
        patientIds.filter((_, index) => {
          const query = patientNameQueries[index];
          return query?.isLoading || query?.isFetching;
        }),
      ),
    [patientIds, patientNameQueries],
  );

  const notificationRows = useMemo(
    () =>
      (data ?? []).map((notification) => {
        const patientName = patientNameById.get(notification.patientId)
          ?? (loadingPatientIds.has(notification.patientId) ? "Loading..." : "Unknown patient");

        return toNotificationPresentation(notification, patientName);
      }),
    [data, loadingPatientIds, patientNameById],
  );

  useEffect(() => {
    if (!isPatientPopoverOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsPatientPopoverOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPatientPopoverOpen]);

  const handleOpenPatientPopover = (notification: NotificationData) => {
    setSelectedPatientId(notification.patientId);
    setSelectedNotification(notification);
    setIsPatientPopoverOpen(true);
  };

  const handlePatientPopoverOpenChange = (open: boolean) => {
    setIsPatientPopoverOpen(open);

    if (!open) {
      setSelectedPatientId(null);
      setSelectedNotification(null);
    }
  };

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" gap="3">
        <Spinner />
        <Text>Loading notifications...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex minH="50vh" align="center" justify="center">
        <Text color="red.500">Failed to load notifications: {error.message}</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="1100px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "5", md: "8" }}>
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap="3" mb="4" direction={{ base: "column", md: "row" }}>
        <Heading size="lg">Notifications ({role}: {userId})</Heading>
        <Text color="gray.500" fontSize="sm">
          {isFetching ? "Refreshing..." : "Up to date"}
        </Text>
      </Flex>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table.Root size="sm" variant="outline" tableLayout="fixed" width="100%">
          <Table.ColumnGroup>
            <Table.Column htmlWidth="16%" />
            <Table.Column htmlWidth="11%" />
            <Table.Column htmlWidth="14%" />
            <Table.Column htmlWidth="16%" />
            <Table.Column htmlWidth="18%" />
            <Table.Column htmlWidth="25%" />
          </Table.ColumnGroup>

          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Severity</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Patient name</Table.ColumnHeader>
              <Table.ColumnHeader>Date/time</Table.ColumnHeader>
              <Table.ColumnHeader>Message</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
        </Table.Root>

        <Box maxH="420px" overflowY="auto" overflowX="hidden" css={{ scrollbarGutter: "stable" }}>
          <Table.Root size="sm" variant="outline" tableLayout="fixed" width="100%">
            <Table.ColumnGroup>
              <Table.Column htmlWidth="16%" />
              <Table.Column htmlWidth="11%" />
              <Table.Column htmlWidth="14%" />
              <Table.Column htmlWidth="16%" />
              <Table.Column htmlWidth="18%" />
              <Table.Column htmlWidth="25%" />
            </Table.ColumnGroup>
          <Table.Body>
            {notificationRows.map((notificationRow) => {
              return (
                <Table.Row
                  key={notificationRow.id}
                  bg={notificationRow.severityPresentation.rowBg}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    handleOpenPatientPopover(notificationRow.raw);
                  }}
                  cursor="context-menu"
                >
                  <Table.Cell whiteSpace="nowrap">{notificationRow.type}</Table.Cell>
                  <Table.Cell>
                    <Badge bg={notificationRow.severityPresentation.badgeBg} color={notificationRow.severityPresentation.badgeText} px="2" py="1" borderRadius="md">
                      {notificationRow.severityText}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{notificationRow.statusText}</Table.Cell>
                  <Table.Cell>{notificationRow.patientName}</Table.Cell>
                  <Table.Cell>{notificationRow.formattedTimestamp}</Table.Cell>
                  <Table.Cell>{notificationRow.message}</Table.Cell>
                </Table.Row>
              );
            })}

            {(!data || data.length === 0) && (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  No notifications found for this user.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <ActionPopover
        open={isPatientPopoverOpen}
        onOpenChange={handlePatientPopoverOpenChange}
        patient={patientQuery.data ?? null}
        isLoading={patientQuery.isLoading}
        errorMessage={patientQuery.isError ? (patientQuery.error as Error).message : undefined}
        selectedNotification={selectedNotification}
        onConfirm={async (action, report) => {
          await addActionMutation.mutateAsync({ action, report });
          handlePatientPopoverOpenChange(false);
        }}
        isSubmitting={addActionMutation.isPending}
        submitErrorMessage={addActionMutation.isError ? addActionMutation.error.message : undefined}
      />
    </Box>
  );
};

export default Dashboard;
