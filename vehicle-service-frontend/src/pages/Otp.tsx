import { useState } from "react";
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

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      if (otp === "123456") {
        localStorage.setItem("role", "client"); // Upgrade role
        navigate("/"); // ✅ Changed to root route
      } else {
        setError("Invalid OTP. Please try again.");
      }
      setIsLoading(false);
    }, 1000);
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
            onChange={(e) => setOtp(e.target.value)}
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