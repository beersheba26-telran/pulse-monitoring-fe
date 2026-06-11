import { Alert, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack } from "@chakra-ui/react";
import { useState } from "react";

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
    <Flex minH="100vh" align="center" justify="center" px="4">
      <Box w="100%" maxW="420px" borderWidth="1px" borderRadius="lg" p="6" bg="white">
        <form onSubmit={handleSubmit}>
          <Stack gap="5">
            <Heading size="lg" textAlign="center">Login</Heading>

            {errorMessage && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>{errorMessage}</Alert.Title>
              </Alert.Root>
            )}

            <Field.Root required>
              <Field.Label>User ID</Field.Label>
              <Input
                value={formData.id}
                onChange={(event) => handleChange("id", event.target.value)}
                onFocus={clearError}
                placeholder="Enter your ID"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(event) => handleChange("password", event.target.value)}
                onFocus={clearError}
                placeholder="Enter your password"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Role</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.role}
                  onChange={(event) => handleChange("role", event.target.value as LoginData["role"])}
                  onFocus={clearError}
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