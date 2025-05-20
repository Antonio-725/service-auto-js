import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  TextField, 
  Button, 
  Divider, 
  Switch,
  FormControlLabel,
  Grid
} from "@mui/material";
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon
} from "@mui/icons-material";
import { useState } from "react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
    address: "1234 Main St, Nairobi, Kenya",
    notifications: true,
    twoFactorAuth: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'notifications' || name === 'twoFactorAuth' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically call an API to save the changes
    console.log("Saved:", userData);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 80, height: 80, fontSize: 32, mr: 3 }}>
              {userData.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {userData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Client since May 2023
              </Typography>
            </Box>
          </Box>
          {isEditing ? (
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6} component="div">
            <Typography variant="h6" mb={3} fontWeight="bold">
              Personal Information
            </Typography>
            
            <Box mb={3}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <AccountCircleIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Box>

            <Box mb={3}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Box>

            <Box mb={3}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <PhoneIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={userData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <LocationIcon color="action" sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} component="div">
            <Typography variant="h6" mb={3} fontWeight="bold">
              Account Settings
            </Typography>

            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.notifications}
                    onChange={handleInputChange}
                    name="notifications"
                    color="primary"
                    disabled={!isEditing}
                  />
                }
                label={
                  <Box>
                    <Typography>Email Notifications</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive important updates and reminders
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.twoFactorAuth}
                    onChange={handleInputChange}
                    name="twoFactorAuth"
                    color="primary"
                    disabled={!isEditing}
                  />
                }
                label={
                  <Box>
                    <Typography>Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Extra layer of security for your account
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </Paper>

            <Button
              variant="outlined"
              color="error"
              startIcon={<LockIcon />}
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>

            {isEditing && (
              <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button 
                  variant="text" 
                  onClick={() => setIsEditing(false)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="body2" color="text.secondary" mt={2}>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>
    </Box>
  );
};

export default ProfilePage;