
import "./App.css";
import { Box, Flex } from "@chakra-ui/react";
import ApplicationBar from "./components/ApplicationBar";
import Dashboard from "./components/Dashboard.tsx";
import Login from "./components/Login";
import { useAuthStore } from "./store/authStore";

function App() {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  const clearAuthenticatedUser = useAuthStore((state) => state.clearAuthenticatedUser);

  if (!authenticatedUser) {
    return <Login />;
  }

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <ApplicationBar
        userName={authenticatedUser.userId}
        role={authenticatedUser.role}
        onLogout={clearAuthenticatedUser}
      />
      <Box flex="1" minH="0" overflow="hidden">
        <Dashboard userId={authenticatedUser.userId} role={authenticatedUser.role} />
      </Box>
    </Flex>
  );
}

export default App;
