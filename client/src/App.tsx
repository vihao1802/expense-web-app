import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import Main from "./components/Main";
import theme from "./theme";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  p: { xs: 1, sm: 3 },
                }}
              >
                <Toaster position="top-center" />
                <Routes>
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Main />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/sign-in" replace />}
                  />
                </Routes>
              </Box>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </CookiesProvider>
  );
};

export default App;
