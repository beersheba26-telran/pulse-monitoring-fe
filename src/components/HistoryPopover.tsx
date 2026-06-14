import {
  Badge,
  Box,
  Button,
  Dialog,
  Portal,
  Table,
  Text,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useColorModeValue } from "./ui/color-mode";
import { notificationsService } from "../services/NotificationsServiceImpl";

type HistoryPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationId: string | null;
};

const fieldValueStyles = {
  color: "gray.900",
  fontWeight: "semibold",
};

const HistoryPopover = ({ open, onOpenChange, notificationId }: HistoryPopoverProps) => {
  const notificationHistoryQuery = useQuery({
    queryKey: ["notification-history", notificationId],
    queryFn: ({ signal }) => notificationsService.getNotificationHistoryByNotificationId(notificationId!, signal),
    enabled: Boolean(open && notificationId),
    retry: 1,
  });
  const dialogBg = useColorModeValue('white', 'gray.800')
  const dialogBorder = useColorModeValue('gray.200', 'gray.700')
  const bodyText = useColorModeValue('gray.800', 'gray.100')
  const mutedText = useColorModeValue('gray.600', 'gray.300')
  const valueColor = useColorModeValue('gray.900', 'gray.100')
  const tableBg = useColorModeValue('white', 'gray.700')

  const historyRows = useMemo(
    () =>
      (notificationHistoryQuery.data ?? []).map((action) => ({
        ...action,
        doctorName: action.doctor_name || "Unknown doctor",
        localTimestamp: action.timestamp.toLocaleString(),
        reportText: action.report?.trim() || "No reason provided.",
      })),
    [notificationHistoryQuery.data],
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="center"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            zIndex={1500}
            boxShadow="2xl"
            borderWidth="1px"
            borderColor={dialogBorder}
            bg={dialogBg}
            color={bodyText}
            width="95vw"
            maxW="1100px"
          >
            <Dialog.Body>
              <Box borderWidth="1px" borderRadius="md" p="3" bg={tableBg} boxShadow="md" borderColor={dialogBorder}>
                <Text fontWeight="bold" color={bodyText} mb="2" textAlign="center">
                  Notification history
                </Text>

                {!notificationId && (
                  <Text color={mutedText}>No notification selected.</Text>
                )}

                {notificationId && notificationHistoryQuery.isLoading && (
                  <Text color={mutedText}>Loading action history...</Text>
                )}

                {notificationId && notificationHistoryQuery.isError && (
                  <Text color="red.400">Failed to load action history.</Text>
                )}

                {notificationId && !notificationHistoryQuery.isLoading && !notificationHistoryQuery.isError && historyRows.length === 0 && (
                  <Text color={mutedText}>No actions recorded yet.</Text>
                )}

                {notificationId && !notificationHistoryQuery.isLoading && !notificationHistoryQuery.isError && historyRows.length > 0 && (
                  <Box borderWidth="1px" borderRadius="md" overflowX="auto" bg={tableBg} borderColor={dialogBorder}>
                    <Table.Root size="sm" variant="line" tableLayout="fixed" minW="900px">
                      <Table.ColumnGroup>
                        <Table.Column htmlWidth="24%" />
                        <Table.Column htmlWidth="16%" />
                        <Table.Column htmlWidth="22%" />
                        <Table.Column htmlWidth="38%" />
                      </Table.ColumnGroup>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Date/time (local)</Table.ColumnHeader>
                          <Table.ColumnHeader>Action</Table.ColumnHeader>
                          <Table.ColumnHeader>Doctor</Table.ColumnHeader>
                          <Table.ColumnHeader>Reason</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {historyRows.map((action) => (
                          <Table.Row key={`${action.action}-${action.timestamp.toISOString()}-${action.doctor_name}`}>
                            <Table.Cell>
                              <Text {...fieldValueStyles} color={valueColor} whiteSpace="nowrap">{action.localTimestamp}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette="blue" variant="subtle">
                                {action.action}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Text {...fieldValueStyles} color={valueColor}>{action.doctorName}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text color={valueColor} fontSize="sm">{action.reportText}</Text>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </Box>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default HistoryPopover;
