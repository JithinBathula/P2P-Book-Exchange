// src/pages/MyBooks.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyBooks({ accessToken }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, [accessToken]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/books/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setBooks(response.data);
    } catch (error) {
      setError('Failed to fetch your books');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'pending': return 'warning';
      case 'exchanged': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Books</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/add-book')}
        >
          Add New Book
        </Button>
      </Box>

      {books.length === 0 ? (
        <Alert severity="info">
          You haven't added any books yet. Add books to start exchanging!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{book.title}</Typography>
                    <Chip 
                      label={book.status}
                      color={getStatusColor(book.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    by {book.author}
                  </Typography>
                  {book.description && (
                    <Typography variant="body2" paragraph>
                      {book.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    Added on: {new Date(book.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MyBooks;