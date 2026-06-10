import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import PatientPopover from "./PatientPopover";
import type { NotificationData } from "../model/dashboard_types";
import { useNotificationsPolling } from "../services/useNotificationsPolling";
import { notificationsService } from "../services/NotificationsServiceImpl";
import type { AuthResponse } from "../model/auth_types";

type DashboardProps = {
  userId: AuthResponse["userId"];
  role: AuthResponse["role"];
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  MINOR: { bg: "yellow.300", text: "black" },
  MAJOR: { bg: "orange.800", text: "white" },
  CRITICAL: { bg: "red.500", text: "white" },
};

const ROW_COLORS: Record<string, string> = {
  MINOR: "yellow.50",
  MAJOR: "orange.100",
  CRITICAL: "red.100",
};

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

const Dashboard = ({ userId, role }: DashboardProps) => {
  const { data, isLoading, isError, error, isFetching } = useNotificationsPolling({
    pollIntervalMs: 5000,
    doctorId: role === "doctor" ? userId : undefined,
    patientId: role === "patient" ? userId : undefined,
  });
  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);

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

  useEffect(() => {
    if (!isPatientPopoverOpen) {
      return;
    }

    const handleKeyDown = () => {
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
            {data?.map((notification) => {
              const severityValue = (notification.severity || "UNKNOWN").toUpperCase();
              const statusValue = (notification.status || "UNKNOWN").toUpperCase();
              const statusColor = STATUS_COLORS[severityValue] ?? { bg: "gray.200", text: "black" };
              const rowColor = ROW_COLORS[severityValue] ?? "transparent";
              const patientName = patientNameById.get(notification.patientId)
                ?? (loadingPatientIds.has(notification.patientId) ? "Loading..." : "Unknown patient");

              return (
                <Table.Row
                  key={notification.id}
                  bg={rowColor}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    handleOpenPatientPopover(notification);
                  }}
                  cursor="context-menu"
                >
                  <Table.Cell whiteSpace="nowrap">{notification.type}</Table.Cell>
                  <Table.Cell>
                    <Badge bg={statusColor.bg} color={statusColor.text} px="2" py="1" borderRadius="md">
                      {severityValue}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{statusValue}</Table.Cell>
                  <Table.Cell>{patientName}</Table.Cell>
                  <Table.Cell>{formatDateTime(notification.timestamp)}</Table.Cell>
                  <Table.Cell>{notification.message}</Table.Cell>
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

      <PatientPopover
        open={isPatientPopoverOpen}
        onOpenChange={handlePatientPopoverOpenChange}
        patient={patientQuery.data ?? null}
        isLoading={patientQuery.isLoading}
        errorMessage={patientQuery.isError ? (patientQuery.error as Error).message : undefined}
        selectedNotification={selectedNotification}
      />
    </Box>
  );
};

export default Dashboard;
