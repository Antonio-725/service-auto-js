import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface DeleteVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  handleDeleteVehicle: () => void;
}

const DeleteVehicleDialog = ({ open, onClose, handleDeleteVehicle }: DeleteVehicleDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
        Confirm Delete
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography>Are you sure you want to delete this vehicle? This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteVehicle}
          sx={{ textTransform: "none", px: 3 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteVehicleDialog;