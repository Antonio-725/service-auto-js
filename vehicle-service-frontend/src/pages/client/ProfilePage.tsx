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
  CircularProgress
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
import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt: string;
  notifications?: boolean;
  twoFactorAuth?: boolean;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    id: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    role: 'user',
    createdAt: '',
    notifications: true,
    twoFactorAuth: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await apiClient.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          ...response.data,
          address: response.data.address || '',
          notifications: response.data.notifications !== undefined ? response.data.notifications : true,
          twoFactorAuth: response.data.twoFactorAuth !== undefined ? response.data.twoFactorAuth : false
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'notifications' || name === 'twoFactorAuth' ? checked : value
    }));
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await apiClient.put(`/api/users/${userData.id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 80, height: 80, fontSize: 32, mr: 3 }}>
              {userData.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {userData.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
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

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4 
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" mb={3} fontWeight="bold">
              Personal Information
            </Typography>
            
            <Box mb={3}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={userData.username}
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
                value={userData.phone || ''}
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
                value={userData.address || ''}
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
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" mb={3} fontWeight="bold">
              Account Settings
            </Typography>

            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.notifications || false}
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
                    checked={userData.twoFactorAuth || false}
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
          </Box>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" mt={2}>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>
    </Box>
  );
};

export default ProfilePage;