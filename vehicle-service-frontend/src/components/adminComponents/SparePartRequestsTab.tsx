import React, { useState, useEffect } from 'react';
import { fetchSparePartRequests, updateSparePartRequestStatus } from '../../services/sparePartApi';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Select, 
  MenuItem, 
  Typography, 
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';

// Types
interface SparePartRequest {
  id: string;
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  quantity: number;
  totalPrice?: string; // Changed to string to match API
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  sparePart?: {
    name: string;
    partNumber?: string; // Made optional
    price?: number;
    quantity?: number; // Added for API compatibility
  };
  vehicle?: {
    make: string;
    model: string;
    plate: string;
  };
  mechanic?: {
    id: string;
    username: string;
    email: string;
  };
}

const StatusChip = styled(Chip)({
  fontWeight: 'bold',
  minWidth: 90,
  '&.Pending': {
    backgroundColor: '#fff3e0', // light orange
    color: '#e65100', // dark orange
  },
  '&.Approved': {
    backgroundColor: '#e8f5e9', // light green
    color: '#2e7d32', // dark green
  },
  '&.Rejected': {
    backgroundColor: '#ffebee', // light red
    color: '#c62828', // dark red
  },
});

const SparePartRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<SparePartRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SparePartRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchSparePartRequests();
        console.log('API Response:', data);
        setRequests(data);
      } catch (err) {
        setError('Failed to load spare part requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await updateSparePartRequestStatus(requestId, newStatus);
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status: newStatus } : request
      ));
      setSnackbarMessage(`Request ${newStatus.toLowerCase()} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDialogOpen(false);
    } catch (err) {
      setSnackbarMessage('Failed to update request status');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error(err);
    }
  };

  const handleOpenDialog = (request: SparePartRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price as USD, handling string input
  const formatPrice = (price?: string) => {
    if (price == null) return 'N/A';
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? 'N/A' : `$${numericPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Spare Part Requests
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'primary.contrastText' }}>Part</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Vehicle</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Mechanic</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Requested</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Total Price</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Status</TableCell>
              <TableCell sx={{ color: 'primary.contrastText' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography fontWeight="bold">{request.sparePart?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.sparePart?.partNumber ?? 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{request.vehicle?.make} {request.vehicle?.model}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.vehicle?.plate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{request.mechanic?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.mechanic?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{request.quantity}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{formatDate(request.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{formatPrice(request.totalPrice)}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip label={request.status} className={request.status} />
                  </TableCell>
                  <TableCell>
                    {request.status === 'Pending' && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDialog(request)}
                      >
                        Update Status
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No spare part requests found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <div>
              <Typography gutterBottom>
                <strong>Part:</strong> {selectedRequest.sparePart?.name} ({selectedRequest.sparePart?.partNumber ?? 'N/A'})
              </Typography>
              <Typography gutterBottom>
                <strong>Vehicle:</strong> {selectedRequest.vehicle?.make} {selectedRequest.vehicle?.model} ({selectedRequest.vehicle?.plate})
              </Typography>
              <Typography gutterBottom>
                <strong>Mechanic:</strong> {selectedRequest.mechanic?.username} ({selectedRequest.mechanic?.email})
              </Typography>
              <Typography gutterBottom>
                <strong>Quantity:</strong> {selectedRequest.quantity}
              </Typography>
              <Typography gutterBottom>
                <strong>Total Price:</strong> {formatPrice(selectedRequest.totalPrice)}
              </Typography>
              <Typography gutterBottom>
                <strong>Requested:</strong> {formatDate(selectedRequest.createdAt)}
              </Typography>
              <div style={{ marginTop: '1.5rem' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select new status:
                </Typography>
                <Select
                  fullWidth
                  defaultValue=""
                  displayEmpty
                  inputProps={{ 'aria-label': 'Select status' }}
                >
                  <MenuItem value="" disabled>
                    Select status
                  </MenuItem>
                  <MenuItem value="Approved" onClick={() => handleStatusChange(selectedRequest.id, 'Approved')}>
                    Approve
                  </MenuItem>
                  <MenuItem value="Rejected" onClick={() => handleStatusChange(selectedRequest.id, 'Rejected')}>
                    Reject
                  </MenuItem>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SparePartRequestsManager;