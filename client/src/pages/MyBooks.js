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
  Box,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyBooks({ accessToken }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Available for Exchange';
      case 'pending': return 'Exchange in Progress';
      case 'exchanged': return 'Successfully Exchanged';
      default: return status;
    }
  };

  const filterBooks = (status) => {
    switch (status) {
      case 0: // Available
        return books.filter(book => book.status === 'available');
      case 1: // In Progress
        return books.filter(book => book.status === 'pending');
      case 2: // Completed
        return books.filter(book => book.status === 'exchanged');
      default:
        return [];
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const availableBooks = filterBooks(0);
  const pendingBooks = filterBooks(1);
  const exchangedBooks = filterBooks(2);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Book Collection</Typography>
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
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab 
                label={`Available (${availableBooks.length})`} 
                sx={{ fontWeight: 'bold' }}
              />
              <Tab 
                label={`In Progress (${pendingBooks.length})`}
                sx={{ fontWeight: 'bold' }}
              />
              <Tab 
                label={`Exchanged (${exchangedBooks.length})`}
                sx={{ fontWeight: 'bold' }}
              />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {filterBooks(activeTab).map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2 
                    }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {book.title}
                      </Typography>
                      <Chip 
                        label={getStatusLabel(book.status)}
                        color={getStatusColor(book.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Typography color="textSecondary" gutterBottom>
                      by {book.author}
                    </Typography>
                    
                    {book.description && (
                      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                        {book.description}
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="caption" color="textSecondary">
                      Added on: {new Date(book.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filterBooks(activeTab).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {activeTab === 0 && "You don't have any books available for exchange."}
              {activeTab === 1 && "You don't have any ongoing exchanges."}
              {activeTab === 2 && "You haven't completed any exchanges yet."}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
}

export default MyBooks;