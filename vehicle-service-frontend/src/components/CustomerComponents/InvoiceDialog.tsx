
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import type { ChipProps } from "@mui/material/Chip"; // Import ChipProps for color type
import Loading from "../../components/usables/Loading";
import Notification from "../../components/usables/Notification";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  sentAt?: string | null;
  items: InvoiceItem[];
  service?: {
    description: string;
    date: string;
  };
  vehicle?: {
    plate: string;
  };
}

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  selectedInvoice: Invoice | null;
  invoiceError: string | null;
  setInvoiceError: (value: string | null) => void;
  loading: boolean;
  getStatusColor: (status: string) => ChipProps["color"]; // Use ChipProps["color"] type
  formatCurrency: (value: number | string | undefined) => string;
  formatDate: (dateString: string) => string;
}

const InvoiceDialog = ({
  open,
  onClose,
  selectedInvoice,
  invoiceError,
  setInvoiceError,
  loading,
  getStatusColor,
  formatCurrency,
  formatDate,
}: InvoiceDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "1rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          maxHeight: "85vh",
          margin: "1rem",
        },
      }}
    >
      <Box sx={{ position: "relative", bgcolor: "#2a3e78", p: 2 }}>
        <DialogTitle sx={{ color: "white", fontWeight: "bold", fontSize: "1.75rem", p: 0 }}>
          {selectedInvoice && `Invoice #${selectedInvoice.id.slice(0, 8)}`}
        </DialogTitle>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "#ffffff",
            bgcolor: "#ffffff1f",
            "&:hover": { bgcolor: "#ffffff3f" },
          }}
        >
          <Typography sx={{ fontSize: "1.25rem" }}>×</Typography>
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3, bgcolor: "#ffffff" }}>
        {loading ? (
          <Loading message="Fetching invoice details..." />
        ) : invoiceError ? (
          <Notification
            open={!!invoiceError}
            message={invoiceError}
            type="error"
            onClose={() => setInvoiceError(null)}
          />
        ) : selectedInvoice ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                pb: 2,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Invoice #{selectedInvoice.id.slice(0, 8)}
              </Typography>
              <Chip
                label={selectedInvoice.status.toUpperCase()}
                color={getStatusColor(selectedInvoice.status)}
                sx={{ textTransform: "uppercase", fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 1.5, fontSize: "1.125rem" }}>
                Details
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Service: {selectedInvoice.service?.description || "N/A"}
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Vehicle Plate: {selectedInvoice.vehicle?.plate || "N/A"}
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Created: {formatDate(selectedInvoice.createdAt)}
              </Typography>
              {selectedInvoice.sentAt && (
                <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                  Sent: {formatDate(selectedInvoice.sentAt)}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 1.5, fontSize: "1.125rem" }}>
                Invoice Items
              </Typography>
              <Table sx={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
                <TableHead sx={{ bgcolor: "#f9fafb" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                      Description
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                      Quantity
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                      Unit Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { bgcolor: "#f9fafb" },
                        borderTop: index !== 0 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.875rem", color: "#475569" }}>
                        {item.description}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                        KES {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.875rem", color: "#475569" }}>
                        KES {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ textAlign: "right", pt: 2, borderTop: "1px solid #e5e7eb" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                Total: KES {formatCurrency(selectedInvoice.totalAmount)}
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#475569", mt: 0.5 }}>
                Status: {selectedInvoice.status.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography>No invoice data available.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#2a3e78",
            "&:hover": { bgcolor: "#e8eaf6" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;
