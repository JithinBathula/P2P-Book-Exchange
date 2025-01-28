// src/components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  Home as HomeIcon,
  Book as BookIcon,
  SwapHoriz as SwapIcon,
  Person as PersonIcon
} from '@mui/icons-material';

function Header({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/my-books', label: 'My Books', icon: <BookIcon /> },
    { path: '/my-exchanges', label: 'Exchanges', icon: <SwapIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            P2P Book Exchange
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;