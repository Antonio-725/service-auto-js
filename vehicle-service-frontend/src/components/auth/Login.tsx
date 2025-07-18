
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import AuthFormContainer from "./AuthFormContainer";
import { login } from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { refreshAuthState } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await login(email, password);

      sessionStorage.setItem("token", res.token);
      sessionStorage.setItem("role", res.role);
      sessionStorage.setItem("userId", res.id);
      sessionStorage.setItem("username", res.username);

      refreshAuthState();

      switch (res.role) {
        case "admin":
          navigate("/admin");
          break;
        case "mechanic":
          navigate("/mechanic");
          break;
        case "client":
        case "user":
          navigate("/otp");
          break;
        default:
          setError("Unauthorized role");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Sign In">
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            error={!!error && error.includes("email")}
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error && error.includes("password")}
            autoComplete="current-password"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontWeight: 600,
              backgroundColor: "#3f51b5",
              "&:hover": { backgroundColor: "#303f9f" },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
          <Typography variant="body2" align="center" sx={{ color: "#616161" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#3f51b5", fontWeight: 600 }}>
              Register here
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthFormContainer>
  );
};

export default Login;