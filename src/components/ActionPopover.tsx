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
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { actionOptions, type ActionOption, type NotificationData, type PatientData } from "../model/dashboard_types";
import { toNotificationPresentation } from "../services/NotificationsDataProcessing";

type ActionPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientData | null;
  selectedNotification: NotificationData | null;
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
  isLoading = false,
  errorMessage,
  onConfirm,
  isSubmitting = false,
  submitErrorMessage,
}: ActionPopoverProps) => {
  const [selectedAction, setSelectedAction] = useState<ActionOption>(actionOptions[0]);
  const [report, setReport] = useState("");

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedNotification) {
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
          <Dialog.Content zIndex={1500} boxShadow="2xl" borderWidth="1px" borderColor="blackAlpha.200">
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

                    <Field.Root mt="4" required>
                      <Field.Label>Select action</Field.Label>
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

                    <Field.Root mt="3" required>
                      <Field.Label>Report / reason</Field.Label>
                      <Input
                        placeholder="Type report or reason"
                        value={report}
                        onChange={(event) => setReport(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </Field.Root>

                    {submitErrorMessage && (
                      <Text color="red.500" mt="3">{submitErrorMessage}</Text>
                    )}
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
                  Cancel
                </Button>
                <Button
                  size="sm"
                  colorPalette="blue"
                  type="submit"
                  loading={isSubmitting}
                  disabled={!selectedNotification || isLoading || !!errorMessage || !report.trim()}
                >
                  OK
                </Button>
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
