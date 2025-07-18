import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button } from "@mui/material";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

interface VehicleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVehicleDetails: Vehicle | null;
}

const VehicleDetailsDialog = ({ open, onClose, selectedVehicleDetails }: VehicleDetailsDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
        Vehicle Details
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {selectedVehicleDetails ? (
          <Box>
            <Typography>
              <strong>Make:</strong> {selectedVehicleDetails.make}
            </Typography>
            <Typography>
              <strong>Model:</strong> {selectedVehicleDetails.model}
            </Typography>
            <Typography>
              <strong>Year:</strong> {selectedVehicleDetails.year}
            </Typography>
            <Typography>
              <strong>Plate:</strong> {selectedVehicleDetails.plate}
            </Typography>
          </Box>
        ) : (
          <Typography>No details found.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleDetailsDialog;