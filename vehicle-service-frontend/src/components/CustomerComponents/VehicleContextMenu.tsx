import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Receipt, Edit, Delete } from "@mui/icons-material";

interface VehicleContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  handleViewVehicleDetails: () => void;
  handleEditVehicle: () => void;
  handleOpenDeleteDialog: () => void;
}

const VehicleContextMenu = ({
  anchorEl,
  open,
  onClose,
  handleViewVehicleDetails,
  handleEditVehicle,
  handleOpenDeleteDialog,
}: VehicleContextMenuProps) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={handleViewVehicleDetails}>
        <ListItemIcon>
          <Receipt fontSize="small" />
        </ListItemIcon>
        <ListItemText>View Details</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleEditVehicle}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Vehicle</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleOpenDeleteDialog}>
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Delete Vehicle</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default VehicleContextMenu;