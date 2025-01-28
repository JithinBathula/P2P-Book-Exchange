import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import Auth from './pages/Auth';
import Home from './pages/Home';
import MyBooks from './pages/MyBooks';
import AddBook from './pages/AddBook';
import MyExchanges from './pages/MyExchanges';
import Profile from './pages/Profile';
import ChatBot from './components/ChatBot';

import './styles/App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');
    
    if (storedToken && storedUsername) {
      setAccessToken(storedToken);
      setUser({ username: storedUsername });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setAccessToken(null);
    setUser(null);
  };


  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        {user && <><Header user={user} onLogout={handleLogout} />
        <ChatBot 
              accessToken={accessToken}/></>}

        <main className="main-content">
          <Routes>
            <Route 
              path="/auth" 
              element={!user ? (
                <Auth setAccessToken={setAccessToken} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )} 
            />
            
            <Route 
              path="/" 
              element={user ? <Home accessToken={accessToken} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/my-books" 
              element={user ? <MyBooks accessToken={accessToken} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/add-book" 
              element={user ? <AddBook accessToken={accessToken} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/my-exchanges" 
              element={user ? <MyExchanges accessToken={accessToken} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} accessToken={accessToken} /> : <Navigate to="/auth" replace />} 
            />
            <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;