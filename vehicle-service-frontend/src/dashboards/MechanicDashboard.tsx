
import { useEffect, useState, useCallback } from "react";
import {
  Container, Card, CardContent, Typography, Box,
  CssBaseline, Chip, Avatar, Paper,
  Button, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle, useMediaQuery,
  DialogContent, DialogActions, Table as MuiTable, TableHead as MuiTableHead,
  TableBody as MuiTableBody, TableRow as MuiTableRow, TableCell as MuiTableCell
} from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import ServiceRequestsTable from "../components/ServiceRequestsTable";
import SparePartsTable from "../components/mechanicComponents/SparePartsTable";
import TaskHistoryTable from "../components/mechanicComponents/TaskHistoryTable";
import { fetchAssignedServices, updateService } from "../services/serviceApi";
import type  {SparePart, SparePartRequest} from "../services/sparePartApi";
import { fetchSpareParts, createSparePartRequest, fetchRecentRequestsByMechanic } from "../services/sparePartApi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/mechanicComponents/Sidebar";
import { deepPurple, teal, orange, blueGrey } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import RecentSparePartRequestsCard from "../components/mechanicComponents/RecentSparePartRequestsCard";
import Loading from "../components/usables/Loading";
import Notification from "../components/usables/Notification";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Custom professional theme
const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[600],
      light: deepPurple[50],
      dark: deepPurple[800],
    },
    secondary: {
      main: teal[500],
      light: teal[50],
      dark: teal[700],
    },
    warning: {
      main: orange[500],
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: blueGrey[900],
      secondary: blueGrey[600],
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.6rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.3rem',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body2: {
      color: blueGrey[600],
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Interfaces
interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: string;
  owner: {
    id: string;
    username: string;
    phone: string;
    email: string;
  };
}

interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

interface Service {
  id: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating: number | null;
  createdAt: string;
  vehicle: Vehicle;
  mechanic: Mechanic | null;
  priority?: string;
}

interface SelectedPart {
  id: string;
  quantity: number;
}

interface Task {
  id: string;
  serviceType: string;
  status: string;
  vehicle: Vehicle;
  date: string;
}

const MechanicDashboard = () => {
  const [requests, setRequests] = useState<Service[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [user, setUser] = useState('Loading...');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
  const navigate = useNavigate();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  // State for spare parts selection, quantities, and confirmation dialog
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ open: true, message, type });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const storedUsername = sessionStorage.getItem("username");
      const storedUserId = sessionStorage.getItem("userId");
      if (storedUsername && storedUserId) {
        setUser(storedUsername);
      } else {
        setUser("Unknown User");
        navigate('/login');
      }

      try {
        setLoading(true);
        // Fetch assigned services
        const serviceData = await fetchAssignedServices();
        const sanitizedServices = Array.isArray(serviceData)
          ? serviceData.map((service: any) => ({
              id: service.id || '',
              description: service.description || '',
              status: service.status || 'Pending',
              vehicle: {
                id: service.vehicle?.id || '',
                make: service.vehicle?.make || '',
                model: service.vehicle?.model || '',
                plate: service.vehicle?.plate || '',
                year: service.vehicle?.year || '',
                owner: {
                  id: service.vehicle?.owner?.id || '',
                  username: service.vehicle?.owner?.username || '',
                  phone: service.vehicle?.owner?.phone || '',
                  email: service.vehicle?.owner?.email || '',
                },
              },
              date: service.date || new Date().toISOString(),
              rating: service.rating ?? null,
              createdAt: service.createdAt || new Date().toISOString(),
              mechanic: service.mechanic
                ? {
                    id: service.mechanic.id || '',
                    username: service.mechanic.username || '',
                    phone: service.mechanic.phone || '',
                  }
                : null,
              priority: service.priority || undefined,
            }))
          : [];
        setRequests(sanitizedServices);
        setServices(sanitizedServices.filter((service: Service) => service.status === "In Progress"));

        // Fetch spare parts
        const partsData = await fetchSpareParts();
        const sanitizedParts = partsData.map((part: any) => ({
          id: part.id || '',
          name: part.name || '',
          price: typeof part.price === 'number' ? part.price : undefined,
          quantity: typeof part.quantity === 'number' ? part.quantity : undefined,
          picture: part.picture || undefined,
          criticalLevel: Boolean(part.criticalLevel),
          createdAt: part.createdAt || new Date().toISOString(),
          updatedAt: part.updatedAt || new Date().toISOString(),
        }));
        setSpareParts(sanitizedParts);
      } catch (error) {
        setRequests([]);
        setSpareParts([]);
        setServices([]);
        showNotification("Failed to load data", 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, showNotification]);

  // Handle spare part selection and quantity
  const handlePartSelection = (partId: string, checked: boolean, quantity: number = 1) => {
    setSelectedParts((prev) => {
      if (checked) {
        return [...prev.filter((p) => p.id !== partId), { id: partId, quantity }];
      }
      return prev.filter((p) => p.id !== partId);
    });
  };

  const handleQuantityChange = (partId: string, value: string) => {
    const quantity = value ? parseInt(value, 10) : 1;
    if (quantity < 1) return;
    setSelectedParts((prev) =>
      prev.map((p) =>
        p.id === partId ? { ...p, quantity: Math.min(quantity, spareParts.find((sp) => sp.id === partId)?.quantity || quantity) } : p
      )
    );
  };

  // Handle submission initiation
  const handleInitiateSubmission = () => {
    if (selectedParts.length === 0) {
      showNotification("Please select at least one spare part", 'error');
      return;
    }
    if (!selectedService) {
      showNotification("Please select a service", 'error');
      return;
    }
    if (selectedParts.some((p) => p.quantity <= 0)) {
      showNotification("All selected parts must have a quantity greater than 0", 'error');
      return;
    }
    // Validate stock availability
    const insufficientStock = selectedParts.find((p) => {
      const part = spareParts.find((sp) => sp.id === p.id);
      return !part || (part.quantity || 0) < p.quantity;
    });
    if (insufficientStock) {
      showNotification(`Insufficient stock for ${spareParts.find((sp) => sp.id === insufficientStock.id)?.name || 'part'}`, 'error');
      return;
    }
    // Validate price availability
    const missingPrice = selectedParts.find((p) => {
      const part = spareParts.find((sp) => sp.id === p.id);
      return !part || part.price == null;
    });
    if (missingPrice) {
      showNotification(`Price not available for ${spareParts.find((sp) => sp.id === missingPrice.id)?.name || 'part'}`, 'error');
      return;
    }
    setOpenConfirmDialog(true);
  };

  // Submit requests
  const handleSubmitForApproval = async () => {
    try {
      setSubmitLoading(true);
      const mechanicId = sessionStorage.getItem("userId");
      if (!mechanicId) {
        showNotification("User not authenticated", 'error');
        return;
      }

      const selectedServiceObj = services.find((s) => s.id === selectedService);
      if (!selectedServiceObj) {
        showNotification("Selected service not found", 'error');
        return;
      }

      // Create requests
      for (const p of selectedParts) {
        const part = spareParts.find((sp) => sp.id === p.id);
        const totalPrice = (part?.price || 0) * p.quantity;
        await createSparePartRequest({
          sparePartId: p.id,
          vehicleId: selectedServiceObj.vehicle.id,
          mechanicId,
          serviceId: selectedService,
          quantity: p.quantity,
          totalPrice,
        });
      }

      // Update frontend state
      setSelectedParts([]);
      setSelectedService('');
      setOpenConfirmDialog(false);
      showNotification("Spare parts request submitted for admin approval", 'success');

      // Refresh spare parts to reflect any changes
      const partsData = await fetchSpareParts();
      const sanitizedParts = partsData.map((part: any) => ({
        id: part.id || '',
        name: part.name || '',
        price: typeof part.price === 'number' ? part.price : undefined,
        quantity: typeof part.quantity === 'number' ? part.quantity : undefined,
        picture: part.picture || undefined,
        criticalLevel: Boolean(part.criticalLevel),
        createdAt: part.createdAt || new Date().toISOString(),
        updatedAt: part.updatedAt || new Date().toISOString(),
      }));
      setSpareParts(sanitizedParts);
    } catch (error: any) {
      console.error('Error submitting spare part request:', error);
      showNotification(error.message || "Failed to submit request", 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedParts.reduce((total, p) => {
      const part = spareParts.find((sp) => sp.id === p.id);
      return total + (part?.price || 0) * p.quantity;
    }, 0);
  };

  const currentTasks = requests.filter(
    (req) => req.status === "Pending" || req.status === "In Progress"
  );

  const completedTasks = requests.filter(
    (req) => req.status === "Completed"
  );

  const cancelledTasks = requests.filter(
    (req) => req.status === "Cancelled"
  );

  const handleAssign = async (
    requestId: string,
    _mechanicId: string | null,
    status: string
  ) => {
    if (status !== "Completed") {
      showNotification("Action not allowed. You can only mark tasks as completed.", 'error');
      return;
    }

    try {
      const updatedService = await updateService(requestId, { status });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...updatedService, mechanic: updatedService.mechanic ? { id: updatedService.mechanic.id, username: updatedService.mechanic.username, phone: updatedService.mechanic.phone } : null } : req
        )
      );
      showNotification("Task marked as completed!", 'success');
    } catch (error) {
      showNotification("Failed to update service", 'error');
    }
  };

  const [recentRequests, setRecentRequests] = useState<SparePartRequest[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const loadRecentRequests = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        showNotification("User not authenticated", 'error');
        return;
      }

      try {
        const data = await fetchRecentRequestsByMechanic();
        const sanitizedRequests = data.map((req: any) => ({
          id: req.id || '',
          sparePartId: req.sparePartId || '',
          vehicleId: req.vehicleId || '',
          mechanicId: req.mechanicId || '',
          serviceId: req.serviceId || '',
          quantity: req.quantity || 0,
          totalPrice: req.totalPrice || 0,
          status: req.status || 'Pending',
          createdAt: req.createdAt || new Date().toISOString(),
          updatedAt: req.updatedAt || new Date().toISOString(),
          sparePart: req.sparePart
            ? {
                id: req.sparePart.id || '',
                name: req.sparePart.name || '',
                price: typeof req.sparePart.price === 'number' ? req.sparePart.price : undefined,
                quantity: typeof req.sparePart.quantity === 'number' ? req.sparePart.quantity : undefined,
                picture: req.sparePart.picture || undefined,
                criticalLevel: Boolean(req.sparePart.criticalLevel),
                createdAt: req.sparePart.createdAt || new Date().toISOString(),
                updatedAt: req.sparePart.updatedAt || new Date().toISOString(),
              }
            : undefined,
          vehicle: req.vehicle
            ? {
                id: req.vehicle.id || '',
                make: req.vehicle.make || '',
                model: req.vehicle.model || '',
                plate: req.vehicle.plate || '',
              }
            : undefined,
          mechanic: req.mechanic
            ? {
                id: req.mechanic.id || '',
                username: req.mechanic.username || '',
                email: req.mechanic.email || '',
              }
            : undefined,
          service: req.service
            ? {
                id: req.service.id || '',
                description: req.service.description || '',
                date: req.service.date || new Date().toISOString(),
              }
            : undefined,
        }));
        setRecentRequests(sanitizedRequests.slice(0, 5));
      } catch (err: any) {
        showNotification(err.message || "Failed to fetch recent requests", 'error');
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentRequests();
  }, [showNotification]);

  // Pie chart data
  const pieChartData = {
    labels: ['Completed', 'Pending/In Progress', 'Cancelled'],
    datasets: [{
      label: 'Task Distribution',
      data: [completedTasks.length, currentTasks.length, cancelledTasks.length],
      backgroundColor: [teal[500], orange[500], blueGrey[500]],
      borderColor: ['#ffffff'],
      borderWidth: 2,
      hoverOffset: 10,
    }],
  };

  // Bar chart data
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Tasks',
        data: [12, 19, 8, 15, 12, 10],
        backgroundColor: teal[500],
        borderRadius: 6,
      },
      {
        label: 'Cancelled Tasks',
        data: [2, 3, 1, 2, 4, 1],
        backgroundColor: blueGrey[500],
        borderRadius: 6,
      },
    ],
  };

  const mapServiceToTask = (service: Service): Task => ({
    id: service.id,
    serviceType: service.description,
    status: service.status,
    vehicle: service.vehicle,
    date: service.date || new Date().toISOString(),
  });

  const renderDashboard = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
      }}
    >
      {/* Summary Cards */}
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: deepPurple[100], color: deepPurple[600], mr: 2 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
              <Typography variant="h4" fontWeight="bold">{currentTasks.length}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: teal[100], color: teal[600], mr: 2 }}>
              <CheckCircleOutlineIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
              <Typography variant="h4" fontWeight="bold">{completedTasks.length}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: orange[100], color: orange[600], mr: 2 }}>
              <CancelIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">Cancelled</Typography>
              <Typography variant="h4" fontWeight="bold">{cancelledTasks.length}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Active Tasks */}
      <Box sx={{ flex: '1 1 100%' }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" color="primary">Active Service Requests</Typography>
              <Chip 
                label={`${currentTasks.length} active`} 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            {currentTasks.length > 0 ? (
              <ServiceRequestsTable
                requests={currentTasks}
                mechanics={[]}
                onAssign={handleAssign}
                showAllColumns={false}
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
                <Typography variant="body1" color="text.secondary">
                  No active tasks assigned to you currently.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Task Distribution</Typography>
            <Box sx={{ height: 300 }}>
              <Pie 
                data={pieChartData} 
                options={{
                  plugins: {
                    legend: { 
                      position: isMobile ? 'top' : 'right',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                    tooltip: { 
                      backgroundColor: 'rgba(0, 0, 0, 0.85)', 
                      cornerRadius: 12,
                      bodyFont: { weight: 500 },
                    },
                  },
                  maintainAspectRatio: false,
                  cutout: isMobile ? '60%' : '70%',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Monthly Performance</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={barChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderHistory = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>Task History</Typography>
        {cancelledTasks.length === 0 && completedTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No past tasks found in your history.
            </Typography>
          </Paper>
        ) : (
          <TaskHistoryTable tasks={[...completedTasks, ...cancelledTasks].map(mapServiceToTask)} />
        )}
      </CardContent>
    </Card>
  );

  const renderSpareParts = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>Spare Parts Request</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select spare parts, specify quantities, and choose a service for admin approval
        </Typography>
        
        <SparePartsTable
          spareParts={spareParts}
          selectedParts={selectedParts}
          handlePartSelection={handlePartSelection}
          handleQuantityChange={handleQuantityChange}
        />

        {/* Service Selection and Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="service-select-label">Select Service</InputLabel>
            <Select
              labelId="service-select-label"
              value={selectedService}
              onChange={(e) => {
                console.log('Selected service:', e.target.value);
                setSelectedService(e.target.value as string);
              }}
              label="Select Service"
              disabled={services.length === 0}
            >
              {services.length === 0 ? (
                <MenuItem value="" disabled>
                  No services assigned
                </MenuItem>
              ) : (
                services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.description} ({service.vehicle.make} {service.vehicle.model} - {service.vehicle.plate})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleInitiateSubmission}
            disabled={selectedParts.length === 0 || !selectedService || submitLoading}
          >
            {submitLoading ? 'Submitting...' : 'Review and Submit'}
          </Button>
        </Box>
        {/* Recent Requests Card */}
        <Box mt={4}>
          <RecentSparePartRequestsCard 
            requests={recentRequests} 
            loading={loadingRecent}
            spareParts={spareParts}
          />
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Spare Parts Request</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Selected Spare Parts
            </Typography>
            <MuiTable>
              <MuiTableHead>
                <MuiTableRow>
                  <MuiTableCell>Part Name</MuiTableCell>
                  <MuiTableCell align="right">Quantity</MuiTableCell>
                  <MuiTableCell align="right">Price</MuiTableCell>
                  <MuiTableCell align="right">Total</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {selectedParts.map((p) => {
                  const part = spareParts.find((sp) => sp.id === p.id);
                  return (
                    <MuiTableRow key={p.id}>
                      <MuiTableCell>{part?.name}</MuiTableCell>
                      <MuiTableCell align="right">{p.quantity}</MuiTableCell>
                      <MuiTableCell align="right">
                        {part?.price != null ? `$${part.price.toFixed(2)}` : 'N/A'}
                      </MuiTableCell>
                      <MuiTableCell align="right">
                        {part?.price != null ? `$${(part.price * p.quantity).toFixed(2)}` : 'N/A'}
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })}
                <MuiTableRow>
                  <MuiTableCell colSpan={3} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Price:
                    </Typography>
                  </MuiTableCell>
                  <MuiTableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      ${calculateTotalPrice().toFixed(2)}
                    </Typography>
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableBody>
            </MuiTable>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Service
            </Typography>
            <Typography variant="body2">
              {services.find((s) => s.id === selectedService)?.description}{' '}
              ({services.find((s) => s.id === selectedService)?.vehicle.make}{' '}
              {services.find((s) => s.id === selectedService)?.vehicle.model}{' '}
              - {services.find((s) => s.id === selectedService)?.vehicle.plate})
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenConfirmDialog(false)}
              color="secondary"
              variant="outlined"
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitForApproval}
              color="primary"
              variant="contained"
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return <Loading message="Loading your dashboard..." />;
    }

    switch (selectedPage) {
      case 'dashboard': return renderDashboard();
      case 'history': return renderHistory();
      case 'spareParts': return renderSpareParts();
      default: return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} user={user} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Container maxWidth="xl" sx={{ py: isMobile ? 0 : 2 }}>
            {renderContent()}
          </Container>
          <Notification
            open={notification.open}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, open: false })}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MechanicDashboard;







// import React, { useEffect, useState, useCallback } from "react";
// import {
//   Container, Grid, Card, CardContent, Typography, Box,
//   CssBaseline, Chip, Avatar, Paper,
//    Button,  Select,
//   MenuItem, FormControl, InputLabel, Dialog, DialogTitle,useMediaQuery,
//   DialogContent, DialogActions, Table as MuiTable, TableHead as MuiTableHead,
//   TableBody as MuiTableBody, TableRow as MuiTableRow, TableCell as MuiTableCell
// } from "@mui/material";
// import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
// import ServiceRequestsTable from "../components/ServiceRequestsTable";
// import SparePartsTable from "../components/mechanicComponents/SparePartsTable";
// import TaskHistoryTable from "../components/mechanicComponents/TaskHistoryTable";
// import { fetchAssignedServices, updateService } from "../services/serviceApi";
// import { fetchSpareParts, createSparePartRequest } from "../services/sparePartApi";
// import { fetchRecentRequestsByMechanic } from "../services/sparePartApi";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// } from 'chart.js';
// import { Pie, Bar } from 'react-chartjs-2';
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/mechanicComponents/Sidebar";
// import { deepPurple, teal, orange, blueGrey } from '@mui/material/colors';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import CancelIcon from '@mui/icons-material/Cancel';
// import RecentSparePartRequestsCard from "../components/mechanicComponents/RecentSparePartRequestsCard";
// import Loading from "../components/usables/Loading"; // Import Loading component
// import Notification from "../components/usables/Notification"; // Import Notification component

// // Register ChartJS components
// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// );

// // Custom professional theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: deepPurple[600],
//       light: deepPurple[50],
//       dark: deepPurple[800],
//     },
//     secondary: {
//       main: teal[500],
//       light: teal[50],
//       dark: teal[700],
//     },
//     warning: {
//       main: orange[500],
//     },
//     background: {
//       default: '#f8f9fa',
//       paper: '#ffffff',
//     },
//     text: {
//       primary: blueGrey[900],
//       secondary: blueGrey[600],
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 700,
//       fontSize: '1.6rem',
//     },
//     h5: {
//       fontWeight: 600,
//       fontSize: '1.3rem',
//     },
//     h6: {
//       fontWeight: 600,
//     },
//     subtitle1: {
//       fontWeight: 500,
//     },
//     body2: {
//       color: blueGrey[600],
//     },
//   },
//   components: {
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//           boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
//           transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
//           '&:hover': {
//             transform: 'translateY(-5px)',
//             boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           textTransform: 'none',
//           fontSize: 14,
//           fontWeight: 500,
//           padding: '8px 16px',
//         },
//       },
//     },
//     MuiChip: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//           fontWeight: 500,
//         },
//       },
//     },
//     MuiDialog: {
//       styleOverrides: {
//         paper: {
//           borderRadius: 16,
//           boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
//         },
//       },
//     },
//   },
// });

// // Interfaces
// interface SparePart {
//   id: string;
//   name: string;
//   price: number | null | undefined; // Allow null
//   quantity: number | null | undefined; // Allow null
//   picture: string | undefined;
//   criticalLevel: boolean;
// }

// interface Vehicle {
//   id: string;
//   make: string;
//   model: string;
//   plate: string;
// }

// interface Service {
//   id: string;
//   description: string;
//   status: string;
//   vehicle: Vehicle;
// }

// interface SelectedPart {
//   id: string;
//   quantity: number;
// }

// interface SparePartRequest {
//   id: string;
//   sparePartId: string;
//   vehicleId: string;
//   mechanicId: string;
//   quantity: number;
//   totalPrice?: number;
//   status: 'Pending' | 'Approved' | 'Rejected';
//   createdAt: string;
// }

// const MechanicDashboard = () => {
//   const [requests, setRequests] = useState<Service[]>([]);
//   const [spareParts, setSpareParts] = useState<SparePart[]>([]);
//   const [services, setServices] = useState<Service[]>([]); // Updated to store services
//   const [loading, setLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false); // New state for submission loading
//   const [selectedPage, setSelectedPage] = useState('dashboard');
//   const [user, setUser] = useState('Loading...');
//   const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   // State for spare parts selection, quantities, and confirmation dialog
//   const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
//   const [selectedService, setSelectedService] = useState<string>(''); // Updated to select service
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

//   const showNotification = useCallback((message: string, type: 'success' | 'error') => {
//     setNotification({ open: true, message, type });
//   }, []);

//   useEffect(() => {
//     const loadData = async () => {
//       const storedUsername = sessionStorage.getItem("username");
//       const storedUserId = sessionStorage.getItem("userId");
//       if (storedUsername && storedUserId) {
//         setUser(storedUsername);
//       } else {
//         setUser("Unknown User");
//         navigate('/login');
//       }

//       try {
//         setLoading(true);
//         // Fetch assigned services
//         const serviceData = await fetchAssignedServices();
//         if (Array.isArray(serviceData)) {
//           setRequests(serviceData);
//           // Store services and filter vehicles
//           const inProgressServices = serviceData.filter((service: Service) => service.status === "In Progress");
//           setServices(inProgressServices);
//           const assignedVehicles = inProgressServices
//             .map((service: Service) => service.vehicle)
//             .filter((vehicle: Vehicle, index: number, self: Vehicle[]) =>
//               index === self.findIndex((v) => v.id === vehicle.id)
//             );
//           console.log('Loaded vehicles:', assignedVehicles); // Debug log
//         } else {
//           setRequests([]);
//           setServices([]);
//         }

//         // Fetch spare parts
//         const partsData = await fetchSpareParts();
//         const sanitizedParts = partsData.map((part: Partial<SparePart>) => ({
//           ...part,
//           id: part.id || '',
//           name: part.name || '',
//           price: typeof part.price === 'number' ? part.price : null,
//           quantity: typeof part.quantity === 'number' ? part.quantity : 0,
//           picture: part.picture || '',
//           criticalLevel: Boolean(part.criticalLevel),
//         }));
//         setSpareParts(sanitizedParts);
//       } catch (error) {
//         setRequests([]);
//         setSpareParts([]);
//         setServices([]);
//         showNotification("Failed to load data", 'error');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [navigate, showNotification]);

//   // Handle spare part selection and quantity
//   const handlePartSelection = (partId: string, checked: boolean, quantity: number = 1) => {
//     setSelectedParts((prev) => {
//       if (checked) {
//         return [...prev.filter((p) => p.id !== partId), { id: partId, quantity }];
//       }
//       return prev.filter((p) => p.id !== partId);
//     });
//   };

//   const handleQuantityChange = (partId: string, value: string) => {
//     const quantity = value ? parseInt(value, 10) : 1;
//     if (quantity < 1) return;
//     setSelectedParts((prev) =>
//       prev.map((p) =>
//         p.id === partId ? { ...p, quantity: Math.min(quantity, spareParts.find((sp) => sp.id === partId)?.quantity || quantity) } : p
//       )
//     );
//   };

//   // Handle submission initiation
//   const handleInitiateSubmission = () => {
//     if (selectedParts.length === 0) {
//       showNotification("Please select at least one spare part", 'error');
//       return;
//     }
//     if (!selectedService) {
//       showNotification("Please select a service", 'error');
//       return;
//     }
//     if (selectedParts.some((p) => p.quantity <= 0)) {
//       showNotification("All selected parts must have a quantity greater than 0", 'error');
//       return;
//     }
//     // Validate stock availability
//     const insufficientStock = selectedParts.find((p) => {
//       const part = spareParts.find((sp) => sp.id === p.id);
//       return !part || (part.quantity || 0) < p.quantity;
//     });
//     if (insufficientStock) {
//       showNotification(`Insufficient stock for ${spareParts.find((sp) => sp.id === insufficientStock.id)?.name || 'part'}`, 'error');
//       return;
//     }
//     // Validate price availability
//     const missingPrice = selectedParts.find((p) => {
//       const part = spareParts.find((sp) => sp.id === p.id);
//       return !part || part.price == null;
//     });
//     if (missingPrice) {
//       showNotification(`Price not available for ${spareParts.find((sp) => sp.id === missingPrice.id)?.name || 'part'}`, 'error');
//       return;
//     }
//     setOpenConfirmDialog(true);
//   };

//   // Submit requests
//   const handleSubmitForApproval = async () => {
//     try {
//       setSubmitLoading(true);
//       const mechanicId = sessionStorage.getItem("userId");
//       if (!mechanicId) {
//         showNotification("User not authenticated", 'error');
//         return;
//       }

//       const selectedServiceObj = services.find((s) => s.id === selectedService);
//       if (!selectedServiceObj) {
//         showNotification("Selected service not found", 'error');
//         return;
//       }

//       // Create requests
//       for (const p of selectedParts) {
//         const part = spareParts.find((sp) => sp.id === p.id);
//         const totalPrice = (part?.price || 0) * p.quantity;
//         console.log('Submitting request for part:', {
//           sparePartId: p.id,
//           vehicleId: selectedServiceObj.vehicle.id,
//           mechanicId,
//           serviceId: selectedService,
//           quantity: p.quantity,
//           totalPrice,
//         });
//         await createSparePartRequest({
//           sparePartId: p.id,
//           vehicleId: selectedServiceObj.vehicle.id,
//           mechanicId,
//           serviceId: selectedService,
//           quantity: p.quantity,
//           totalPrice,
//         });
//         console.log(`Request submitted for part ${p.id}`);
//       }

//       // Update frontend state
//       setSelectedParts([]);
//       setSelectedService('');
//       setOpenConfirmDialog(false);
//       showNotification("Spare parts request submitted for admin approval", 'success');

//       // Refresh spare parts to reflect any changes
//       const partsData = await fetchSpareParts();
//       const sanitizedParts = partsData.map((part: Partial<SparePart>) => ({
//         ...part,
//         id: part.id || '',
//         name: part.name || '',
//         price: typeof part.price === 'number' ? part.price : null,
//         quantity: typeof part.quantity === 'number' ? part.quantity : 0,
//         picture: part.picture || '',
//         criticalLevel: Boolean(part.criticalLevel),
//       }));
//       setSpareParts(sanitizedParts);
//     } catch (error: any) {
//       console.error('Error submitting spare part request:', error);
//       showNotification(error.message || "Failed to submit request", 'error');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   // Calculate total price
//   const calculateTotalPrice = () => {
//     return selectedParts.reduce((total, p) => {
//       const part = spareParts.find((sp) => sp.id === p.id);
//       return total + (part?.price || 0) * p.quantity;
//     }, 0);
//   };

//   const currentTasks = requests.filter(
//     (req) => req.status === "Pending" || req.status === "In Progress"
//   );

//   const completedTasks = requests.filter(
//     (req) => req.status === "Completed"
//   );

//   const cancelledTasks = requests.filter(
//     (req) => req.status === "Cancelled"
//   );

//   const handleAssign = async (
//     requestId: string,
//     mechanicId: string | null,
//     status: string
//   ) => {
//     if (status !== "Completed") {
//       showNotification("Action not allowed. You can only mark tasks as completed.", 'error');
//       return;
//     }

//     try {
//       const updatedService = await updateService(requestId, { status });
//       setRequests((prev) =>
//         prev.map((req) =>
//           req.id === requestId ? updatedService : req
//         )
//       );
//       showNotification("Task marked as completed!", 'success');
//     } catch (error) {
//       showNotification("Failed to update service", 'error');
//     }
//   };

//   const [recentRequests, setRecentRequests] = useState<SparePartRequest[]>([]);
//   const [loadingRecent, setLoadingRecent] = useState(true);

//   useEffect(() => {
//     const loadRecentRequests = async () => {
//       const mechanicId = sessionStorage.getItem("userId");
//       if (!mechanicId) return;

//       try {
//         const data = await fetchRecentRequestsByMechanic(mechanicId);
//         setRecentRequests(data.slice(0, 5)); // Show last 5
//       } catch (err: any) {
//         showNotification(err.message || "Failed to load recent requests", 'error');
//       } finally {
//         setLoadingRecent(false);
//       }
//     };

//     loadRecentRequests();
//   }, [showNotification]);

//   // Pie chart data
//   const pieChartData = {
//     labels: ['Completed', 'Pending/In Progress', 'Cancelled'],
//     datasets: [{
//       label: 'Task Distribution',
//       data: [completedTasks.length, currentTasks.length, cancelledTasks.length],
//       backgroundColor: [teal[500], orange[500], blueGrey[500]],
//       borderColor: ['#ffffff'],
//       borderWidth: 2,
//       hoverOffset: 10,
//     }],
//   };

//   // Bar chart data
//   const barChartData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [
//       {
//         label: 'Completed Tasks',
//         data: [12, 19, 8, 15, 12, 10],
//         backgroundColor: teal[500],
//         borderRadius: 6,
//       },
//       {
//         label: 'Cancelled Tasks',
//         data: [2, 3, 1, 2, 4, 1],
//         backgroundColor: blueGrey[500],
//         borderRadius: 6,
//       },
//     ],
//   };

//   const renderDashboard = () => (
//     <Grid container spacing={3}>
//       {/* Summary Cards */}
//       <Grid item xs={12} md={4}>
//         <Card>
//           <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
//             <Avatar sx={{ bgcolor: deepPurple[100], color: deepPurple[600], mr: 2 }}>
//               <AssignmentIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
//               <Typography variant="h4" fontWeight="bold">{currentTasks.length}</Typography>
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <Card>
//           <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
//             <Avatar sx={{ bgcolor: teal[100], color: teal[600], mr: 2 }}>
//               <CheckCircleOutlineIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Completed</Typography>
//               <Typography variant="h4" fontWeight="bold">{completedTasks.length}</Typography>
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <Card>
//           <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
//             <Avatar sx={{ bgcolor: orange[100], color: orange[600], mr: 2 }}>
//               <CancelIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Cancelled</Typography>
//               <Typography variant="h4" fontWeight="bold">{cancelledTasks.length}</Typography>
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>

//       {/* Active Tasks */}
//       <Grid item xs={12}>
//         <Card>
//           <CardContent>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//               <Typography variant="h5" color="primary">Active Service Requests</Typography>
//               <Chip 
//                 label={`${currentTasks.length} active`} 
//                 color="primary" 
//                 variant="outlined"
//                 sx={{ fontWeight: 600 }}
//               />
//             </Box>
//             {currentTasks.length > 0 ? (
//               <ServiceRequestsTable
//                 requests={currentTasks}
//                 mechanics={[]}
//                 onAssign={handleAssign}
//                 showAllColumns={false}
//               />
//             ) : (
//               <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
//                 <Typography variant="body1" color="text.secondary">
//                   No active tasks assigned to you currently.
//                 </Typography>
//               </Paper>
//             )}
//           </CardContent>
//         </Card>
//       </Grid>

//       {/* Charts */}
//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" color="primary" gutterBottom>Task Distribution</Typography>
//             <Box sx={{ height: 300 }}>
//               <Pie 
//                 data={pieChartData} 
//                 options={{
//                   plugins: {
//                     legend: { 
//                       position: isMobile ? 'top' : 'right',
//                       labels: {
//                         usePointStyle: true,
//                         padding: 20,
//                       },
//                     },
//                     tooltip: { 
//                       backgroundColor: 'rgba(0, 0, 0, 0.85)', 
//                       cornerRadius: 12,
//                       bodyFont: { weight: 500 },
//                     },
//                   },
//                   maintainAspectRatio: false,
//                   cutout: isMobile ? '60%' : '70%',
//                 }}
//               />
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" color="primary" gutterBottom>Monthly Performance</Typography>
//             <Box sx={{ height: 300 }}>
//               <Bar 
//                 data={barChartData} 
//                 options={{
//                   responsive: true,
//                   plugins: {
//                     legend: {
//                       position: 'top',
//                     },
//                   },
//                   scales: {
//                     x: {
//                       grid: {
//                         display: false,
//                       },
//                     },
//                     y: {
//                       beginAtZero: true,
//                       grid: {
//                         color: 'rgba(0, 0, 0, 0.05)',
//                       },
//                     },
//                   },
//                   maintainAspectRatio: false,
//                 }}
//               />
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );

//   const renderHistory = () => (
//     <Card>
//       <CardContent>
//         <Typography variant="h5" color="primary" gutterBottom>Task History</Typography>
//         {cancelledTasks.length === 0 && completedTasks.length === 0 ? (
//           <Paper sx={{ p: 3, textAlign: 'center' }}>
//             <Typography variant="body1" color="text.secondary">
//               No past tasks found in your history.
//             </Typography>
//           </Paper>
//         ) : (
//           <TaskHistoryTable tasks={[...completedTasks, ...cancelledTasks]} />
//         )}
//       </CardContent>
//     </Card>
//   );

//   const renderSpareParts = () => (
//     <Card>
//       <CardContent>
//         <Typography variant="h5" color="primary" gutterBottom>Spare Parts Request</Typography>
//         <Typography variant="body2" color="text.secondary" gutterBottom>
//           Select spare parts, specify quantities, and choose a service for admin approval
//         </Typography>
        
//         <SparePartsTable
//           spareParts={spareParts}
//           selectedParts={selectedParts}
//           handlePartSelection={handlePartSelection}
//           handleQuantityChange={handleQuantityChange}
//         />

//         {/* Service Selection and Submit Button */}
//         <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
//           <FormControl sx={{ minWidth: 200 }}>
//             <InputLabel id="service-select-label">Select Service</InputLabel>
//             <Select
//               labelId="service-select-label"
//               value={selectedService}
//               onChange={(e) => {
//                 console.log('Selected service:', e.target.value); // Debug log
//                 setSelectedService(e.target.value as string);
//               }}
//               label="Select Service"
//               disabled={services.length === 0}
//             >
//               {services.length === 0 ? (
//                 <MenuItem value="" disabled>
//                   No services assigned
//                 </MenuItem>
//               ) : (
//                 services.map((service) => (
//                   <MenuItem key={service.id} value={service.id}>
//                     {service.description} ({service.vehicle.make} {service.vehicle.model} - {service.vehicle.plate})
//                   </MenuItem>
//                 ))
//               )}
//             </Select>
//           </FormControl>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleInitiateSubmission}
//             disabled={selectedParts.length === 0 || !selectedService || submitLoading}
//           >
//             {submitLoading ? 'Submitting...' : 'Review and Submit'}
//           </Button>
//         </Box>
//         {/* Recent Requests Card */}
//         <Box mt={4}>
//           <RecentSparePartRequestsCard requests={recentRequests} loading={loadingRecent} />
//         </Box>

//         {/* Confirmation Dialog */}
//         <Dialog
//           open={openConfirmDialog}
//           onClose={() => setOpenConfirmDialog(false)}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>Confirm Spare Parts Request</DialogTitle>
//           <DialogContent>
//             <Typography variant="subtitle1" gutterBottom>
//               Selected Spare Parts
//             </Typography>
//             <MuiTable>
//               <MuiTableHead>
//                 <MuiTableRow>
//                   <MuiTableCell>Part Name</MuiTableCell>
//                   <MuiTableCell align="right">Quantity</MuiTableCell>
//                   <MuiTableCell align="right">Price</MuiTableCell>
//                   <MuiTableCell align="right">Total</MuiTableCell>
//                 </MuiTableRow>
//               </MuiTableHead>
//               <MuiTableBody>
//                 {selectedParts.map((p) => {
//                   const part = spareParts.find((sp) => sp.id === p.id);
//                   return (
//                     <MuiTableRow key={p.id}>
//                       <MuiTableCell>{part?.name}</MuiTableCell>
//                       <MuiTableCell align="right">{p.quantity}</MuiTableCell>
//                       <MuiTableCell align="right">
//                         {part?.price != null ? `$${part.price.toFixed(2)}` : 'N/A'}
//                       </MuiTableCell>
//                       <MuiTableCell align="right">
//                         {part?.price != null ? `$${(part.price * p.quantity).toFixed(2)}` : 'N/A'}
//                       </MuiTableCell>
//                     </MuiTableRow>
//                   );
//                 })}
//                 <MuiTableRow>
//                   <MuiTableCell colSpan={3} align="right">
//                     <Typography variant="subtitle1" fontWeight="bold">
//                       Total Price:
//                     </Typography>
//                   </MuiTableCell>
//                   <MuiTableCell align="right">
//                     <Typography variant="subtitle1" fontWeight="bold">
//                       ${calculateTotalPrice().toFixed(2)}
//                     </Typography>
//                   </MuiTableCell>
//                 </MuiTableRow>
//               </MuiTableBody>
//             </MuiTable>
//             <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//               Service
//             </Typography>
//             <Typography variant="body2">
//               {services.find((s) => s.id === selectedService)?.description}{' '}
//               ({services.find((s) => s.id === selectedService)?.vehicle.make}{' '}
//               {services.find((s) => s.id === selectedService)?.vehicle.model}{' '}
//               - {services.find((s) => s.id === selectedService)?.vehicle.plate})
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button
//               onClick={() => setOpenConfirmDialog(false)}
//               color="secondary"
//               variant="outlined"
//               disabled={submitLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmitForApproval}
//               color="primary"
//               variant="contained"
//               disabled={submitLoading}
//             >
//               {submitLoading ? 'Submitting...' : 'Submit for Approval'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );

//   const renderContent = () => {
//     if (loading) {
//       return <Loading message="Loading your dashboard..." />;
//     }

//     switch (selectedPage) {
//       case 'dashboard': return renderDashboard();
//       case 'history': return renderHistory();
//       case 'spareParts': return renderSpareParts();
//       default: return null;
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//         <CssBaseline />
//         <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} user={user} />
//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             p: { xs: 2, sm: 3 },
//             backgroundColor: 'background.default',
//             minHeight: '100vh',
//           }}
//         >
//           <Container maxWidth="xl" sx={{ py: isMobile ? 0 : 2 }}>
//             {renderContent()}
//           </Container>
//           <Notification
//             open={notification.open}
//             message={notification.message}
//             type={notification.type}
//             onClose={() => setNotification({ ...notification, open: false })}
//           />
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default MechanicDashboard;
