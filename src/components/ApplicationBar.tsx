import { Flex, Heading, Menu, Portal } from "@chakra-ui/react";
import { LuHeartPulse } from "react-icons/lu";
import { ColorModeButton, useColorModeValue } from "./ui/color-mode";

type ApplicationBarProps = {
  userName: string;
  role: "doctor" | "patient";
  onLogout: () => void;
};

export default function ApplicationBar({ userName, role, onLogout }: ApplicationBarProps) {
  const authorizedUserLabel = role === "doctor" ? `Dr. ${userName}` : userName;
  const barBg = useColorModeValue(
    "linear-gradient(90deg, #f8fbff 0%, #eef6ff 45%, #e5f0ff 100%)",
    "linear-gradient(90deg, #111827 0%, #172033 45%, #1c2a45 100%)",
  );
  const barBorderColor = useColorModeValue("blue.100", "blue.900");

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px={6}
      py={1}
      minH="52px"
      borderBottomWidth="1px"
      borderColor={barBorderColor}
      bg={barBg}
      boxShadow="sm"
    >
      <Flex align="center" gap={2}>
        <LuHeartPulse size={24} color="red" />
        <Heading size="md">Pulse Monitor</Heading>
      </Flex>
      <Flex align="center" gap={4}>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Heading size="sm" cursor="pointer" userSelect="none">
              {authorizedUserLabel}
            </Heading>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="logout" onClick={onLogout}>
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        <ColorModeButton />
      </Flex>
    </Flex>
  );
}
