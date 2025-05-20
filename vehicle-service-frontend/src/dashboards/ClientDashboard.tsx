// src/dashboards/DashboardLayout.tsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Container,
  IconButton,
  Badge,
  Avatar
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState("services");
  const navigate = useNavigate();

  // const handlePageChange = (page: string) => {
  //   setActivePage(page);
  //   navigate(`/dashboard/${page}`);
  // };
  const handlePageChange = (page: string) => {
  setActivePage(page);
  navigate(`/${page}`); // Navigate to /services, /book, etc.
};

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#ffffff",
          color: "#2a3e78",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace(/([A-Z])/g, ' $1')}
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: "#4caf50" }}>U</Avatar>
        </Toolbar>
      </AppBar>
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f7fa",
          p: 3,
          minHeight: "100vh"
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};


export default DashboardLayout;