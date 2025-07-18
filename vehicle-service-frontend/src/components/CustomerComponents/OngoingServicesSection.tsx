
import { Box, Paper, Card, CardContent, Typography, Avatar, Button, Chip, Divider } from "@mui/material";
import { HourglassEmpty, CalendarToday } from "@mui/icons-material";
import Loading from "../../components/usables/Loading";
import { Fade } from "@mui/material";
import type { ChipProps } from "@mui/material/Chip"; // Import ChipProps for color type

interface Mechanic {
  id: string;
  username: string;
}

interface Service {
  id: string;
  description: string;
  mechanicId: string | null;
  vehicleId: string;
  status: "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating?: number;
  mechanic?: Mechanic | null;
  invoiceId?: string;
}

interface OngoingServicesSectionProps {
  currentServices: Service[];
  loading: boolean;
  getVehicleInfo: (vehicleId: string) => string;
  getStatusColor: (status: string) => ChipProps["color"]; // Use ChipProps["color"] type
  formatDate: (dateString: string) => string;
}

const OngoingServicesSection = ({
  currentServices,
  loading,
  getVehicleInfo,
  getStatusColor,
  formatDate,
}: OngoingServicesSectionProps) => {
  return (
    <Fade in timeout={900}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: "#f59e0b", mr: 2 }}>
            <HourglassEmpty />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#2a3e78">
            Ongoing Services
          </Typography>
        </Box>
        {loading ? (
          <Loading message="Fetching services..." />
        ) : currentServices.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No ongoing services. Request a service for your vehicle.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {currentServices.map((service) => (
              <Card
                key={service.id}
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {service.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getVehicleInfo(service.vehicleId)}
                      </Typography>
                      {service.mechanic && (
                        <Typography variant="body2" color="text.secondary">
                          Mechanic: {service.mechanic.username || "Unassigned"}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={service.status}
                      color={getStatusColor(service.status)}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <CalendarToday color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Scheduled: {formatDate(service.date)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "none",
                        bgcolor: "#2a3e78",
                        "&:hover": { bgcolor: "#1e2a5a" },
                      }}
                    >
                      Track Service
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default OngoingServicesSection;
