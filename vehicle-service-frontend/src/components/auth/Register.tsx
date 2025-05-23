import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import AuthFormContainer from "./AuthFormContainer";
import apiClient from "../../utils/apiClient"; // Note: no curly braces
const Register = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // ⬅️ React Router hook

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePasswordStrength = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  // Input validation remains unchanged...
  
  try {
    const response = await apiClient.post("/api/users/register", {
      username,
      email,
      phone,
      password,
    });

    console.log("Registration successful:", response.data);
    navigate("/login");
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      "Registration failed. Please try again.";
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <AuthFormContainer title="Create Account">
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            required
            error={!!error && error.toLowerCase().includes("username")}
            autoComplete="username"
          />
          <TextField
            label="Phone Number"
            type="tel"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
            required
            error={!!error && error.toLowerCase().includes("phone")}
            autoComplete="tel"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            error={!!error && error.toLowerCase().includes("email")}
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error && error.toLowerCase().includes("password")}
            autoComplete="new-password"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={!!error && error.toLowerCase().includes("password")}
            autoComplete="new-password"
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
          </Button>
          <Typography variant="body2" align="center" sx={{ color: "#616161" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#3f51b5", fontWeight: 600 }}>
              Sign in here
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthFormContainer>
  );
};

export default Register;
