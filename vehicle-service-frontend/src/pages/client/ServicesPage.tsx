import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Grid, Card, CardContent, Chip, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions, Avatar, IconButton,
  Container, Menu, MenuItem, ListItemIcon, ListItemText, Toolbar, AppBar,
  Badge, Tooltip, Rating, Fade,
} from "@mui/material";
import {
  Add as AddIcon, Build, CheckCircle, HourglassEmpty, MoreVert, DirectionsCar,
  Edit, Delete, CalendarToday, Receipt, Star, Menu as MenuIcon, Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
//import { apiClient } from '../../utils/apiClient';
import apiClient from '../../utils/apiClient';
import { Vehicle, Service, ServiceHistory } from "../../types/index";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const ServicesPage = () => {
  const navigate = useNavigate();
  //const [vehicles, setVehicles] = useState([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [currentServices, setCurrentServices] = useState<Service[]>([]);
const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  //const [currentServices, setCurrentServices] = useState([]);
  //const [serviceHistory, setServiceHistory] = useState([]);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [vehicleData, setVehicleData] = useState({ make: "", model: "", year: "", plate: "" });
  const [ratingServiceId, setRatingServiceId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchData = async () => {
  setLoading(true);
  try {
    const [vehiclesRes, currentRes, historyRes] = await Promise.all([
      apiClient.get("/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      apiClient.get("/services/current", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      apiClient.get("/services/history", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setVehicles(vehiclesRes.data);
    setCurrentServices(currentRes.data);
    setServiceHistory(historyRes.data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
  setLoading(false);
};
    if (token && userId) fetchData();
  }, [token, userId]);

  const handleMenuOpen = (event, vehicleId) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

const handleAddVehicle = async () => {
  try {
    const res = await apiClient.post("/vehicles", vehicleData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setVehicles((prev) => [...prev, res.data]);
    setVehicleData({ make: "", model: "", year: "", plate: "" });
    setOpenVehicleDialog(false);
  } catch (error: any) {
    console.error("Add vehicle error:", error.message);
  }
};


  const handleDeleteVehicle = async () => {
    if (selectedVehicle) {
      try {
        await fetch(`/api/vehicles/${selectedVehicle}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(vehicles.filter((v) => v.id !== selectedVehicle));
      } catch (error) {
        console.error("Delete vehicle error:", error);
      }
      handleMenuClose();
    }
  };

  const handleRateService = async () => {
    if (ratingServiceId && ratingValue) {
      try {
        await fetch(`/api/services/${ratingServiceId}/rate`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating: ratingValue }),
        });
        setServiceHistory((prev) =>
          prev.map((s) => (s.id === ratingServiceId ? { ...s, rating: ratingValue } : s))
        );
        setOpenRatingDialog(false);
        setRatingServiceId(null);
        setRatingValue(0);
      } catch (error) {
        console.error("Rate service error:", error);
      }
    }
  };

  const handleOpenRatingDialog = (serviceId) => {
    setRatingServiceId(serviceId);
    setOpenRatingDialog(true);
  };

  const handleRequestService = (vehicleId) => {
    navigate(`/book-service?vehicleId=${vehicleId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Chart Data
  const serviceCounts = serviceHistory.reduce((acc, s) => {
    acc[s.service] = (acc[s.service] || 0) + 1;
    return acc;
  }, {});
  const chartData = {
    labels: Object.keys(serviceCounts),
    datasets: [{
      label: "Service Bookings",
      data: Object.values(serviceCounts),
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      borderColor: ["#1e3a8a", "#065f46", "#b45309", "#991b1b", "#5b21b6"],
      borderWidth: 1,
    }],
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f7", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: "none",
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "white",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#2a3e78" }}>
            Services
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, color: "#2a3e78" }}>
              Welcome, {username}!
            </Typography>
            <IconButton size="large" aria-label="notifications" color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ ml: 2 }}>
                <Avatar sx={{ bgcolor: "#2a3e78" }}>
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              sx={{ mt: "45px" }}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={500}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" fontWeight="bold" color="#2a3e78">
                My Services
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenVehicleDialog(true)}
                sx={{ borderRadius: 8, textTransform: "none", px: 3, bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
              >
                Add Vehicle
              </Button>
            </Box>

            {/* Add Vehicle Dialog */}
            <Dialog open={openVehicleDialog} onClose={() => setOpenVehicleDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Add a New Vehicle
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Make"
                      fullWidth
                      margin="normal"
                      value={vehicleData.make}
                      onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Model"
                      fullWidth
                      margin="normal"
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Year"
                      fullWidth
                      margin="normal"
                      type="number"
                      value={vehicleData.year}
                      onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Plate Number"
                      fullWidth
                      margin="normal"
                      value={vehicleData.plate}
                      onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setOpenVehicleDialog(false)} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddVehicle}
                  disabled={!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.plate}
                  sx={{ textTransform: "none", px: 3, bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
                >
                  Add Vehicle
                </Button>
              </DialogActions>
            </Dialog>

            {/* Rate Service Dialog */}
            <Dialog open={openRatingDialog} onClose={() => setOpenRatingDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Rate Service
              </DialogTitle>
              <DialogContent sx={{ pt: 3, textAlign: "center" }}>
                <Typography variant="body1" mb={2}>
                  How would you rate this service?
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(event, newValue) => setRatingValue(newValue)}
                  size="large"
                />
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setOpenRatingDialog(false)} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRateService}
                  disabled={!ratingValue}
                  sx={{ textTransform: "none", px: 3, bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
                >
                  Submit Rating
                </Button>
              </DialogActions>
            </Dialog>

            {/* My Vehicles Section */}
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
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      Loading...
                    </Typography>
                  </Box>
                ) : vehicles.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No vehicles added yet. Add your first vehicle to get started.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {vehicles.map((v) => (
                      <Grid item xs={12} sm={6} md={4} key={v.id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
                          }}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color="#2a3e78">
                                  {v.make} {v.model}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {v.year} • {v.plate}
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
                                sx={{ textTransform: "none", borderColor: "#2a3e78", color: "#2a3e78", "&:hover": { bgcolor: "#e8eaf6" } }}
                              >
                                Request Service
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Receipt />}
                                sx={{ textTransform: "none", borderColor: "#2a3e78", color: "#2a3e78", "&:hover": { bgcolor: "#e8eaf6" } }}
                              >
                                View History
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>

            {/* Current Services Section */}
            <Fade in timeout={900}>
              <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: "#f59e0b", mr: 2 }}>
                    <HourglassEmpty />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="#2a3e78">
                    Current Services
                  </Typography>
                </Box>
                {loading ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      Loading...
                    </Typography>
                  </Box>
                ) : currentServices.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No ongoing services. Request a service for your vehicle.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {currentServices.map((service) => (
                      <Grid item xs={12} key={service.id}>
                        <Card sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color="#2a3e78">
                                  {service.service}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {service.vehicle} • {service.mechanic}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<HourglassEmpty />}
                                label={service.status}
                                color="warning"
                                sx={{ fontWeight: "bold" }}
                              />
                            </Box>
                            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center">
                                <CalendarToday color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Scheduled: {service.date}
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ textTransform: "none", bgcolor: "#2a3e78", "&:hover": { bgcolor: "#1e2a5a" } }}
                              >
                                Track Service
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>

            {/* Service History Section */}
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
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      Loading...
                    </Typography>
                  </Box>
                ) : serviceHistory.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No service history available yet.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {serviceHistory.map((history) => (
                      <Grid item xs={12} key={history.id}>
                        <Card sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color="#2a3e78">
                                  {history.service}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {history.vehicle} • {history.mechanic}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<CheckCircle />}
                                label={history.status}
                                color="success"
                                sx={{ fontWeight: "bold" }}
                              />
                            </Box>
                            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center">
                                <CalendarToday color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Completed: {history.date}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                {history.rating ? (
                                  <Box display="flex" alignItems="center" mr={2}>
                                    <Star color="warning" sx={{ mr: 0.5 }} />
                                    <Typography>{history.rating}/5</Typography>
                                  </Box>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Star />}
                                    onClick={() => handleOpenRatingDialog(history.id)}
                                    sx={{ textTransform: "none", mr: 2, borderColor: "#2a3e78", color: "#2a3e78" }}
                                  >
                                    Rate Service
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Receipt />}
                                  sx={{ textTransform: "none", borderColor: "#2a3e78", color: "#2a3e78" }}
                                >
                                  View Invoice
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>

            {/* Service Trends Chart */}
            {serviceHistory.length > 0 && (
              <Fade in timeout={1300}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <Typography variant="h5" fontWeight="bold" color="#2a3e78" mb={3}>
                    Service Trends
                  </Typography>
                  <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    <Bar
                      data={chartData}
                      options={{
                        scales: {
                          y: { beginAtZero: true, title: { display: true, text: "Number of Bookings" } },
                          x: { title: { display: true, text: "Service Type" } },
                        },
                        plugins: {
                          legend: { display: false },
                          title: { display: true, text: "Service Booking Trends", font: { size: 16 } },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Fade>
            )}

            {/* Vehicle Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Vehicle</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteVehicle}>
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Vehicle</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ServicesPage;