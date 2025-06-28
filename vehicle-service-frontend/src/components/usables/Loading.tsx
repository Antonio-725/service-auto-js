//components/usables/Loading.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string; // Optional message to display below the loader
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Full viewport height to prevent blank page
        bgcolor: 'background.default', // Matches MUI theme background
        textAlign: 'center',
        p: 3,
      }}
    >
      <CircularProgress
        size={60} // Larger size for visibility
        thickness={4} // Slightly thicker for a modern look
        sx={{ mb: 2, color: 'primary.main' }} // Primary color from MUI theme
      />
      <Typography
        variant="h6"
        color="text.primary"
        sx={{ fontWeight: 'medium', maxWidth: '400px' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
