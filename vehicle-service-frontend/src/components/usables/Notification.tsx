//components/usables/Notification.tsx
import React from 'react';
import { Box, Typography, IconButton, Snackbar } from '@mui/material';
import { Close as CloseIcon, CheckCircle as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';

interface NotificationProps {
  open: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoHideDuration?: number; // Optional duration in milliseconds
}

const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  type,
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Centered at bottom
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: type === 'success' ? 'success.main' : 'error.main', // Green for success, red for error
          color: 'white',
          p: 2,
          borderRadius: 1,
          boxShadow: 3,
          minWidth: '300px',
          maxWidth: '500px',
        }}
      >
        {type === 'success' ? (
          <SuccessIcon sx={{ mr: 1, fontSize: 24 }} />
        ) : (
          <ErrorIcon sx={{ mr: 1, fontSize: 24 }} />
        )}
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {message}
        </Typography>
        <IconButton size="small" color="inherit" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
};

export default Notification;
