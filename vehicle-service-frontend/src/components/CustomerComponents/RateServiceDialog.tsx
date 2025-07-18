import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Rating, TextField, Button, CircularProgress } from "@mui/material";
import Notification from "../../components/usables/Notification";

interface RateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  ratingValue: number | null;
  setRatingValue: (value: number | null) => void;
  ratingComment: string;
  setRatingComment: (value: string) => void;
  ratingError: string | null;
  setRatingError: (value: string | null) => void;
  ratingSuccess: string | null;
  setRatingSuccess: (value: string | null) => void;
  handleRateService: () => void;
  loading: boolean;
}

const RateServiceDialog = ({
  open,
  onClose,
  ratingValue,
  setRatingValue,
  ratingComment,
  setRatingComment,
  ratingError,
  setRatingError,
  ratingSuccess,
  setRatingSuccess,
  handleRateService,
  loading,
}: RateServiceDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: "#2a3e78", color: "white", fontWeight: "bold" }}>
        Rate This Service
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            How would you rate this service?
          </Typography>
          <Rating
            value={ratingValue}
            onChange={(_, newValue) => setRatingValue(newValue)}
            size="large"
            precision={1}
            sx={{ color: "#f59e0b" }}
          />
          <TextField
            label="Comment (optional)"
            multiline
            rows={3}
            fullWidth
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            sx={{ mt: 2 }}
          />
          {ratingError && (
            <Notification
              open={!!ratingError}
              message={ratingError}
              type="error"
              onClose={() => setRatingError(null)}
            />
          )}
          {ratingSuccess && (
            <Notification
              open={!!ratingSuccess}
              message={ratingSuccess}
              type="success"
              onClose={() => setRatingSuccess(null)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none" }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRateService}
          disabled={ratingValue === null || loading}
          sx={{
            textTransform: "none",
            px: 3,
            bgcolor: "#2a3e78",
            "&:hover": { bgcolor: "#1e2a5a" },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Rating"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RateServiceDialog;