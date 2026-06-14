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

import { useColorModeValue } from './ui/color-mode'
import type { NotificationData, PatientData } from '../model/dashboard_types'
import { toNotificationPresentation } from '../services/NotificationsDataProcessing'

type PatientPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientData | null
  selectedNotification: NotificationData | null
  isLoading?: boolean
  errorMessage?: string
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
  const selectedNotificationPresentation = selectedNotification
    ? toNotificationPresentation(selectedNotification, patient?.name ?? 'Unknown patient')
    : null
  const dialogBg = useColorModeValue('white', 'gray.800')
  const dialogBorder = useColorModeValue('gray.200', 'gray.700')
  const bodyText = useColorModeValue('gray.800', 'gray.100')
  const mutedText = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.600', 'gray.300')
  const valueColor = useColorModeValue('gray.900', 'gray.100')
  const patientCardBg = useColorModeValue('gray.50', 'gray.700')
  const infoCardBg = useColorModeValue('gray.50', 'gray.700')

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
          <Dialog.Content zIndex={1500} boxShadow="2xl" borderWidth="1px" borderColor={dialogBorder} bg={dialogBg} color={bodyText}>
            <Dialog.Body>
              {isLoading && <Text>Loading patient data...</Text>}

              {!isLoading && errorMessage && (
                <Text color="red.400">{errorMessage}</Text>
              )}

              {!isLoading && !errorMessage && !patient && (
                <Text color={mutedText}>Patient details were not found.</Text>
              )}

              {!isLoading && !errorMessage && patient && (
                <Box borderWidth="1px" borderRadius="lg" p="4" bg={patientCardBg} boxShadow="lg" borderColor={dialogBorder}>
                  <Flex justify="space-between" align="center" mb="3" gap="2">
                    <Text fontSize="lg" fontWeight="bold" color={bodyText}>
                      {patient.name}
                    </Text>
                    <Badge colorPalette="blue">ID: {patient.id}</Badge>
                  </Flex>

                  <Separator mb="3" />

                  <Flex direction={{ base: 'column', lg: 'row' }} gap="3" align="stretch">
                    {selectedNotification && (
                      <Box borderWidth="1px" borderRadius="md" p="3" bg={infoCardBg} flex="1" minW="0" boxShadow="md" borderColor={dialogBorder}>
                        <Text fontWeight="bold" color={bodyText} mb="2">
                          Selected notification
                        </Text>
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="2">
                          <Box>
                            <Text {...fieldLabelStyles} color={labelColor}>Type</Text>
                            <Text {...fieldValueStyles} color={valueColor}>{selectedNotificationPresentation?.type}</Text>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles} color={labelColor}>Severity</Text>
                            <Badge bg={selectedNotificationPresentation?.severityPresentation.badgeBg} color={selectedNotificationPresentation?.severityPresentation.badgeText} px="2" py="1" borderRadius="md">
                              {selectedNotificationPresentation?.severityText}
                            </Badge>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles} color={labelColor}>Status</Text>
                            <Text {...fieldValueStyles} color={valueColor}>{selectedNotificationPresentation?.statusText}</Text>
                          </Box>
                          <Box>
                            <Text {...fieldLabelStyles} color={labelColor}>Date/time</Text>
                            <Text {...fieldValueStyles} color={valueColor}>{selectedNotificationPresentation?.formattedTimestamp}</Text>
                          </Box>
                        </SimpleGrid>
                        <Box mt="2">
                          <Text {...fieldLabelStyles} color={labelColor}>Message</Text>
                          <Text color={valueColor} fontSize="sm">
                            {selectedNotificationPresentation?.message}
                          </Text>
                        </Box>
                      </Box>
                    )}

                    <Box borderWidth="1px" borderRadius="md" p="3" bg={infoCardBg} flex="1" minW="0" boxShadow="md" borderColor={dialogBorder}>
                      <Text fontWeight="bold" color={bodyText} mb="2">
                        Patient data
                      </Text>

                      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                        <Box>
                          <Text {...fieldLabelStyles} color={labelColor}>Age</Text>
                          <Text {...fieldValueStyles} color={valueColor}>{patient.age} years</Text>
                        </Box>

                        <Box>
                          <Text {...fieldLabelStyles} color={labelColor}>Weight</Text>
                          <Text {...fieldValueStyles} color={valueColor}>{patient.weight} kg</Text>
                        </Box>

                        <Box>
                          <Text {...fieldLabelStyles} color={labelColor}>Height</Text>
                          <Text {...fieldValueStyles} color={valueColor}>{patient.height} cm</Text>
                        </Box>
                      </SimpleGrid>

                      <Box mt="3">
                        <Text {...fieldLabelStyles} color={labelColor}>Last heart-rate values</Text>
                        <Flex wrap="wrap" gap="2" mt="1">
                          {heartRateValues.length > 0 ? (
                            heartRateValues.map((value, index) => (
                              <Badge key={`${value}-${index}`} colorPalette="green" variant="subtle">
                                {value} bpm
                              </Badge>
                            ))
                          ) : (
                            <Text color={mutedText}>No heart-rate samples available.</Text>
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
