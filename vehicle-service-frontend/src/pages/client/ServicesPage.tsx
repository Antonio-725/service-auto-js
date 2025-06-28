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
  Snackbar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getServices,
  rateService,
  getInvoices,
} from "../../utils/apiClient";

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

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  sentAt?: string | null;
  items: InvoiceItem[];
  service?: {
    description: string;
    date: string;
  };
  vehicle?: {
    plate: string;
  };
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
    services: false,
    rating: false,
    invoice: false,
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
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
        setLoading((prev) => ({ ...prev, vehicles: true }));
        const vehiclesData = await getVehicles();
        setVehicles(vehiclesData);

        setLoading((prev) => ({ ...prev, services: true }));
        const servicesData = await getServices();
        setCurrentServices(servicesData.filter((s: Service) => s.status === "In Progress"));
        setServiceHistory(servicesData.filter((s: Service) => s.status !== "In Progress"));
      } catch (error: any) {
        console.error("Fetch error:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to load data. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading((prev) => ({ ...prev, vehicles: false, services: false }));
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
      const newVehicle = await addVehicle(vehicleData);
      setVehicles((prev) => [...prev, newVehicle]);
      setVehicleData({ make: "", model: "", year: "", plate: "" });
      setOpenVehicleDialog(false);
      setSnackbar({
        open: true,
        message: "Vehicle added successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Add vehicle error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to add vehicle. Please try again.",
        severity: "error",
      });
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteVehicle = async () => {
    if (selectedVehicle) {
      try {
        await deleteVehicle(selectedVehicle);
        setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle));
        setOpenDeleteDialog(false);
        setSnackbar({
          open: true,
          message: "Vehicle deleted successfully!",
          severity: "success",
        });
      } catch (error: any) {
        console.error("Delete vehicle error:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to delete vehicle. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleEditVehicle = async () => {
    try {
      const updatedVehicle = await updateVehicle(editVehicleData.id, editVehicleData);
      setVehicles((prev) => prev.map((v) => (v.id === editVehicleData.id ? updatedVehicle : v)));
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: "Vehicle updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Edit vehicle error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to edit vehicle. Please try again.",
        severity: "error",
      });
    }
  };

  const handleRequestService = (vehicleId: string) => {
    navigate(`/book-service?vehicleId=${vehicleId}`);
  };

  const handleRateService = async () => {
    if (selectedServiceToRate && ratingValue !== null) {
      try {
        setLoading((prev) => ({ ...prev, rating: true }));
        setRatingError(null);
        setRatingSuccess(null);
        const payload = {
          rating: ratingValue,
          comment: ratingComment.trim() || undefined,
        };
        await rateService(selectedServiceToRate, payload);
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
        }, 1500);
      } catch (error: any) {
        console.error("Error rating service:", error);
        setRatingError(error.message || "Failed to submit rating. Please try again.");
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

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      setLoading((prev) => ({ ...prev, invoice: true }));
      setInvoiceError(null);
      const invoices = await getInvoices();
      const invoice = invoices.find((inv: Invoice) => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setOpenInvoiceDialog(true);
      } else {
        setInvoiceError("Invoice not found.");
        setSnackbar({
          open: true,
          message: "Invoice not found.",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      setInvoiceError(error.message || "Failed to fetch invoice.");
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch invoice.",
        severity: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, invoice: false }));
    }
  };

  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false);
    setSelectedInvoice(null);
    setInvoiceError(null);
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
      const vehicle = await getVehicleById(vehicleId);
      setSelectedVehicleDetails(vehicle);
      setOpenDetailsDialog(true);
    } catch (error: any) {
      console.error("Error fetching vehicle details:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch vehicle details.",
        severity: "error",
      });
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "success";
      case "In Progress":
      case "Sent":
        return "info";
      case "Cancelled":
      case "Overdue":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (value: number | string | undefined): string => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f7", minHeight: "100vh" }}>
    
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
                    label="Comment (optional)"
                    multiline
                    rows={3}
                    fullWidth
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    sx={{ mt: 2 }}
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
                <Button onClick={() => setOpenDetailsDialog(false)} sx={{ textTransform: "none" }}>
                  Close
                </Button>
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

            {/* Delete Vehicle Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
                Confirm Delete
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Typography>
                  Are you sure you want to delete this vehicle? This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteVehicle}
                  sx={{ textTransform: "none", px: 3 }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            {/* Invoice Details Dialog */}
            <Dialog
              open={openInvoiceDialog}
              onClose={handleCloseInvoiceDialog}
              maxWidth="md"
              fullWidth
              sx={{
                "& .MuiDialog-paper": {
                  borderRadius: "1rem",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                  maxHeight: "85vh",
                  margin: "1rem",
                },
              }}
            >
              <Box sx={{ position: "relative", bgcolor: "#2a3e78", p: 2 }}>
                <DialogTitle sx={{ color: "white", fontWeight: "bold", fontSize: "1.75rem", p: 0 }}>
                  {selectedInvoice && `Invoice #${selectedInvoice.id.slice(0, 8)}`}
                </DialogTitle>
                <IconButton
                  onClick={handleCloseInvoiceDialog}
                  sx={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    color: "#ffffff",
                    bgcolor: "#ffffff1f",
                    "&:hover": { bgcolor: "#ffffff3f" },
                  }}
                >
                  <Typography sx={{ fontSize: "1.25rem" }}>×</Typography>
                </IconButton>
              </Box>
              <DialogContent sx={{ p: 3, bgcolor: "#ffffff" }}>
                {loading.invoice ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : invoiceError ? (
                  <Alert severity="error">{invoiceError}</Alert>
                ) : selectedInvoice ? (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        pb: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Invoice #{selectedInvoice.id.slice(0, 8)}
                      </Typography>
                      <Chip
                        label={selectedInvoice.status.toUpperCase()}
                        color={getStatusColor(selectedInvoice.status)}
                        sx={{ textTransform: "uppercase", fontWeight: 600 }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 1.5, fontSize: "1.125rem" }}>
                        Details
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                        Service: {selectedInvoice.service?.description || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                        Vehicle Plate: {selectedInvoice.vehicle?.plate || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                        Created: {formatDate(selectedInvoice.createdAt)}
                      </Typography>
                      {selectedInvoice.sentAt && (
                        <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                          Sent: {formatDate(selectedInvoice.sentAt)}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 1.5, fontSize: "1.125rem" }}>
                        Invoice Items
                      </Typography>
                      <Table sx={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
                        <TableHead sx={{ bgcolor: "#f9fafb" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                              Description
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                              Quantity
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                              Unit Price
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                              Total
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedInvoice.items.map((item, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:hover": { bgcolor: "#f9fafb" },
                                borderTop: index !== 0 ? "1px solid #e5e7eb" : "none",
                              }}
                            >
                              <TableCell sx={{ fontSize: "0.875rem", color: "#475569" }}>
                                {item.description}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                                {item.quantity}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                                KES {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                                KES {formatCurrency(item.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>

                    <Box sx={{ textAlign: "right", pt: 2, borderTop: "1px solid #e5e7eb" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                        Total: KES {formatCurrency(selectedInvoice.totalAmount)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569", mt: 0.5 }}>
                        Status: {selectedInvoice.status.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography>No invoice data available.</Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={handleCloseInvoiceDialog}
                  sx={{
                    textTransform: "none",
                    color: "#2a3e78",
                    "&:hover": { bgcolor: "#e8eaf6" },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar for Feedback */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                severity={snackbar.severity}
                sx={{ width: "100%" }}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>

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
                {loading.services ? (
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
                {loading.services ? (
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
                      <Grid item xs={12} sm={6} md={4} key={service.id}>
                        <Card sx={{ 
                          borderRadius: 3,
                          transition: "transform 0.3s, box-shadow 0.3s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                          },
                        }}>
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
                                  onClick={() => service.invoiceId && handleViewInvoice(service.invoiceId)}
                                  disabled={!service.invoiceId || loading.invoice}
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
              <MenuItem onClick={handleOpenDeleteDialog}>
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Vehicle</ListItemText>
              </MenuItem>
            </Menu>

            {/* Add global animations */}
            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .MuiDialog-paper {
                animation: slideUp 0.3s ease-out;
              }
            `}</style>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ServicesPage;