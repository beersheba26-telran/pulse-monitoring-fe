import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Separator,
  Text,
} from '@chakra-ui/react'

import type { PatientData } from '../model/dashboard_types'

type PatientPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientData | null
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
  isLoading = false,
  errorMessage,
}: PatientPopoverProps) => {
  const heartRateValues = patient?.lastHeartRateValues ?? []

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="center"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Patient details</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {isLoading && <Text>Loading patient data...</Text>}

              {!isLoading && errorMessage && (
                <Text color="red.500">{errorMessage}</Text>
              )}

              {!isLoading && !errorMessage && !patient && (
                <Text color="gray.600">Patient details were not found.</Text>
              )}

              {!isLoading && !errorMessage && patient && (
                <Box borderWidth="1px" borderRadius="lg" p="4" bg="gray.50">
                  <Flex justify="space-between" align="center" mb="3" gap="2">
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {patient.name}
                    </Text>
                    <Badge colorPalette="blue">ID: {patient.id}</Badge>
                  </Flex>

                  <Separator mb="3" />

                  <Flex direction="column" gap="3">
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

                    <Box>
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
                  </Flex>
                </Box>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Close</Button>
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
