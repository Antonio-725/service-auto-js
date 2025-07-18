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
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// Types
interface SparePartRequest {
  id: string;
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  quantity: number;
  totalPrice?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  sparePart?: {
    name: string;
    partNumber?: string;
    price?: number;
    quantity?: number;
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
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  '&.Approved': {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  '&.Rejected': {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
});

const SparePartRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<SparePartRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SparePartRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SparePartRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchSparePartRequests();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        setError('Failed to load spare part requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, timeFilter, requests]);

  const filterRequests = () => {
    let result = [...requests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        request.sparePart?.name?.toLowerCase().includes(term) ||
        request.vehicle?.make?.toLowerCase().includes(term) ||
        request.vehicle?.model?.toLowerCase().includes(term) ||
        request.mechanic?.username?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      result = result.filter(request => {
        const requestDate = new Date(request.createdAt);
        const diffInDays = (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (timeFilter) {
          case 'today':
            return diffInDays < 1;
          case 'week':
            return diffInDays < 7;
          case 'month':
            return diffInDays < 30;
          default:
            return true;
        }
      });
    }

    // Sort by newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRequests(result);
  };

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

  const formatPrice = (price: unknown) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;

    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="2rem">
        <CircularProgress />
      </Box>
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
    <Box sx={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Spare Part Requests
      </Typography>

      {/* Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search requests..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, newFilter) => setStatusFilter(newFilter || 'all')}
          size="small"
          aria-label="Filter by status"
        >
          <ToggleButton value="all" aria-label="All statuses">
            <FilterIcon sx={{ mr: 1 }} />
            All
          </ToggleButton>
          <ToggleButton value="Pending" aria-label="Pending">
            <PendingIcon sx={{ mr: 1 }} />
            Pending
          </ToggleButton>
          <ToggleButton value="Approved" aria-label="Approved">
            <ApprovedIcon sx={{ mr: 1 }} />
            Approved
          </ToggleButton>
          <ToggleButton value="Rejected" aria-label="Rejected">
            <RejectedIcon sx={{ mr: 1 }} />
            Rejected
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={(_, newFilter) => setTimeFilter(newFilter || 'all')}
          size="small"
          aria-label="Filter by time"
        >
          <ToggleButton value="all" aria-label="All time">
            <SortIcon sx={{ mr: 1 }} />
            All Time
          </ToggleButton>
          <ToggleButton value="today" aria-label="Today">
            Today
          </ToggleButton>
          <ToggleButton value="week" aria-label="This week">
            This Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="This month">
            This Month
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Scrollable Table Container */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TableContainer 
          component={Paper} 
          elevation={3} 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            '& .MuiTableCell-root': {
              padding: '12px 16px',
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'primary.contrastText', minWidth: 180 }}>Part</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', minWidth: 180 }}>Vehicle</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', minWidth: 180 }}>Mechanic</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', width: 100 }}>Quantity</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', minWidth: 180 }}>Requested</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', width: 120 }}>Total Price</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', width: 120 }}>Status</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', width: 150 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
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
                    <Typography color="text.secondary">No matching requests found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
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
              <Box sx={{ marginTop: '1.5rem' }}>
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
              </Box>
            </Box>
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
    </Box>
  );
};

export default SparePartRequestsManager;