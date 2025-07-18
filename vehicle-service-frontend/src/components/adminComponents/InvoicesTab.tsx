import './InvoicesTab.css';
import { updateInvoiceStatus, sendInvoiceEmail } from '../../utils/apiClient';
import React, { useEffect, useCallback, useMemo, useReducer } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TableContainer,
} from '@mui/material';
import { fetchCompletedServicesWithoutInvoice } from '../../services/serviceApi';
import {
  getSparePartRequests,
  createInvoice,
  getInvoices,
  deleteInvoice,
} from '../../utils/apiClient';
import Notification from '../usables/Notification';
import Loading from '../usables/Loading';
import type { Service, SparePart, SparePartRequest, Invoice } from '../../types/invoicetab';

// Updated interfaces to fix type mismatches
interface Vehicle {
  id: string;
  name?: string;
  make?: string;
  model?: string;
  licensePlate?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
}

interface Mechanic {
  id: string;
  name?: string;
}

interface ServiceWithInvoice extends Service {
  vehicle: Vehicle;
  mechanic: Mechanic;
  user?: User;
}

interface InvoiceWithRelations extends Invoice {
  service?: ServiceWithInvoice;
  vehicle?: Vehicle;
  user?: User;
}

interface State {
  services: ServiceWithInvoice[];
  selectedService: ServiceWithInvoice | null;
  spareParts: SparePart[];
  laborCost: number;
  tax: number;
  loading: boolean;
  invoices: InvoiceWithRelations[];
  editModal: boolean;
  selectedInvoice: InvoiceWithRelations | null;
  saveLoading: boolean;
  deleteLoading: boolean;
  notification: { open: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' };
}

type Action =
  | { type: 'SET_SERVICES'; payload: ServiceWithInvoice[] }
  | { type: 'SET_SELECTED_SERVICE'; payload: ServiceWithInvoice | null }
  | { type: 'SET_SPARE_PARTS'; payload: SparePart[] }
  | { type: 'SET_LABOR_COST'; payload: number }
  | { type: 'SET_TAX'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INVOICES'; payload: InvoiceWithRelations[] }
  | { type: 'SET_EDIT_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_INVOICE'; payload: InvoiceWithRelations | null }
  | { type: 'SET_SAVE_LOADING'; payload: boolean }
  | { type: 'SET_DELETE_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: State['notification'] };

const initialState: State = {
  services: [],
  selectedService: null,
  spareParts: [],
  laborCost: 0,
  tax: 0,
  loading: false,
  invoices: [],
  editModal: false,
  selectedInvoice: null,
  saveLoading: false,
  deleteLoading: false,
  notification: { open: false, message: '', type: 'success' },
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    case 'SET_SELECTED_SERVICE':
      return { ...state, selectedService: action.payload };
    case 'SET_SPARE_PARTS':
      return { ...state, spareParts: action.payload };
    case 'SET_LABOR_COST':
      return { ...state, laborCost: action.payload };
    case 'SET_TAX':
      return { ...state, tax: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_EDIT_MODAL':
      return { ...state, editModal: action.payload };
    case 'SET_SELECTED_INVOICE':
      return { ...state, selectedInvoice: action.payload };
    case 'SET_SAVE_LOADING':
      return { ...state, saveLoading: action.payload };
    case 'SET_DELETE_LOADING':
      return { ...state, deleteLoading: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    default:
      return state;
  }
};

const InvoicesTab: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { services, selectedService, spareParts, laborCost, tax, loading, invoices, editModal, selectedInvoice, saveLoading, deleteLoading, notification } = state;

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      dispatch({ type: 'SET_NOTIFICATION', payload: { open: true, message, type } });
    },
    []
  );

  const calculateTotal = useMemo(() => {
    const partsTotal = spareParts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0
    );
    return (laborCost + partsTotal + tax).toFixed(2);
  }, [spareParts, laborCost, tax]);

  const getVehicleName = useCallback((invoice: InvoiceWithRelations): string => {
    const vehicle = invoice.service?.vehicle || invoice.vehicle;
    if (!vehicle) return 'N/A';
    if (vehicle.name) return vehicle.name;
    if (vehicle.make && vehicle.model) {
      const plateInfo = vehicle.licensePlate ? ` (${vehicle.licensePlate})` : '';
      return `${vehicle.make} ${vehicle.model}${plateInfo}`;
    }
    if (vehicle.licensePlate) return vehicle.licensePlate;
    return vehicle.id.slice(0, 8);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const [servicesData, invoicesData] = await Promise.all([
          fetchCompletedServicesWithoutInvoice(),
          getInvoices()
        ]);

        const typedServices = servicesData as ServiceWithInvoice[];
        const typedInvoices = invoicesData as InvoiceWithRelations[];

        dispatch({ type: 'SET_SERVICES', payload: typedServices });
        dispatch({ type: 'SET_INVOICES', payload: typedInvoices });
      } catch (error: unknown) {
        console.error('Error loading data:', (error as Error).message);
        showNotification('Failed to load data', 'error');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadData();
  }, [showNotification]);

  const handleServiceChange = useCallback(async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    dispatch({ type: 'SET_SELECTED_SERVICE', payload: service });
    dispatch({ type: 'SET_SPARE_PARTS', payload: [] });
    dispatch({ type: 'SET_LABOR_COST', payload: 0 });
    dispatch({ type: 'SET_TAX', payload: 0 });

    try {
      const allParts = await getSparePartRequests(service.id);
      const relatedParts = allParts
        .filter((part: SparePartRequest) => part.status === 'Approved')
        .map((part: SparePartRequest) => ({
          id: part.id,
          partName: part.sparePart?.name || 'Unnamed',
          quantity: part.quantity,
          unitPrice: part.sparePart?.price || 0,
          status: part.status,
          vehicleId: part.vehicleId,
          createdAt: part.createdAt,
        }));
      dispatch({ type: 'SET_SPARE_PARTS', payload: relatedParts });
    } catch (error: unknown) {
      console.error('Error loading parts:', (error as Error).message);
      showNotification('Failed to load spare parts', 'error');
    }
  }, [services, showNotification]);

  const handleCreateInvoice = useCallback(async () => {
    if (!selectedService) return;

    const partsCost = spareParts.reduce(
      (total, part) => total + part.quantity * part.unitPrice,
      0
    );
    const totalAmount = laborCost + partsCost + tax;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newInvoice = await createInvoice({
        serviceId: selectedService.id,
        vehicleId: selectedService.vehicle.id,
        userId: selectedService.mechanic.id,
        items: spareParts.map((part) => ({
          description: part.partName,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          total: part.quantity * part.unitPrice,
        })),
        laborCost,
        partsCost,
        tax,
        totalAmount,
        status: 'Draft',
      });

      const invoiceWithRelations: InvoiceWithRelations = {
        ...newInvoice,
        service: selectedService,
        vehicle: selectedService.vehicle,
        user: selectedService.user
      };

      dispatch({ type: 'SET_SERVICES', payload: services.filter(s => s.id !== selectedService.id) });
      dispatch({ type: 'SET_INVOICES', payload: [invoiceWithRelations, ...invoices] });
      showNotification('Invoice created successfully', 'success');

      dispatch({ type: 'SET_SELECTED_SERVICE', payload: null });
      dispatch({ type: 'SET_SPARE_PARTS', payload: [] });
      dispatch({ type: 'SET_LABOR_COST', payload: 0 });
      dispatch({ type: 'SET_TAX', payload: 0 });
    } catch (error: unknown) {
      showNotification((error as Error).message || 'Failed to create invoice', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [selectedService, spareParts, laborCost, tax, services, invoices, showNotification]);

  const handleEditClick = useCallback((invoice: InvoiceWithRelations) => {
    dispatch({ type: 'SET_SELECTED_INVOICE', payload: invoice });
    dispatch({ type: 'SET_EDIT_MODAL', payload: true });
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!selectedInvoice) return;

    try {
      dispatch({ type: 'SET_SAVE_LOADING', payload: true });
      await updateInvoiceStatus(selectedInvoice.id, selectedInvoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue');

      if (selectedInvoice.status === 'Sent') {
        try {
          const ownerEmail = selectedInvoice.user?.email;
          if (!ownerEmail) {
            throw new Error('Owner email not found');
          }
          await sendInvoiceEmail(selectedInvoice.id, { recipientEmail: ownerEmail });
          showNotification('Invoice updated and email sent successfully', 'success');
        } catch (emailError: unknown) {
          showNotification(
            'Invoice updated but failed to send email: ' + ((emailError as Error).message || 'Unknown error'),
            'warning'
          );
        }
      } else {
        showNotification('Invoice updated successfully', 'success');
      }

      dispatch({
        type: 'SET_INVOICES',
        payload: invoices.map((inv) =>
          inv.id === selectedInvoice.id ? { ...inv, status: selectedInvoice.status } : inv
        ),
      });
      dispatch({ type: 'SET_EDIT_MODAL', payload: false });
    } catch (error: unknown) {
      showNotification((error as Error).message || 'Failed to update invoice', 'error');
    } finally {
      dispatch({ type: 'SET_SAVE_LOADING', payload: false });
    }
  }, [selectedInvoice, invoices, showNotification]);

  const handleDeleteInvoice = useCallback(async () => {
    if (!selectedInvoice) return;

    try {
      dispatch({ type: 'SET_DELETE_LOADING', payload: true });
      await deleteInvoice(selectedInvoice.id);
      dispatch({ type: 'SET_INVOICES', payload: invoices.filter(inv => inv.id !== selectedInvoice.id) });

      if (selectedInvoice.service) {
        const restoredService: ServiceWithInvoice = {
          ...selectedInvoice.service,
          vehicle: selectedInvoice.service.vehicle || selectedInvoice.vehicle || {
            id: selectedInvoice.vehicleId || 'unknown',
            licensePlate: 'Unknown'
          },
          mechanic: selectedInvoice.service.mechanic || { id: selectedInvoice.userId || 'unknown' }
        };
        dispatch({ type: 'SET_SERVICES', payload: [...services, restoredService] });
      }

      showNotification('Invoice deleted successfully', 'warning');
      dispatch({ type: 'SET_EDIT_MODAL', payload: false });
    } catch (error: unknown) {
      showNotification((error as Error).message || 'Failed to delete invoice', 'error');
    } finally {
      dispatch({ type: 'SET_DELETE_LOADING', payload: false });
    }
  }, [selectedInvoice, invoices, services, showNotification]);

  return (
    <Box p={3} className="invoices-container">
      <Typography variant="h5" gutterBottom className="invoices-header">
        Create Invoice
      </Typography>

      {loading && <Loading message="Loading services..." />}

      <FormControl fullWidth sx={{ mb: 2 }} className="invoices-form-control">
        <InputLabel>Completed Services (No Invoice)</InputLabel>
        <Select
          value={selectedService?.id || ''}
          onChange={(e) => handleServiceChange(e.target.value as string)}
          label="Completed Services (No Invoice)"
        >
          {services.length === 0 && (
            <MenuItem disabled>No services available</MenuItem>
          )}
          {services.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {`${service.description} - ${service.vehicle.make} ${service.vehicle.model} (${service.vehicle.licensePlate}) - ${new Date(service.date).toLocaleDateString()}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {spareParts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }} className="invoices-paper">
          <Typography variant="h6" gutterBottom>Spare Parts Used</Typography>
          <Table className="invoices-table">
            <TableHead>
              <TableRow>
                <TableCell>Part Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price (KES)</TableCell>
                <TableCell>Total (KES)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spareParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>{part.partName}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{part.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{(part.quantity * part.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ my: 2 }} />
          <TextField
            label="Labor Cost (KES)"
            type="number"
            value={laborCost}
            onChange={(e) => dispatch({ type: 'SET_LABOR_COST', payload: Number(e.target.value) })}


            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Labor Cost (KES)"
            type="number"
            value={laborCost}
            onChange={(e) => dispatch({ type: 'SET_LABOR_COST', payload: Number(e.target.value) })}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Tax (KES)"
            type="number"
            value={tax}
            onChange={(e) => dispatch({ type: 'SET_TAX', payload: Number(e.target.value) })}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <Typography variant="subtitle1" className="invoices-total-amount">
            <strong>Total Amount:</strong> KES {calculateTotal}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateInvoice}
            sx={{ mt: 2 }}
            disabled={loading}
            className="invoices-generate-btn"
          >
            {loading ? <Loading message="" /> : 'Generate Invoice'}
          </Button>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom className="invoices-header">
        Existing Invoices
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
        <Table stickyHeader className="invoices-table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice Ref</TableCell>
              <TableCell>Service ID</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Total Amount (KES)</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.id.slice(0, 8)}</TableCell>
                <TableCell>{inv.serviceId.slice(0, 8)}</TableCell>
                <TableCell>{getVehicleName(inv)}</TableCell>
                <TableCell>
                  <Chip
                    label={inv.status}
                    color={
                      inv.status === 'Paid'
                        ? 'success'
                        : inv.status === 'Sent'
                        ? 'info'
                        : inv.status === 'Overdue'
                        ? 'error'
                        : 'default'
                    }
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{Number(inv.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditClick(inv)}
                    className="invoices-edit-btn"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={editModal}
        onClose={() => dispatch({ type: 'SET_EDIT_MODAL', payload: false })}
        className="invoices-dialog"
        PaperProps={{ className: 'invoices-dialog-paper' }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="invoices-dialog-title">Invoice Details</DialogTitle>
        <DialogContent className="invoices-dialog-content">
          {selectedInvoice && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                '& > *': {
                  flex: { xs: '1 1 100%', md: '1 1 calc(50% - 24px)' }, // 1 column on xs, 2 columns on md+
                },
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>Invoice Information</Typography>
                <Typography><strong>Invoice ID:</strong> {selectedInvoice.id}</Typography>
                <Typography><strong>Service ID:</strong> {selectedInvoice.serviceId}</Typography>
                <Typography><strong>Vehicle ID:</strong> {selectedInvoice.vehicleId}</Typography>
                <Typography><strong>Vehicle:</strong> {getVehicleName(selectedInvoice)}</Typography>
                <Typography><strong>Created:</strong> {new Date(selectedInvoice.createdAt).toLocaleString()}</Typography>
                <Typography><strong>User ID:</strong> {selectedInvoice.userId}</Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                <Typography><strong>Labor Cost:</strong> KES {Number(selectedInvoice.laborCost).toFixed(2)}</Typography>
                <Typography><strong>Parts Cost:</strong> KES {Number(selectedInvoice.partsCost).toFixed(2)}</Typography>
                <Typography><strong>Tax:</strong> KES {Number(selectedInvoice.tax).toFixed(2)}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  <strong>Total Amount:</strong> KES {Number(selectedInvoice.totalAmount).toFixed(2)}
                </Typography>
              </Box>
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>Invoice Items</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price (KES)</TableCell>
                        <TableCell align="right">Total (KES)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell align="right">{Number(item.total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
              <Box sx={{ flex: '1 1 100%' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Update Status</Typography>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedInvoice.status || ''}
                    label="Status"
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_SELECTED_INVOICE',
                        payload: { ...selectedInvoice, status: e.target.value as 'Draft' | 'Sent' | 'Paid' | 'Overdue' },
                      })
                    }
                  >
                    <MenuItem value="Draft">
                      <Chip label="Draft" color="default" size="small" sx={{ mr: 1 }} />
                      Draft
                    </MenuItem>
                    <MenuItem value="Sent">
                      <Chip label="Sent" color="info" size="small" sx={{ mr: 1 }} />
                      Sent
                    </MenuItem>
                    <MenuItem value="Paid">
                      <Chip label="Paid" color="success" size="small" sx={{ mr: 1 }} />
                      Paid
                    </MenuItem>
                    <MenuItem value="Overdue">
                      <Chip label="Overoverdue" color="error" size="small" sx={{ mr: 1 }} />
                      Overdue
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="invoices-dialog-actions">
          <Button
            color="error"
            onClick={handleDeleteInvoice}
            disabled={deleteLoading || saveLoading}
          >
            {deleteLoading ? <Loading message="" /> : 'Delete'}
          </Button>
          <Button
            onClick={() => dispatch({ type: 'SET_EDIT_MODAL', payload: false })}
            disabled={deleteLoading || saveLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={saveLoading || deleteLoading}
          >
            {saveLoading ? <Loading message="" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => dispatch({ type: 'SET_NOTIFICATION', payload: { ...notification, open: false } })}
      />
    </Box>
  );
};

export default InvoicesTab;