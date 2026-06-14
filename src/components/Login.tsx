import { Alert, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { useColorModeValue } from "./ui/color-mode";

import type { LoginData } from "../model/auth_types";
import { authService } from "../services/AuthServiceImpl";
import { useAuthStore } from "../store/authStore";

const defaultFormData: LoginData = {
  id: "",
  password: "",
  role: "doctor",
};

const Login = () => {
  const [formData, setFormData] = useState<LoginData>(defaultFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const inputBg = useColorModeValue("white", "gray.900");
  const inputColor = useColorModeValue("gray.900", "gray.100");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");
  const alertBorder = useColorModeValue("red.200", "red.700");

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleChange = <K extends keyof LoginData>(field: K, value: LoginData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authService.login(formData);
      setAuthenticatedUser(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" px="4" bg={pageBg}>
      <Box w="100%" maxW="420px" borderWidth="1px" borderRadius="lg" borderColor={cardBorder} p="6" bg={cardBg} boxShadow="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="5">
            <Heading size="lg" textAlign="center" color={headingColor}>Login</Heading>

            {errorMessage && (
              <Alert.Root status="error" borderWidth="1px" borderColor={alertBorder} bg={useColorModeValue("red.50", "red.950")}>
                <Alert.Indicator />
                <Alert.Title>{errorMessage}</Alert.Title>
              </Alert.Root>
            )}

            <Field.Root required>
              <Field.Label color={labelColor}>User ID</Field.Label>
              <Input
                value={formData.id}
                onChange={(event) => handleChange("id", event.target.value)}
                onFocus={clearError}
                placeholder="Enter your ID"
                bg={inputBg}
                color={inputColor}
                borderColor={inputBorderColor}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label color={labelColor}>Password</Field.Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(event) => handleChange("password", event.target.value)}
                onFocus={clearError}
                placeholder="Enter your password"
                bg={inputBg}
                color={inputColor}
                borderColor={inputBorderColor}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label color={labelColor}>Role</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.role}
                  onChange={(event) => handleChange("role", event.target.value as LoginData["role"])}
                  onFocus={clearError}
                  style={{ background: inputBg, color: inputColor, borderColor: inputBorderColor }}
                >
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Button type="submit" colorPalette="blue" loading={isSubmitting}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;