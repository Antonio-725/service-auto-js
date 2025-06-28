import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import AuthFormContainer from "../components/auth/AuthFormContainer";
import { verifyOtp } from "../utils/apiClient";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      setError("User ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP must be a 6-digit number.");
      setIsLoading(false);
      return;
    }

    try {
      await verifyOtp(otp, userId);

      if (role === "mechanic") {
        sessionStorage.setItem("role", "mechanic_verified");
        navigate("/mechanic");
      } else {
        sessionStorage.setItem("role", "client");
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer title="OTP Verification">
      <form onSubmit={handleVerify} noValidate>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit OTP sent to your phone or email.
          </Typography>
          <TextField
            label="OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            required
            inputProps={{ maxLength: 6 }}
            autoFocus
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
          </Button>
        </Stack>
      </form>
    </AuthFormContainer>
  );
};

export default Otp;