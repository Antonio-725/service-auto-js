import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
  Chip,
  Box,
  LinearProgress,
  Tooltip,
  useTheme
} from "@mui/material";
import {
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Info as InfoIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";

interface SparePart {
  id: string;
  name: string;
  stock?: number;
}

interface SparePartRequest {
  id: string;
  sparePartId: string;
  mechanicId: string;
  mechanicName?: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  createdAt: string;
  updatedAt: string;
  sparePart?: SparePart;
}

interface Props {
  requests: SparePartRequest[];
  loading: boolean;
  spareParts?: SparePart[];
  onRequestClick?: (requestId: string) => void;
}

const RecentSparePartRequestsCard: React.FC<Props> = ({ 
  requests = [], 
  loading = false, 
  spareParts = [],
  onRequestClick 
}) => {
  const theme = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <ApprovedIcon color="success" fontSize="small" />;
      case 'Rejected':
        return <RejectedIcon color="error" fontSize="small" />;
      case 'Fulfilled':
        return <ShippingIcon color="secondary" fontSize="small" />;
      default:
        return <PendingIcon color="warning" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return theme.palette.success.main;
      case 'Rejected':
        return theme.palette.error.main;
      case 'Fulfilled':
        return theme.palette.secondary.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
      };

      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
          return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
      }
      
      return 'Just now';
    } catch {
      return 'Unknown time';
    }
  };

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Recent Requests
            </Typography>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Requests
          </Typography>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight={120}
            textAlign="center"
          >
            <InventoryIcon color="disabled" fontSize="large" />
            <Typography color="text.secondary" mt={1}>
              No recent spare part requests
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Recent Requests
          </Typography>
          <Tooltip title="Shows your last 5 requests">
            <InfoIcon color="action" fontSize="small" />
          </Tooltip>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Part Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Qty</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Requested</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.slice(0, 5).map((req) => {
                const partName = req.sparePart?.name || 
                  (Array.isArray(spareParts) ? spareParts.find((sp) => sp.id === req.sparePartId)?.name : null) || 
                  'Unknown Part';
                
                const stockLevel = req.sparePart?.stock || 
                  (Array.isArray(spareParts) ? spareParts.find((sp) => sp.id === req.sparePartId)?.stock : undefined);

                return (
                  <TableRow 
                    key={req.id} 
                    hover 
                    onClick={() => onRequestClick?.(req.id)}
                    sx={{ 
                      cursor: onRequestClick ? 'pointer' : 'default',
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">{partName}</Typography>
                        {stockLevel !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            Stock: {stockLevel}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={req.quantity} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(req.status)}
                        label={req.status}
                        size="small"
                        sx={{ 
                          backgroundColor: `${getStatusColor(req.status)}20`,
                          color: getStatusColor(req.status),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={new Date(req.createdAt).toLocaleString()}>
                        <Typography variant="body2">
                          {formatTimeAgo(req.createdAt)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {requests.length > 5 && (
          <Box mt={1} textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Showing 5 of {requests.length} requests
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSparePartRequestsCard;