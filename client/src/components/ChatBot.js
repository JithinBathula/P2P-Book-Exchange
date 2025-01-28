import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fade,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axios from 'axios';


function ChatBot({ accessToken }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{
      type: 'bot',
      content: "Hello! I can help you find the perfect book to exchange. Tell me what kind of books you're interested in or ask for recommendations!"
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExchangeRequest = (book) => {
    setIsOpen(false);
    navigate('/', { state: { selectedBook: book } });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to messages
    const updatedMessages = [...messages, { type: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
        // Send entire conversation history
        const response = await axios.post('/chatbot/recommend', 
          { 
            message: userMessage,
            conversation_history: updatedMessages.slice(0, -1) // Exclude the last message (current user message)
          },
          { 
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
  
        const botResponse = response.data;
        setMessages(messages => [...messages, {
          type: 'bot',
          content: botResponse.message,
          recommendedBook: botResponse.recommendedBook
        }]);
      } catch (error) {
        setMessages(messages => [...messages, {
          type: 'bot',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      {/* Chat Icon Button */}
      <IconButton
        onClick={() => setIsOpen(prev => !prev)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': { bgcolor: 'primary.dark' },
          width: 56,
          height: 56,
          boxShadow: 3,
          zIndex: 1000
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </IconButton>

      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: 3,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Book Recommendation Assistant</Typography>
          </Box>

          
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%'
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                    maxWidth: '80%'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
                
                {message.recommendedBook && (
                  <Box sx={{ width: '80%', mt: 1 }}>
                    <Card sx={{ width: '100%' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {message.recommendedBook.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {message.recommendedBook.author}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 1, pb: 1, pt: 0 }}>
                        <Button 
                          size="small" 
                          variant="contained"
                          fullWidth
                          onClick={() => handleExchangeRequest(message.recommendedBook)}
                          sx={{
                            textTransform: 'none',
                            py: 0.5
                          }}
                        >
                          Request Exchange
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                )}
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>



          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask for book recommendations..."
              multiline
              maxRows={3}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </Paper>
      </Fade>
    </>
  );
}

export default ChatBot;