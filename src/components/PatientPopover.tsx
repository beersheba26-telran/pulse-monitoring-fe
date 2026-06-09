import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Separator,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'

import type { NotificationData, PatientData } from '../model/dashboard_types'

type PatientPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientData | null
  selectedNotification: NotificationData | null
  isLoading?: boolean
  errorMessage?: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  MINOR: { bg: 'yellow.300', text: 'black' },
  MAJOR: { bg: 'orange.800', text: 'white' },
  CRITICAL: { bg: 'red.500', text: 'white' },
}

const ROW_COLORS: Record<string, string> = {
  MINOR: 'yellow.50',
  MAJOR: 'orange.100',
  CRITICAL: 'red.100',
}

const fieldLabelStyles = {
  color: 'gray.600',
  fontSize: 'sm',
  fontWeight: 'medium',
}

const fieldValueStyles = {
  color: 'gray.900',
  fontWeight: 'semibold',
}

const PatientPopover = ({
  open,
  onOpenChange,
  patient,
  selectedNotification,
  isLoading = false,
  errorMessage,
}: PatientPopoverProps) => {
  const heartRateValues = patient?.lastHeartRateValues ?? []
  const selectedSeverityValue = (selectedNotification?.severity || 'UNKNOWN').toUpperCase()
  const selectedStatusValue = (selectedNotification?.status || 'UNKNOWN').toUpperCase()
  const selectedStatusColor = STATUS_COLORS[selectedSeverityValue] ?? { bg: 'gray.200', text: 'black' }
  const selectedRowColor = ROW_COLORS[selectedSeverityValue] ?? 'gray.50'
  const selectedNotificationTimestamp = selectedNotification
    ? new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(selectedNotification.timestamp)
    : null

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

                  <Flex direction={{ base: 'column', lg: 'row' }} gap="3" align="stretch">
                    {selectedNotification && (
                      <Box borderWidth="1px" borderRadius="md" p="3" bg={selectedRowColor} flex="1" minW="0" boxShadow="md">
                        <Text fontWeight="bold" color="gray.800" mb="2">
                          Selected notification
                        </Text>
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2">
                          <Box>
                            <Text {...fieldLabelStyles}>Type</Text>
                            <Text {...fieldValueStyles}>{selectedNotification.type}</Text>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles}>Severity</Text>
                            <Badge bg={selectedStatusColor.bg} color={selectedStatusColor.text} px="2" py="1" borderRadius="md">
                              {selectedSeverityValue}
                            </Badge>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles}>Status</Text>
                            <Text {...fieldValueStyles}>{selectedStatusValue}</Text>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles}>Date/time</Text>
                            <Text {...fieldValueStyles}>{selectedNotificationTimestamp}</Text>
                          </Box>
                        </SimpleGrid>
                        <Box mt="2">
                          <Text {...fieldLabelStyles}>Message</Text>
                          <Text color="gray.700" fontSize="sm">
                            {selectedNotification.message}
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
                </Box>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button size="sm" variant="outline">Close</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default PatientPopover
