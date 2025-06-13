import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItemText,
  ListItemButton,
  Radio,
  Divider,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../utils/apiClient";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
}

const steps = ["Select Vehicle", "Select Service", "Choose Date", "Confirm Booking"];
const availableServices = [
  "Oil Change",
  "Brake Inspection",
  "Engine Diagnostics",
  "Tire Rotation",
  "Battery Replacement",
];

const BookServicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [customService, setCustomService] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!token || !userId) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const res = await apiClient.get("/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data);
        // Pre-select vehicle from query param if provided
        const vehicleId = searchParams.get("vehicleId");
        if (vehicleId && res.data.some((v: Vehicle) => v.id === vehicleId)) {
          setSelectedVehicle(vehicleId);
          setActiveStep(1);
        }
      } catch (err) {
        setError("Failed to fetch vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [token, userId, navigate, searchParams]);

  // Handlers
  const handleVehicleSelect = (id: string) => {
    setSelectedVehicle(id);
    setActiveStep(1);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setIsCustomService(false);
    setCustomService("");
    setActiveStep(2);
  };

  const handleCustomServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomService(e.target.value);
    setSelectedService(e.target.value);
    setIsCustomService(true);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleBookingConfirm = async () => {
    if (!selectedVehicle || !selectedService || !selectedDate || !token) {
      setError("Please complete all steps before confirming.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await apiClient.post(
        "/api/services",
        {
          vehicleId: selectedVehicle,
          description: selectedService,
          date: selectedDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setActiveStep(3);
    } catch (err: any) {
      setError("Failed to book service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box sx={{ maxWidth: "md", mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} color="#2a3e78">
        Book a Service
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {activeStep === 0 && (
          <>
            <Typography variant="h6" mb={2} fontWeight="bold" color="#2a3e78">
              Step 1: Choose a Vehicle
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : vehicles.length === 0 ? (
              <Typography color="text.secondary">
                No vehicles found. Please add a vehicle first.
              </Typography>
            ) : (
              <List>
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    <ListItemButton onClick={() => handleVehicleSelect(vehicle.id)}>
                      <Radio
                        checked={selectedVehicle === vehicle.id}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={`${vehicle.make} ${vehicle.model}`}
                        secondary={`Plate: ${vehicle.plate}`}
                      />
                    </ListItemButton>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mt: 2 }}>
                Back
              </Button>
            )}
          </>
        )}

        {activeStep === 1 && (
          <>
            <Typography variant="h6" mb={2} fontWeight="bold" color="#2a3e78">
              Step 2: Choose a Service
            </Typography>
            <RadioGroup
              value={isCustomService ? "custom" : selectedService}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  handleServiceSelect(e.target.value);
                } else {
                  setIsCustomService(true);
                  setSelectedService(customService);
                }
              }}
            >
              <List>
                {availableServices.map((service) => (
                  <div key={service}>
                    <ListItemButton onClick={() => handleServiceSelect(service)}>
                      <FormControlLabel
                        value={service}
                        control={<Radio tabIndex={-1} disableRipple />}
                        label={service}
                      />
                    </ListItemButton>
                    <Divider />
                  </div>
                ))}
                <ListItemButton>
                  <FormControlLabel
                    value="custom"
                    control={<Radio tabIndex={-1} disableRipple />}
                    label={
                      <TextField
                        label="Enter Custom Service"
                        fullWidth
                        value={customService}
                        onChange={handleCustomServiceChange}
                        disabled={!isCustomService}
                        sx={{ mt: 1 }}
                      />
                    }
                  />
                </ListItemButton>
              </List>
            </RadioGroup>
            <Box mt={2} display="flex" gap={2}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveStep(2)}
                disabled={!selectedService}
                sx={{ bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
              >
                Next
              </Button>
            </Box>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="h6" mb={2} fontWeight="bold" color="#2a3e78">
              Step 3: Select a Preferred Date
            </Typography>
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split("T")[0] }} // Prevent past dates
            />
            <Box display="flex" gap={2}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBookingConfirm}
                disabled={!selectedDate || loading}
                sx={{ bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
              >
                {loading ? <CircularProgress size={24} /> : "Confirm Booking"}
              </Button>
            </Box>
          </>
        )}

        {activeStep === 3 && (
          <>
            <Typography variant="h6" mb={2} fontWeight="bold" color="#2a3e78">
              🎉 Booking Submitted!
            </Typography>
            <Typography mb={2}>
              Your request for <strong>{selectedService}</strong> for{" "}
              <strong>
                {vehicles.find((v) => v.id === selectedVehicle)?.make}{" "}
                {vehicles.find((v) => v.id === selectedVehicle)?.model}
              </strong>{" "}
              on <strong>{new Date(selectedDate).toLocaleDateString()}</strong> has been submitted
              and is pending mechanic assignment.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
            >
              Back to Dashboard
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BookServicePage;