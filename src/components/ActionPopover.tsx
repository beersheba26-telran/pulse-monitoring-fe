import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Field,
  Input,
  NativeSelect,
  Portal,
  Separator,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { actionOptions, type ActionOption, type NotificationData, type PatientData } from "../model/dashboard_types";
import { toNotificationPresentation } from "../services/NotificationsDataProcessing";
import { notificationsService } from "../services/NotificationsServiceImpl";

type ActionPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientData | null;
  selectedNotification: NotificationData | null;
  canPerformActions?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  onConfirm: (action: ActionOption, report: string) => Promise<void>;
  isSubmitting?: boolean;
  submitErrorMessage?: string;
};

const fieldLabelStyles = {
  color: "gray.600",
  fontSize: "sm",
  fontWeight: "medium",
};

const fieldValueStyles = {
  color: "gray.900",
  fontWeight: "semibold",
};

const ActionPopover = ({
  open,
  onOpenChange,
  patient,
  selectedNotification,
  canPerformActions = true,
  isLoading = false,
  errorMessage,
  onConfirm,
  isSubmitting = false,
  submitErrorMessage,
}: ActionPopoverProps) => {
  const [selectedAction, setSelectedAction] = useState<ActionOption>(actionOptions[0]);
  const [report, setReport] = useState("");

  const notificationHistoryQuery = useQuery({
    queryKey: ["notification-history", selectedNotification?.id],
    queryFn: ({ signal }) => notificationsService.getNotificationHistoryByNotificationId(selectedNotification!.id, signal),
    enabled: Boolean(open && selectedNotification),
    retry: 1,
  });

  const doctorIds = useMemo(
    () => Array.from(new Set((notificationHistoryQuery.data ?? []).map((action) => action.doctor_id).filter(Boolean))),
    [notificationHistoryQuery.data],
  );

  const doctorQueries = useQueries({
    queries: doctorIds.map((doctorId) => ({
      queryKey: ["doctor", doctorId],
      queryFn: ({ signal }: { signal: AbortSignal }) => notificationsService.getDoctorByDoctorId(doctorId, signal),
      enabled: Boolean(open && selectedNotification),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    })),
  });

  useEffect(() => {
    if (open) {
      setSelectedAction(actionOptions[0]);
      setReport("");
    }
  }, [open]);

  const heartRateValues = patient?.lastHeartRateValues ?? [];
  const selectedNotificationPresentation = selectedNotification
    ? toNotificationPresentation(selectedNotification, patient?.name ?? "Unknown patient")
    : null;

  const doctorNameById = useMemo(() => {
    const map = new Map<string, string>();

    doctorQueries.forEach((query, index) => {
      const doctor = query.data;
      if (doctor) {
        map.set(doctorIds[index], doctor.name);
      }
    });

    return map;
  }, [doctorIds, doctorQueries]);

  const actionHistoryRows = useMemo(
    () =>
      (notificationHistoryQuery.data ?? []).map((action) => ({
        ...action,
        doctorName: doctorNameById.get(action.doctor_id) ?? `Doctor ${action.doctor_id}`,
        localTimestamp: action.timestamp.toLocaleString(),
      })),
    [doctorNameById, notificationHistoryQuery.data],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedNotification || !canPerformActions) {
      return;
    }

    await onConfirm(selectedAction, report.trim());
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="center"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <Dialog.Positioner>
          <Dialog.Content
            zIndex={1500}
            boxShadow="2xl"
            borderWidth="1px"
            borderColor="blackAlpha.200"
            width="95vw"
            maxW="1300px"
          >
            <form onSubmit={handleSubmit}>
              <Dialog.Body>
                {isLoading && <Text>Loading patient data...</Text>}

                {!isLoading && errorMessage && (
                  <Text color="red.500">{errorMessage}</Text>
                )}

                {!isLoading && !errorMessage && !patient && (
                  <Text color="gray.600">Patient details were not found.</Text>
                )}

                {!isLoading && !errorMessage && patient && (
                  <Box borderWidth="1px" borderRadius="lg" p="4" bg="gray.50" boxShadow="lg">
                    <Flex justify="space-between" align="center" mb="3" gap="2">
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        {patient.name}
                      </Text>
                      <Badge colorPalette="blue">ID: {patient.id}</Badge>
                    </Flex>

                    <Separator mb="3" />

                    <Flex direction={{ base: "column", lg: "row" }} gap="3" align="stretch">
                      {selectedNotification && (
                        <Box borderWidth="1px" borderRadius="md" p="3" bg={selectedNotificationPresentation?.severityPresentation.rowBg} flex="1" minW="0" boxShadow="md">
                          <Text fontWeight="bold" color="gray.800" mb="2">
                            Selected notification
                          </Text>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2">
                            <Box>
                              <Text {...fieldLabelStyles}>Type</Text>
                              <Text {...fieldValueStyles}>{selectedNotificationPresentation?.type}</Text>
                            </Box>
                            <Box>
                              <Text {...fieldLabelStyles}>Severity</Text>
                              <Badge bg={selectedNotificationPresentation?.severityPresentation.badgeBg} color={selectedNotificationPresentation?.severityPresentation.badgeText} px="2" py="1" borderRadius="md">
                                {selectedNotificationPresentation?.severityText}
                              </Badge>
                            </Box>
                            <Box>
                              <Text {...fieldLabelStyles}>Status</Text>
                              <Text {...fieldValueStyles}>{selectedNotificationPresentation?.statusText}</Text>
                            </Box>
                            <Box>
                              <Text {...fieldLabelStyles}>Date/time</Text>
                              <Text {...fieldValueStyles}>{selectedNotificationPresentation?.formattedTimestamp}</Text>
                            </Box>
                          </SimpleGrid>
                          <Box mt="2">
                            <Text {...fieldLabelStyles}>Message</Text>
                            <Text color="gray.700" fontSize="sm">
                              {selectedNotificationPresentation?.message}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      <Box borderWidth="1px" borderRadius="md" p="3" bg="white" flex="1" minW="0" boxShadow="md">
                        <Text fontWeight="bold" color="gray.800" mb="2">
                          Patient data
                        </Text>

                        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                          <Box>
                            <Text {...fieldLabelStyles}>Age</Text>
                            <Text {...fieldValueStyles}>{patient.age} years</Text>
                          </Box>

                          <Box>
                            <Text {...fieldLabelStyles}>Weight</Text>
                            <Text {...fieldValueStyles}>{patient.weight} kg</Text>
                          </Box>

                          <Box>
                            <Text {...fieldLabelStyles}>Height</Text>
                            <Text {...fieldValueStyles}>{patient.height} cm</Text>
                          </Box>
                        </SimpleGrid>

                        <Box mt="3">
                          <Text {...fieldLabelStyles}>Last heart-rate values</Text>
                          <Flex wrap="wrap" gap="2" mt="1">
                            {heartRateValues.length > 0 ? (
                              heartRateValues.map((value, index) => (
                                <Badge key={`${value}-${index}`} colorPalette="green" variant="subtle">
                                  {value} bpm
                                </Badge>
                              ))
                            ) : (
                              <Text color="gray.600">No heart-rate samples available.</Text>
                            )}
                          </Flex>
                        </Box>
                      </Box>
                    </Flex>

                    <Flex mt="4" gap="3" direction={{ base: "column", lg: "row" }} align="stretch">
                      <Box borderWidth="1px" borderRadius="md" p="3" bg="gray.50" boxShadow="md" flex="2" minW="0">
                        <Text fontWeight="bold" color="gray.800" mb="2" textAlign="center">
                          Existing actions for this notification
                        </Text>

                        {notificationHistoryQuery.isLoading && (
                          <Text color="gray.600">Loading action history...</Text>
                        )}

                        {notificationHistoryQuery.isError && (
                          <Text color="red.500">Failed to load action history.</Text>
                        )}

                        {!notificationHistoryQuery.isLoading && !notificationHistoryQuery.isError && actionHistoryRows.length === 0 && (
                          <Text color="gray.600">No actions recorded yet.</Text>
                        )}

                        {!notificationHistoryQuery.isLoading && !notificationHistoryQuery.isError && actionHistoryRows.length > 0 && (
                          <Box borderWidth="1px" borderRadius="md" overflowX="auto" bg="white">
                            <Table.Root size="sm" variant="line" tableLayout="fixed" minW="760px">
                              <Table.ColumnGroup>
                                <Table.Column htmlWidth="36%" />
                                <Table.Column htmlWidth="24%" />
                                <Table.Column htmlWidth="40%" />
                              </Table.ColumnGroup>
                              <Table.Header>
                                <Table.Row>
                                  <Table.ColumnHeader>Date/time (local)</Table.ColumnHeader>
                                  <Table.ColumnHeader>Action</Table.ColumnHeader>
                                  <Table.ColumnHeader>Doctor</Table.ColumnHeader>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {actionHistoryRows.map((action) => (
                                  <Table.Row key={`${action.action}-${action.timestamp.toISOString()}-${action.doctor_id}`}>
                                    <Table.Cell>
                                      <Text {...fieldValueStyles} whiteSpace="nowrap">{action.localTimestamp}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                      <Badge colorPalette="blue" variant="subtle">{action.action}</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                      <Text {...fieldValueStyles}>{action.doctorName}</Text>
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        )}
                      </Box>

                      {canPerformActions && (
                        <Box borderWidth="1px" borderRadius="md" p="3" bg="white" boxShadow="md" flex="1" minW="320px" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                          <Flex direction="column" gap="3" align="center" width="100%">
                            <Field.Root required width="100%" maxW="360px">
                              <Field.Label justifyContent="center" textAlign="center">Select action</Field.Label>
                              <NativeSelect.Root disabled={isSubmitting}>
                                <NativeSelect.Field
                                  value={selectedAction}
                                  onChange={(event) => setSelectedAction(event.target.value as ActionOption)}
                                >
                                  {actionOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                              </NativeSelect.Root>
                            </Field.Root>

                            <Field.Root required width="100%" maxW="360px">
                              <Field.Label justifyContent="center" textAlign="center">Report / reason</Field.Label>
                              <Input
                                placeholder="Type report or reason"
                                value={report}
                                onChange={(event) => setReport(event.target.value)}
                                disabled={isSubmitting}
                              />
                            </Field.Root>
                          </Flex>

                          {submitErrorMessage && (
                            <Text color="red.500" mt="3" textAlign="center">{submitErrorMessage}</Text>
                          )}
                        </Box>
                      )}
                    </Flex>
                  </Box>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {canPerformActions ? "Cancel" : "Close"}
                </Button>
                {canPerformActions && (
                  <Button
                    size="sm"
                    colorPalette="blue"
                    type="submit"
                    loading={isSubmitting}
                    disabled={!selectedNotification || isLoading || !!errorMessage || !report.trim()}
                  >
                    OK
                  </Button>
                )}
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ActionPopover;
