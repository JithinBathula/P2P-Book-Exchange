// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Add this import
import axios from 'axios';

function Home({ accessToken }) {
  const [books, setBooks] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchangeDialog, setExchangeDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [exchangeForm, setExchangeForm] = useState({
    offeredBookId: '',
    newBookTitle: '',
    newBookAuthor: '',
    newBookDescription: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchUserBooks();
  }, [accessToken]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/books', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setBooks(response.data);
    } catch (error) {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUserBooks = async () => {
    try {
      const response = await axios.get('/books/user?for_exchange=true', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUserBooks(response.data);
    } catch (error) {
      console.error('Failed to fetch user books');
    }
  };

  const handleExchangeRequest = async () => {
    try {
      const data = exchangeForm.offeredBookId
        ? {
            book_id: selectedBook.id,
            offered_book_id: exchangeForm.offeredBookId
          }
        : {
            book_id: selectedBook.id,
            offered_book_title: exchangeForm.newBookTitle,
            offered_book_author: exchangeForm.newBookAuthor,
            offered_book_description: exchangeForm.newBookDescription
          };

      await axios.post('/request', data, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setExchangeDialog(false);
      fetchBooks();
      fetchUserBooks();
      alert('Exchange request sent successfully!');
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to request exchange');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Available Books for Exchange
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search books by title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Changed this part to use filteredBooks */}
      {filteredBooks.length === 0 ? (
        <Alert severity="info">
          {books.length === 0 ? "No books available for exchange." : "No books match your search."}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography color="textSecondary">by {book.author}</Typography>
                  {book.description && (
                    <Typography variant="body2" paragraph>
                      {book.description}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block">
                    Owner: {book.owner}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSelectedBook(book);
                      setExchangeDialog(true);
                      setExchangeForm({
                        offeredBookId: '',
                        newBookTitle: '',
                        newBookAuthor: '',
                        newBookDescription: ''
                      });
                    }}
                  >
                    Request Exchange
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={exchangeDialog} 
        onClose={() => setExchangeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Exchange</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select your book to offer</InputLabel>
            <Select
              value={exchangeForm.offeredBookId}
              onChange={(e) => setExchangeForm({
                ...exchangeForm,
                offeredBookId: e.target.value
              })}
            >
              <MenuItem value="">Offer a new book instead</MenuItem>
              {userBooks.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!exchangeForm.offeredBookId && (
            <>
              <TextField
                fullWidth
                label="New Book Title"
                value={exchangeForm.newBookTitle}
                onChange={(e) => setExchangeForm({
                  ...exchangeForm,
                  newBookTitle: e.target.value
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="New Book Author"
                value={exchangeForm.newBookAuthor}
                onChange={(e) => setExchangeForm({
                  ...exchangeForm,
                  newBookAuthor: e.target.value
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Book Description"
                value={exchangeForm.newBookDescription}
                onChange={(e) => setExchangeForm({
                  ...exchangeForm,
                  newBookDescription: e.target.value
                })}
                margin="normal"
                multiline
                rows={3}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExchangeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleExchangeRequest}
            variant="contained"
            disabled={
              !exchangeForm.offeredBookId &&
              (!exchangeForm.newBookTitle || !exchangeForm.newBookAuthor)
            }
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Home;