import React, { useEffect, useState } from "react";
import { 
  Container, Grid, Card, CardContent, Typography, Divider, Box, 
  CssBaseline, Chip, CircularProgress, Avatar, LinearProgress, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  useMediaQuery, Button, Checkbox, Select, MenuItem, FormControl, 
  InputLabel, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table as MuiTable, TableHead as MuiTableHead, 
  TableBody as MuiTableBody, TableRow as MuiTableRow, TableCell as MuiTableCell
} from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import ServiceRequestsTable from "../components/ServiceRequestsTable";
import SparePartsTable from "../components/mechanicComponents/SparePartsTable";
import TaskHistoryTable from "../components/mechanicComponents/TaskHistoryTable";
import { fetchAssignedServices, updateService, fetchServices } from "../services/serviceApi";
import { fetchSpareParts, createSparePartRequest } from "../services/sparePartApi";
import { fetchRecentRequestsByMechanic } from "../services/sparePartApi";

import { useSnackbar } from 'notistack';
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
interface SparePart {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  picture?: string;
  criticalLevel: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
}

interface SelectedPart {
  id: string;
  quantity: number;
}
interface SparePartRequest {
  id: string;
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  quantity: number;
  totalPrice?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string; // ISO date string
}

const MechanicDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [user, setUser] = useState('Loading...');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for spare parts selection, quantities, and confirmation dialog
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
        // Fetch assigned services
        const serviceData = await fetchAssignedServices();
        if (Array.isArray(serviceData)) {
          setRequests(serviceData);
        } else {
          setRequests([]);
        }

        // Fetch spare parts
        const partsData = await fetchSpareParts();
        const sanitizedParts = partsData.map((part: Partial<SparePart>) => ({
          ...part,
          id: part.id || '',
          name: part.name || '',
          price: typeof part.price === 'number' ? part.price : null,
          quantity: typeof part.quantity === 'number' ? part.quantity : 0,
          picture: part.picture || '',
          criticalLevel: Boolean(part.criticalLevel),
        }));
        setSpareParts(sanitizedParts);

        // Fetch vehicles
        const servicesData = await fetchServices();
        const uniqueVehicles = Array.isArray(servicesData)
          ? [...new Map(servicesData.map((item: any) => [item.vehicle.id, item.vehicle])).values()]
          : [];
        setVehicles(uniqueVehicles);
      } catch (error) {
        setRequests([]);
        setSpareParts([]);
        setVehicles([]);
        enqueueSnackbar("Failed to load data", { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [enqueueSnackbar, navigate]);

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
      enqueueSnackbar("Please select at least one spare part", { variant: 'warning' });
      return;
    }
    if (!selectedVehicle) {
      enqueueSnackbar("Please select a vehicle", { variant: 'warning' });
      return;
    }
    if (selectedParts.some((p) => p.quantity <= 0)) {
      enqueueSnackbar("All selected parts must have a quantity greater than 0", { variant: 'warning' });
      return;
    }
    // Validate stock availability
    const insufficientStock = selectedParts.find((p) => {
      const part = spareParts.find((sp) => sp.id === p.id);
      return !part || (part.quantity || 0) < p.quantity;
    });
    if (insufficientStock) {
      enqueueSnackbar(`Insufficient stock for ${spareParts.find((sp) => sp.id === insufficientStock.id)?.name || 'part'}`, { variant: 'error' });
      return;
    }
    // Validate price availability
    const missingPrice = selectedParts.find((p) => {
      const part = spareParts.find((sp) => sp.id === p.id);
      return !part || part.price == null;
    });
    if (missingPrice) {
      enqueueSnackbar(`Price not available for ${spareParts.find((sp) => sp.id === missingPrice.id)?.name || 'part'}`, { variant: 'error' });
      return;
    }
    setOpenConfirmDialog(true);
  };

 
  // Submit requests
const handleSubmitForApproval = async () => {
  try {
    const mechanicId = sessionStorage.getItem("userId");
    if (!mechanicId) {
      enqueueSnackbar("User not authenticated", { variant: 'error' });
      return;
    }

    // Create requests
    for (const p of selectedParts) {
      const part = spareParts.find((sp) => sp.id === p.id);
      const totalPrice = (part?.price || 0) * p.quantity;
      console.log('Submitting request for part:', {
        sparePartId: p.id,
        vehicleId: selectedVehicle,
        mechanicId,
        quantity: p.quantity,
        totalPrice,
      });
      await createSparePartRequest({
        sparePartId: p.id,
        vehicleId: selectedVehicle,
        mechanicId,
        quantity: p.quantity,
        totalPrice,
      });
      console.log(`Request submitted for part ${p.id}`);
    }

    // Update frontend state
    setSelectedParts([]);
    setSelectedVehicle('');
    setOpenConfirmDialog(false);
    enqueueSnackbar("Spare parts request submitted for admin approval", { variant: 'success' });

    // Refresh spare parts to reflect any changes
    const partsData = await fetchSpareParts();
    const sanitizedParts = partsData.map((part: Partial<SparePart>) => ({
      ...part,
      id: part.id || '',
      name: part.name || '',
      price: typeof part.price === 'number' ? part.price : null,
      quantity: typeof part.quantity === 'number' ? part.quantity : 0,
      picture: part.picture || '',
      criticalLevel: Boolean(part.criticalLevel),
    }));
    setSpareParts(sanitizedParts);
  } catch (error: any) {
    console.error('Error submitting spare part request:', error);
    enqueueSnackbar(error.message || "Failed to submit request", { variant: 'error' });
    setOpenConfirmDialog(false);
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
    mechanicId: string | null,
    status: string
  ) => {
    if (status !== "Completed") {
      enqueueSnackbar("Action not allowed. You can only mark tasks as completed.", { variant: 'warning' });
      return;
    }

    try {
      const updatedService = await updateService(requestId, { status });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? updatedService : req
        )
      );
      enqueueSnackbar("Task marked as completed!", { variant: 'success' });
    } catch (error) {
      enqueueSnackbar("Failed to update service", { variant: 'error' });
    }
  };


const [recentRequests, setRecentRequests] = useState<SparePartRequest[]>([]);
const [loadingRecent, setLoadingRecent] = useState(true);

useEffect(() => {
  const loadRecentRequests = async () => {
    const mechanicId = sessionStorage.getItem("userId");
    if (!mechanicId) return;

    try {
      const data = await fetchRecentRequestsByMechanic(mechanicId);
      setRecentRequests(data.slice(0, 5)); // Show last 5
    } catch (err: any) {
      enqueueSnackbar(err.message || "Failed to load recent requests", { variant: 'error' });
    } finally {
      setLoadingRecent(false);
    }
  };

  loadRecentRequests();
}, []);

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


  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
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
      </Grid>
      <Grid item xs={12} md={4}>
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
      </Grid>
      <Grid item xs={12} md={4}>
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
      </Grid>

      {/* Active Tasks */}
      <Grid item xs={12}>
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
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
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
                      bodyFont: { weight: '500' },
                    },
                  },
                  maintainAspectRatio: false,
                  cutout: isMobile ? '60%' : '70%',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
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
      </Grid>
    </Grid>
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
          <TaskHistoryTable tasks={[...completedTasks, ...cancelledTasks]} />
        )}
      </CardContent>
    </Card>
  );

  const renderSpareParts = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>Spare Parts Request</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select spare parts, specify quantities, and choose a vehicle for admin approval
        </Typography>
        
        <SparePartsTable
          spareParts={spareParts}
          selectedParts={selectedParts}
          handlePartSelection={handlePartSelection}
          handleQuantityChange={handleQuantityChange}
        />

        {/* Vehicle Selection and Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="vehicle-select-label">Select Vehicle</InputLabel>
            <Select
              labelId="vehicle-select-label"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              label="Select Vehicle"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.plate})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleInitiateSubmission}
            disabled={selectedParts.length === 0 || !selectedVehicle}
          >
            Review and Submit
          </Button>
        </Box>
        {/* Recent Requests Card */}
<Box mt={4}>
  <RecentSparePartRequestsCard requests={recentRequests} loading={loadingRecent} />
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
              Vehicle
            </Typography>
            <Typography variant="body2">
              {vehicles.find((v) => v.id === selectedVehicle)?.make}{' '}
              {vehicles.find((v) => v.id === selectedVehicle)?.model}{' '}
              ({vehicles.find((v) => v.id === selectedVehicle)?.plate})
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenConfirmDialog(false)}
              color="secondary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitForApproval}
              color="primary"
              variant="contained"
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: 2,
        }}>
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography variant="body1" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      );
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
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MechanicDashboard;