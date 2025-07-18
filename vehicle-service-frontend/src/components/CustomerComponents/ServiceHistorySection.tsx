import { Box, Paper, Card, CardContent, Typography, Avatar, Button, Chip, Divider } from "@mui/material";
import { CheckCircle, CalendarToday, Star, Receipt } from "@mui/icons-material";
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

interface ServiceHistorySectionProps {
  serviceHistory: Service[];
  loading: boolean;
  getVehicleInfo: (vehicleId: string) => string;
  getStatusColor: (status: string) => ChipProps["color"]; // Use ChipProps["color"] type
  formatDate: (dateString: string) => string;
  handleOpenRatingDialog: (serviceId: string) => void;
  handleViewInvoice: (invoiceId: string) => void;
}

const ServiceHistorySection = ({
  serviceHistory,
  loading,
  getVehicleInfo,
  getStatusColor,
  formatDate,
  handleOpenRatingDialog,
  handleViewInvoice,
}: ServiceHistorySectionProps) => {
  return (
    <Fade in timeout={1100}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: "#10b981", mr: 2 }}>
            <CheckCircle />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#2a3e78">
            Service History
          </Typography>
        </Box>
        {loading ? (
          <Loading message="Fetching service history..." />
        ) : serviceHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No service history available yet.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              "& > *": {
                flex: {
                  xs: "1 1 100%", // 1 column on xs
                  sm: "1 1 calc(50% - 24px)", // 2 columns on sm
                  md: "1 1 calc(33.33% - 24px)", // 3 columns on md
                },
              },
            }}
          >
            {serviceHistory.map((service) => (
              <Card
                key={service.id}
                sx={{
                  borderRadius: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
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
                          Serviced by: {service.mechanic.username || "Unassigned"}
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
                        Date: {formatDate(service.date)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {service.rating ? (
                        <Box display="flex" alignItems="center" mr={2}>
                          <Star color="warning" sx={{ mr: 0.5 }} />
                          <Typography>{service.rating}/5</Typography>
                        </Box>
                      ) : service.status === "Completed" ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Star />}
                          onClick={() => handleOpenRatingDialog(service.id)}
                          sx={{
                            textTransform: "none",
                            mr: 2,
                            borderColor: "#2a3e78",
                            color: "#2a3e78",
                            "&:hover": { bgcolor: "#e8eaf6" },
                          }}
                        >
                          Rate Service
                        </Button>
                      ) : null}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Receipt />}
                        onClick={() => service.invoiceId && handleViewInvoice(service.invoiceId)}
                        disabled={!service.invoiceId}
                        sx={{
                          textTransform: "none",
                          borderColor: "#2a3e78",
                          color: "#2a3e78",
                          "&:hover": { bgcolor: "#e8eaf6" },
                        }}
                      >
                        View Invoice
                      </Button>
                    </Box>
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

export default ServiceHistorySection;
