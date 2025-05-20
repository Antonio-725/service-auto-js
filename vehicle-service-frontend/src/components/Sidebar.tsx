import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Divider, Box, Avatar, Typography,
} from "@mui/material";
import {
  DirectionsCar as ServicesIcon, CalendarMonth as BookIcon, Receipt as PaymentsIcon,
  Notifications as NotificationsIcon, AccountCircle as ProfileIcon, SupportAgent as SupportIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = location.pathname.split("/")[1] || "services";

  const menuItems = [
    { text: "My Services", icon: <ServicesIcon />, page: "services", path: "/services" },
    { text: "Book a Service", icon: <BookIcon />, page: "book", path: "/book" },
    { text: "Payments", icon: <PaymentsIcon />, page: "payments", path: "/payments" },
    { text: "Notifications", icon: <NotificationsIcon />, page: "notifications", path: "/notifications" },
    { text: "My Profile", icon: <ProfileIcon />, page: "profile", path: "/profile" },
    { text: "Support", icon: <SupportIcon />, page: "support", path: "/support" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#2a3e78",
          color: "white",
        },
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" p={2}>
          <Avatar sx={{ bgcolor: "#4caf50", mr: 2 }}>C</Avatar>
          <Typography variant="h6" fontWeight="bold">
            Client Portal
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton
              selected={activePage === item.page}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: activePage === item.page ? "bold" : "medium" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;