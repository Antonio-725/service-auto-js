import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Avatar,
  IconButton,
  Container,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Tooltip,
  Rating,
  Fade,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Build,
  HourglassEmpty,
  MoreVert,
  DirectionsCar,
  Edit,
  Delete,
  Receipt,
  Star,
  ExitToApp as ExitToAppIcon,
  CheckCircle,
  CalendarToday,
} from "@mui/icons-material";
import apiClient from "../../utils/apiClient";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

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
}

const ServicesPage = () => {
  const navigate = useNavigate();

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentServices, setCurrentServices] = useState<Service[]>([]);
  const [serviceHistory, setServiceHistory] = useState<Service[]>([]);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [vehicleData, setVehicleData] = useState({ make: "", model: "", year: "", plate: "" });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState({
    vehicles: false,
    currentServices: false,
    serviceHistory: false,
    rating: false,
  });
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [selectedServiceToRate, setSelectedServiceToRate] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState({
    id: "",
    make: "",
    model: "",
    year: "",
    plate: "",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const username = sessionStorage.getItem("username") || "User";

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        // Fetch vehicles
        setLoading((prev) => ({ ...prev, vehicles: true }));
        const vehiclesRes = await apiClient.get("/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(vehiclesRes.data);

        // Fetch current services
        setLoading((prev) => ({ ...prev, currentServices: true }));
        const currentRes = await apiClient.get("/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentServices(currentRes.data.filter((s: Service) => s.status === "In Progress"));

        // Fetch service history
        setLoading((prev) => ({ ...prev, serviceHistory: true }));
        const historyRes = await apiClient.get("/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServiceHistory(historyRes.data.filter((s: Service) => s.status !== "In Progress"));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading({
          vehicles: false,
          currentServices: false,
          serviceHistory: false,
          rating: false,
        });
      }
    };
    fetchData();
  }, [token, userId, navigate]);

  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vehicleId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handleAddVehicle = async () => {
    try {
      const res = await apiClient.post("/api/vehicles", vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prev) => [...prev, res.data]);
      setVehicleData({ make: "", model: "", year: "", plate: "" });
      setOpenVehicleDialog(false);
    } catch (error: any) {
      console.error("Add vehicle error:", error.message);
    }
  };

  const handleDeleteVehicle = async () => {
    if (selectedVehicle && token) {
      try {
        await apiClient.delete(`/api/vehicles/${selectedVehicle}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle));
      } catch (error) {
        console.error("Delete vehicle error:", error);
      }
      handleMenuClose();
    }
  };

  const handleEditVehicle = async () => {
    try {
      const res = await apiClient.put(`/api/vehicles/${editVehicleData.id}`, editVehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prev) => prev.map((v) => (v.id === editVehicleData.id ? res.data : v)));
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Edit vehicle error:", error);
    }
  };

  const handleRequestService = (vehicleId: string) => {
    navigate(`/book-service?vehicleId=${vehicleId}`);
  };

  const handleRateService = async () => {
    if (selectedServiceToRate && ratingValue !== null && token) {
      try {
        setLoading((prev) => ({ ...prev, rating: true }));
        setRatingError(null);
        setRatingSuccess(null);
        const payload = {
          rating: ratingValue,
          comment: ratingComment.trim() || undefined, // Include comment if provided
        };
        await apiClient.patch(
          `/api/services/${selectedServiceToRate}/rate`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setServiceHistory((prev) =>
          prev.map((service) =>
            service.id === selectedServiceToRate
              ? { ...service, rating: ratingValue }
              : service
          )
        );
        setRatingSuccess("Rating submitted successfully!");
        setTimeout(() => {
          setOpenRatingDialog(false);
          setSelectedServiceToRate(null);
          setRatingValue(null);
          setRatingComment("");
          setRatingSuccess(null);
        }, 1500); // Close dialog after 1.5s to show success
      } catch (error: any) {
        console.error("Error rating service:", error);
        setRatingError(error.response?.data?.message || "Failed to submit rating. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, rating: false }));
      }
    }
  };

  const handleOpenRatingDialog = (serviceId: string) => {
    setSelectedServiceToRate(serviceId);
    setRatingValue(null);
    setRatingComment("");
    setRatingError(null);
    setRatingSuccess(null);
    setOpenRatingDialog(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    navigate("/login");
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleViewVehicleDetails = async (vehicleId: string) => {
    try {
      const res = await apiClient.get(`/api/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedVehicleDetails(res.data);
      setOpenDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f7", minHeight: "100vh" }}>
      {/* App Bar */}
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
            AutoCare Hub
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, color: "#2a3e78" }}>
              Welcome, {username}!
            </Typography>
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={500}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" fontWeight="bold" color="#2a3e78">
                My Dashboard
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenVehicleDialog(true)}
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                  bgcolor: "#2a3e78",
                  "&:hover": { bgcolor: "#1e2a5a" },
                }}
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
                  sx={{
                    textTransform: "none",
                    px: 3,
                    bgcolor: "#2a3e78",
                    "&:hover": { bgcolor: "#1e2a5a" },
                  }}
                >
                  Add Vehicle
                </Button>
              </DialogActions>
            </Dialog>

            {/* Rate Service Dialog */}
            <Dialog open={openRatingDialog} onClose={() => setOpenRatingDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Rate This Service
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    How would you rate this service?
                  </Typography>
                  <Rating
                    value={ratingValue}
                    onChange={(event, newValue) => setRatingValue(newValue)}
                    size="large"
                    precision={1}
                    sx={{ color: "#f59e0b" }}
                  />
                  <TextField
                    label="Optional Comment"
                    fullWidth
                    multiline
                    rows={3}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    margin="normal"
                    helperText="Share your feedback about the service (optional)"
                  />
                  {ratingError && (
                    <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
                      {ratingError}
                    </Alert>
                  )}
                  {ratingSuccess && (
                    <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
                      {ratingSuccess}
                    </Alert>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={() => setOpenRatingDialog(false)}
                  sx={{ textTransform: "none" }}
                  disabled={loading.rating}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRateService}
                  disabled={ratingValue === null || loading.rating}
                  sx={{
                    textTransform: "none",
                    px: 3,
                    bgcolor: "#2a3e78",
                    "&:hover": { bgcolor: "#1e2a5a" },
                  }}
                >
                  {loading.rating ? <CircularProgress size={24} color="inherit" /> : "Submit Rating"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* View Vehicle Details Dialog */}
            <Dialog
              open={openDetailsDialog}
              onClose={() => setOpenDetailsDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Vehicle Details
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                {selectedVehicleDetails ? (
                  <Box>
                    <Typography><strong>Make:</strong> {selectedVehicleDetails.make}</Typography>
                    <Typography><strong>Model:</strong> {selectedVehicleDetails.model}</Typography>
                    <Typography><strong>Year:</strong> {selectedVehicleDetails.year}</Typography>
                    <Typography><strong>Plate:</strong> {selectedVehicleDetails.plate}</Typography>
                  </Box>
                ) : (
                  <Typography>No details found.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
              </DialogActions>
            </Dialog>

            {/* Edit Vehicle Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Edit Vehicle
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Make"
                      fullWidth
                      margin="normal"
                      value={editVehicleData.make}
                      onChange={(e) => setEditVehicleData({ ...editVehicleData, make: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Model"
                      fullWidth
                      margin="normal"
                      value={editVehicleData.model}
                      onChange={(e) => setEditVehicleData({ ...editVehicleData, model: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Year"
                      fullWidth
                      margin="normal"
                      type="number"
                      value={editVehicleData.year}
                      onChange={(e) => setEditVehicleData({ ...editVehicleData, year: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Plate Number"
                      fullWidth
                      margin="normal"
                      value={editVehicleData.plate}
                      onChange={(e) => setEditVehicleData({ ...editVehicleData, plate: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setOpenEditDialog(false)} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEditVehicle}
                  disabled={!editVehicleData.make || !editVehicleData.model || !editVehicleData.year || !editVehicleData.plate}
                  sx={{
                    textTransform: "none",
                    px: 3,
                    bgcolor: "#2a3e78",
                    "&:hover": { bgcolor: "#1e2a5a" },
                  }}
                >
                  Save Changes
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
                {loading.vehicles ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
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
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>

            {/* Ongoing Services Section */}
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
                {loading.currentServices ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
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
                                <Typography variant="h6" fontWeight="bold">
                                  {service.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {getVehicleInfo(service.vehicleId)}
                                </Typography>
                                {service.mechanic && (
                                  <Typography variant="body2" color="text.secondary">
                                    Mechanic: {service.mechanic.username || 'Unassigned'}
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
                                  Scheduled: {new Date(service.date).toLocaleDateString()}
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
                {loading.serviceHistory ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : serviceHistory.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No service history available yet.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {serviceHistory.map((service) => (
                      <Grid item xs={12} key={service.id}>
                        <Card sx={{ borderRadius: 3 }}>
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
                                    Serviced by: {service.mechanic.username || 'Unassigned'}
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
                                  Date: {new Date(service.date).toLocaleDateString()}
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
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Fade>

            {/* Vehicle Context Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => selectedVehicle && handleViewVehicleDetails(selectedVehicle)}>
                <ListItemIcon>
                  <Receipt fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (selectedVehicle) {
                    const vehicleToEdit = vehicles.find((v) => v.id === selectedVehicle);
                    if (vehicleToEdit) {
                      setEditVehicleData({
                        id: vehicleToEdit.id,
                        make: vehicleToEdit.make,
                        model: vehicleToEdit.model,
                        year: vehicleToEdit.year,
                        plate: vehicleToEdit.plate,
                      });
                      setOpenEditDialog(true);
                    }
                  }
                  handleMenuClose();
                }}
              >
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