
import { useState } from "react";

import "./App.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import type { AuthResponse } from "./model/auth_types";

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthResponse | null>(null);

  if (!authenticatedUser) {
    return <Login onLoginSuccess={setAuthenticatedUser} />;
  }

  return <Dashboard userId={authenticatedUser.userId} role={authenticatedUser.role} />;
}

export default App;
