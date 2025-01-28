// src/pages/MyExchanges.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Box,
  Divider
} from '@mui/material';
import axios from 'axios';

function MyExchanges({ accessToken }) {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0); // 0: Received, 1: Sent

  useEffect(() => {
    fetchExchanges();
  }, [accessToken]);

  const fetchExchanges = async () => {
    try {
      const response = await axios.get('/exchanges', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setExchanges(response.data);
    } catch (error) {
      setError('Failed to fetch exchanges');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeAction = async (exchangeId, action) => {
    try {
      await axios.put(`/exchanges/${exchangeId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      fetchExchanges();
      alert(`Exchange ${action} successfully`);
    } catch (error) {
      setError(error.response?.data?.msg || `Failed to ${action} exchange`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const receivedRequests = exchanges.filter(ex => ex.is_owner);
  const sentRequests = exchanges.filter(ex => !ex.is_owner);
  const displayExchanges = tab === 0 ? receivedRequests : sentRequests;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Exchange Requests
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
        >
          <Tab label={`Received Requests (${receivedRequests.length})`} />
          <Tab label={`Sent Requests (${sentRequests.length})`} />
        </Tabs>
      </Paper>

      {displayExchanges.length === 0 ? (
        <Alert severity="info">
          No {tab === 0 ? 'received' : 'sent'} exchange requests found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayExchanges.map((exchange) => (
            <Grid item xs={12} key={exchange.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Exchange Request {tab === 0 ? 'from' : 'to'} {tab === 0 ? exchange.requester_username : exchange.owner}
                    </Typography>
                    <Chip 
                      label={exchange.status}
                      color={getStatusColor(exchange.status)}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Requested Book:</Typography>
                      <Typography>
                        "{exchange.book_title}" by {exchange.book_author}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Offered Book:</Typography>
                      <Typography>
                        "{exchange.offered_book_title}" by {exchange.offered_book_author}
                      </Typography>
                    </Grid>
                  </Grid>

                  {tab === 0 && exchange.status === 'pending' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleExchangeAction(exchange.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleExchangeAction(exchange.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}

                  {exchange.status === 'accepted' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Exchange accepted! Please contact {tab === 0 ? exchange.requester_username : exchange.owner} to arrange the exchange.
                    </Alert>
                  )}

                  <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                    Requested on: {new Date(exchange.created_at).toLocaleString()}
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

export default MyExchanges;