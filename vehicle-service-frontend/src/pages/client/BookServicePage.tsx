// src/pages/dashboard/BookServicePage.tsx
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
} from "@mui/material";
import { useState } from "react";

const steps = ['Select Vehicle', 'Select Service', 'Choose Date', 'Confirm Booking'];

const mockVehicles = [
  { id: 1, make: "Toyota", model: "Axio", plate: "KDA 123A" },
  { id: 2, make: "Mazda", model: "Demio", plate: "KDB 456B" },
];

const availableServices = [
  "Oil Change",
  "Brake Inspection",
  "Engine Diagnostics",
  "Tire Rotation",
  "Battery Replacement",
];

const BookServicePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleVehicleSelect = (id: number) => {
    setSelectedVehicle(id);
    setActiveStep(1);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setActiveStep(2);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleBookingConfirm = () => {
    if (selectedVehicle && selectedService && selectedDate) {
      setActiveStep(3);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Book a Service
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {activeStep === 0 && (
          <>
            <Typography variant="h6" mb={2}>Step 1: Choose a Vehicle</Typography>
            <List>
              {mockVehicles.map((vehicle) => (
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
          </>
        )}

        {activeStep === 1 && (
          <>
            <Typography variant="h6" mb={2}>Step 2: Choose a Service</Typography>
            <List>
              {availableServices.map((service) => (
                <div key={service}>
                  <ListItemButton onClick={() => handleServiceSelect(service)}>
                    <Radio
                      checked={selectedService === service}
                      value={service}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={service} />
                  </ListItemButton>
                  <Divider />
                </div>
              ))}
            </List>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="h6" mb={2}>Step 3: Select a Preferred Date</Typography>
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleBookingConfirm}
              disabled={!selectedDate}
            >
              Confirm Booking
            </Button>
          </>
        )}

        {activeStep === 3 && (
          <>
            <Typography variant="h6" mb={2}>🎉 Booking Confirmed!</Typography>
            <Typography>
              You've booked <strong>{selectedService}</strong> for vehicle ID <strong>{selectedVehicle}</strong> on <strong>{selectedDate}</strong>.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BookServicePage;
