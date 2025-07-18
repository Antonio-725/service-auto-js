import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Fade,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import type { ChipProps } from "@mui/material/Chip";
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
import MyVehiclesSection from "../../components/CustomerComponents/MyVehiclesSection";
import OngoingServicesSection from "../../components/CustomerComponents/OngoingServicesSection";
import ServiceHistorySection from "../../components/CustomerComponents/ServiceHistorySection";
import AddVehicleDialog from "../../components/CustomerComponents/AddVehicleDialog";
import EditVehicleDialog from "../../components/CustomerComponents/EditVehicleDialog";
import DeleteVehicleDialog from "../../components/CustomerComponents/DeleteVehicleDialog";
import RateServiceDialog from "../../components/CustomerComponents/RateServiceDialog";
import VehicleDetailsDialog from "../../components/CustomerComponents/VehicleDetailsDialog";
import InvoiceDialog from "../../components/CustomerComponents/InvoiceDialog";
import VehicleContextMenu from "../../components/CustomerComponents/VehicleContextMenu";
import Notification from "../../components/usables/Notification";

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
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

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
        setNotification({
          open: true,
          message: error.message || "Failed to load data. Please try again.",
          type: "error",
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
      setNotification({
        open: true,
        message: "Vehicle added successfully!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Add vehicle error:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to add vehicle. Please try again.",
        type: "error",
      });
    }
  };

  const handleDeleteVehicle = async () => {
    if (selectedVehicle) {
      try {
        await deleteVehicle(selectedVehicle);
        setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle));
        setOpenDeleteDialog(false);
        setNotification({
          open: true,
          message: "Vehicle deleted successfully!",
          type: "success",
        });
      } catch (error: any) {
        console.error("Delete vehicle error:", error);
        setNotification({
          open: true,
          message: error.message || "Failed to delete vehicle. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleEditVehicle = async () => {
    try {
      const updatedVehicle = await updateVehicle(editVehicleData.id, editVehicleData);
      setVehicles((prev) => prev.map((v) => (v.id === editVehicleData.id ? updatedVehicle : v)));
      setOpenEditDialog(false);
      setNotification({
        open: true,
        message: "Vehicle updated successfully!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Edit vehicle error:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to edit vehicle. Please try again.",
        type: "error",
      });
    }
  };

  const handleRequestService = (vehicleId: string) => {
    navigate("/book", { state: { vehicleId } });
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
            service.id === selectedServiceToRate ? { ...service, rating: ratingValue } : service
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
        setNotification({
          open: true,
          message: "Invoice not found.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      setInvoiceError(error.message || "Failed to fetch invoice.");
      setNotification({
        open: true,
        message: error.message || "Failed to fetch invoice.",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, invoice: false }));
    }
  };

  const handleViewVehicleDetails = async (vehicleId: string) => {
    try {
      const vehicle = await getVehicleById(vehicleId);
      setSelectedVehicleDetails(vehicle);
      setOpenDetailsDialog(true);
    } catch (error: any) {
      console.error("Error fetching vehicle details:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to fetch vehicle details.",
        type: "error",
      });
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle";
  };

  const getStatusColor = (status: string): ChipProps["color"] => {
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

            <MyVehiclesSection
              vehicles={vehicles}
              loading={loading.vehicles}
              handleMenuOpen={handleMenuOpen}
              handleRequestService={handleRequestService}
              handleViewVehicleDetails={handleViewVehicleDetails}
            />

            <OngoingServicesSection
              currentServices={currentServices}
              loading={loading.services}
              getVehicleInfo={getVehicleInfo}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />

            <ServiceHistorySection
              serviceHistory={serviceHistory}
              loading={loading.services}
              getVehicleInfo={getVehicleInfo}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              handleOpenRatingDialog={(serviceId) => {
                setSelectedServiceToRate(serviceId);
                setRatingValue(null);
                setRatingComment("");
                setRatingError(null);
                setRatingSuccess(null);
                setOpenRatingDialog(true);
              }}
              handleViewInvoice={handleViewInvoice}
            />

            <AddVehicleDialog
              open={openVehicleDialog}
              onClose={() => setOpenVehicleDialog(false)}
              vehicleData={vehicleData}
              setVehicleData={setVehicleData}
              handleAddVehicle={handleAddVehicle}
            />

            <EditVehicleDialog
              open={openEditDialog}
              onClose={() => setOpenEditDialog(false)}
              editVehicleData={editVehicleData}
              setEditVehicleData={setEditVehicleData}
              handleEditVehicle={handleEditVehicle}
            />

            <DeleteVehicleDialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
              handleDeleteVehicle={handleDeleteVehicle}
            />

            <RateServiceDialog
              open={openRatingDialog}
              onClose={() => setOpenRatingDialog(false)}
              ratingValue={ratingValue}
              setRatingValue={setRatingValue}
              ratingComment={ratingComment}
              setRatingComment={setRatingComment}
              ratingError={ratingError}
              setRatingError={setRatingError}
              ratingSuccess={ratingSuccess}
              setRatingSuccess={setRatingSuccess}
              handleRateService={handleRateService}
              loading={loading.rating}
            />

            <VehicleDetailsDialog
              open={openDetailsDialog}
              onClose={() => setOpenDetailsDialog(false)}
              selectedVehicleDetails={selectedVehicleDetails}
            />

            <InvoiceDialog
              open={openInvoiceDialog}
              onClose={() => {
                setOpenInvoiceDialog(false);
                setSelectedInvoice(null);
                setInvoiceError(null);
              }}
              selectedInvoice={selectedInvoice}
              invoiceError={invoiceError}
              setInvoiceError={setInvoiceError}
              loading={loading.invoice}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />

            <VehicleContextMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              handleViewVehicleDetails={() => selectedVehicle && handleViewVehicleDetails(selectedVehicle)}
              handleEditVehicle={() => {
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
              handleOpenDeleteDialog={() => {
                setOpenDeleteDialog(true);
                handleMenuClose();
              }}
            />

            <Notification
              open={notification.open}
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
            />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ServicesPage;
