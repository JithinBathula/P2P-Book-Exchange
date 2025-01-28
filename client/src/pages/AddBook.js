// src/pages/AddBook.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddBook({ accessToken }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/books', formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      navigate('/my-books');
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Add New Book</Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Author"
            name="author"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            margin="normal"
            multiline
            rows={4}
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={() => navigate('/my-books')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default AddBook;