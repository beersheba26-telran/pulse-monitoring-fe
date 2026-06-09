import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";

import { useNotificationsPolling } from "../services/useNotificationsPolling";

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

const Dashboard = () => {
  const { data, isLoading, isError, error, isFetching } = useNotificationsPolling({
    pollIntervalMs: 5000,
  });

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
        <Heading size="lg">Notifications</Heading>
        <Text color="gray.500" fontSize="sm">
          {isFetching ? "Refreshing..." : "Up to date"}
        </Text>
      </Flex>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table.Root size="sm" variant="outline" tableLayout="fixed" width="100%">
          <Table.ColumnGroup>
            <Table.Column htmlWidth="13%" />
            <Table.Column htmlWidth="14%" />
            <Table.Column htmlWidth="14%" />
            <Table.Column htmlWidth="22%" />
            <Table.Column htmlWidth="37%" />
          </Table.ColumnGroup>

          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Severity</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Date/time</Table.ColumnHeader>
              <Table.ColumnHeader>Message</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
        </Table.Root>

        <Box maxH="420px" overflowY="auto" overflowX="hidden" css={{ scrollbarGutter: "stable" }}>
          <Table.Root size="sm" variant="outline" tableLayout="fixed" width="100%">
            <Table.ColumnGroup>
              <Table.Column htmlWidth="13%" />
              <Table.Column htmlWidth="14%" />
              <Table.Column htmlWidth="14%" />
              <Table.Column htmlWidth="22%" />
              <Table.Column htmlWidth="37%" />
            </Table.ColumnGroup>
          <Table.Body>
            {data?.map((notification) => {
              const severityValue = (notification.severity || "UNKNOWN").toUpperCase();
              const statusValue = (notification.status || "UNKNOWN").toUpperCase();
              const statusColor = STATUS_COLORS[severityValue] ?? { bg: "gray.200", text: "black" };
              const rowColor = ROW_COLORS[severityValue] ?? "transparent";

              return (
                <Table.Row key={notification.id} bg={rowColor}>
                  <Table.Cell>{notification.type}</Table.Cell>
                  <Table.Cell>
                    <Badge bg={statusColor.bg} color={statusColor.text} px="2" py="1" borderRadius="md">
                      {severityValue}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{statusValue}</Table.Cell>
                  <Table.Cell>{formatDateTime(notification.timestamp)}</Table.Cell>
                  <Table.Cell>{notification.message}</Table.Cell>
                </Table.Row>
              );
            })}

            {(!data || data.length === 0) && (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  No notifications found. Ensure mock API is running on http://localhost:3001.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
