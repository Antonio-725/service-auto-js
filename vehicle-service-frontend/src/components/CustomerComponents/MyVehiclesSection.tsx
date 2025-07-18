
import { Box, Paper, Card, CardContent, Typography, Avatar, IconButton, Button } from "@mui/material";
import { DirectionsCar, Build, Receipt, MoreVert } from "@mui/icons-material";
import Loading from "../../components/usables/Loading";
import { Fade } from "@mui/material";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

interface MyVehiclesSectionProps {
  vehicles: Vehicle[];
  loading: boolean;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, vehicleId: string) => void;
  handleRequestService: (vehicleId: string) => void;
  handleViewVehicleDetails: (vehicleId: string) => void;
}

const MyVehiclesSection = ({
  vehicles,
  loading,
  handleMenuOpen,
  handleRequestService,
  handleViewVehicleDetails,
}: MyVehiclesSectionProps) => {
  return (
    <Fade in timeout={700}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: "#2a3e78", mr: 2 }}>
            <DirectionsCar />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#2a3e78">
            My Vehicles
          </Typography>
        </Box>
        {loading ? (
          <Loading message="Fetching vehicles..." />
        ) : vehicles.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No vehicles added yet. Add your first vehicle to get started.
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
            {vehicles.map((v) => (
              <Card
                key={v.id}
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
                      <Typography variant="h6" color="#2a3e78">
                        {v.make} {v.model}
                      </Typography>
                    </Box>
                    <IconButton onClick={(e) => handleMenuOpen(e, v.id)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Box mt={2} display="flex" justifyContent="space-between" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Build />}
                      onClick={() => handleRequestService(v.id)}
                      sx={{
                        textTransform: "none",
                        borderColor: "#2a3e78",
                        color: "#2a3e78",
                        "&:hover": { bgcolor: "#e8eaf6" },
                      }}
                    >
                      Request Service
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Receipt />}
                      onClick={() => handleViewVehicleDetails(v.id)}
                      sx={{
                        textTransform: "none",
                        borderColor: "#2a3e78",
                        color: "#2a3e78",
                        "&:hover": { bgcolor: "#e8eaf6" },
                      }}
                    >
                      View Details
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

export default MyVehiclesSection;
