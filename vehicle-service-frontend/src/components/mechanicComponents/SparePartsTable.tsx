import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  LinearProgress,
  TextField,
  Chip,
} from '@mui/material';

interface SparePart {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  picture?: string;
  criticalLevel: boolean;
}

interface SelectedPart {
  id: string;
  quantity: number;
}

interface SparePartsTableProps {
  spareParts: SparePart[];
  selectedParts: SelectedPart[];
  handlePartSelection: (partId: string, checked: boolean, quantity?: number) => void;
  handleQuantityChange: (partId: string, value: string) => void;
}

const SparePartsTable: React.FC<SparePartsTableProps> = ({
  spareParts,
  selectedParts,
  handlePartSelection,
  handleQuantityChange,
}) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'primary.light' }}>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell>Part Name</TableCell>
            <TableCell align="center">Stock Level</TableCell>
            <TableCell align="center">Price</TableCell>
            <TableCell align="center">Critical</TableCell>
            <TableCell align="center">Requested Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spareParts.length > 0 ? (
            spareParts.map((part) => (
              <TableRow key={part.id} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedParts.some((p) => p.id === part.id)}
                    onChange={(e) => handlePartSelection(part.id, e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{part.name}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: '60%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, ((part.quantity || 0) / 50) * 100)}
                        color={
                          (part.quantity || 0) > 15
                            ? 'success'
                            : (part.quantity || 0) > 5
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {part.quantity || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="medium">
                    {part.price != null ? `$${part.price.toFixed(2)}` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={part.criticalLevel ? 'Yes' : 'No'}
                    color={part.criticalLevel ? 'error' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="center">
                  {selectedParts.some((p) => p.id === part.id) ? (
                    <TextField
                      type="number"
                      value={selectedParts.find((p) => p.id === part.id)?.quantity || 1}
                      onChange={(e) => handleQuantityChange(part.id, e.target.value)}
                      inputProps={{ min: 1, max: part.quantity || 1 }}
                      sx={{ width: 80 }}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No spare parts available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SparePartsTable;