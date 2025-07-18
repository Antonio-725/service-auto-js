
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";

interface EditVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  editVehicleData: { id: string; make: string; model: string; year: string; plate: string };
  setEditVehicleData: (data: { id: string; make: string; model: string; year: string; plate: string }) => void;
  handleEditVehicle: () => void;
}

const EditVehicleDialog = ({ open, onClose, editVehicleData, setEditVehicleData, handleEditVehicle }: EditVehicleDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
        Edit Vehicle
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            "& > *": {
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)" }, // Full width on xs, 50% width on sm+
            },
          }}
        >
          <TextField
            label="Make"
            fullWidth
            margin="normal"
            value={editVehicleData.make}
            onChange={(e) => setEditVehicleData({ ...editVehicleData, make: e.target.value })}
          />
          <TextField
            label="Model"
            fullWidth
            margin="normal"
            value={editVehicleData.model}
            onChange={(e) => setEditVehicleData({ ...editVehicleData, model: e.target.value })}
          />
          <TextField
            label="Year"
            fullWidth
            margin="normal"
            type="number"
            value={editVehicleData.year}
            onChange={(e) => setEditVehicleData({ ...editVehicleData, year: e.target.value })}
          />
          <TextField
            label="Plate Number"
            fullWidth
            margin="normal"
            value={editVehicleData.plate}
            onChange={(e) => setEditVehicleData({ ...editVehicleData, plate: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleEditVehicle}
          disabled={!editVehicleData.make || !editVehicleData.model || !editVehicleData.year || !editVehicleData.plate}
          sx={{
            textTransform: "none",
            px: 3,
            bgcolor: "#2a3e78",
            "&:hover": { bgcolor: "#1e2a5a" },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVehicleDialog;
