import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleData: { make: string; model: string; year: string; plate: string };
  setVehicleData: (data: { make: string; model: string; year: string; plate: string }) => void;
  handleAddVehicle: () => void;
}

const AddVehicleDialog = ({ open, onClose, vehicleData, setVehicleData, handleAddVehicle }: AddVehicleDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
        Add a New Vehicle
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            "& > *": {
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)" }, // 1 column on xs, 2 columns on sm+
            },
          }}
        >
          <TextField
            label="Make"
            fullWidth
            margin="normal"
            value={vehicleData.make}
            onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
          />
          <TextField
            label="Model"
            fullWidth
            margin="normal"
            value={vehicleData.model}
            onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
          />
          <TextField
            label="Year"
            fullWidth
            margin="normal"
            type="number"
            value={vehicleData.year}
            onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
          />
          <TextField
            label="Plate Number"
            fullWidth
            margin="normal"
            value={vehicleData.plate}
            onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
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
  );
};

export default AddVehicleDialog;