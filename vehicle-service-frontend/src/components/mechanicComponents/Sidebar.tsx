/* src/components/mechanicComponents/Sidebar.tsx */
import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Divider, Typography, Box, Button, Avatar, 
  Paper, useTheme 
} from "@mui/material";
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/apiClient";
import { deepPurple } from '@mui/material/colors';

interface SidebarProps {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  user: string;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedPage, setSelectedPage, user }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <AssignmentIcon /> },
    { id: 'history', label: 'Task History', icon: <HistoryIcon /> },
    { id: 'spareParts', label: 'Spare Parts', icon: <BuildIcon /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: deepPurple[700],
          color: '#ffffff',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ 
          color: '#ffffff', 
          fontWeight: 700,
          letterSpacing: 0.5,
          mb: 1
        }}>
          Mechanic Portal
        </Typography>
      </Box>
      
      {/* User Profile Section */}
      <Paper sx={{ 
        mx: 2, 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ 
          bgcolor: deepPurple[500],
          width: 48,
          height: 48
        }}>
          <PersonOutlineIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {user}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Master Technician
          </Typography>
        </Box>
      </Paper>
      
      <Divider sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        mx: 2,
        mb: 1
      }} />
      
      <List sx={{ px: 2 }}>
        {sidebarItems.map(item => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedPage === item.id}
              onClick={() => setSelectedPage(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedPage === item.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontWeight: selectedPage === item.id ? 600 : 500,
                  fontSize: '0.95rem'
                }}
              />
              {selectedPage === item.id && (
                <Box sx={{
                  width: 4,
                  height: 24,
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: '4px 0 0 4px',
                  ml: 1
                }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        mx: 2,
        mt: 1
      }} />
      
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: theme.palette.secondary.dark
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;