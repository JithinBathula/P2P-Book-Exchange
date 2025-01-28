// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import axios from 'axios';

function Profile({ accessToken }) {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [accessToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUserData(response.data);
    } catch (error) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.put('/user/profile', userData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update profile');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={userData.username}
            margin="normal"
            disabled
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={userData.location}
            onChange={(e) => setUserData({ ...userData, location: e.target.value })}
            margin="normal"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Update Profile
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Profile;