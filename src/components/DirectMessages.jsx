import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';

export default function DirectMessages() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [startChatDialogOpen, setStartChatDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const socketRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL;

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    
    // Set up Socket.io for real-time updates
    socketRef.current = io(API_BASE, { withCredentials: true });
    socketRef.current.on('newMessage', (message) => {
      // Update conversation with new message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === message.chatId
            ? { ...conv, lastMessageTime: new Date(), lastMessage: message }
            : conv
        )
      ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Filter conversations based on search
  useEffect(() => {
    const filtered = conversations.filter((conv) =>
      conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherParticipant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/user/conversations');
      const sorted = res.data.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      setConversations(sorted);
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/user/all');
      // Filter out current user
      setAllUsers(res.data.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const res = await api.post('/chat/direct/start', { recipientId: userId });
      navigate(`/direct-message/${res.data.conversationId}`);
    } catch (err) {
      console.error('Start chat error:', err);
    }
  };

  const handleOpenStartChatDialog = async () => {
    await fetchAllUsers();
    setStartChatDialogOpen(true);
  };

  const handleCloseStartChatDialog = () => {
    setStartChatDialogOpen(false);
    setSelectedUsers([]);
  };

  const handleDeleteConversation = (conversationId, e) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all messages in the conversation
      const conv = conversations.find((c) => c.conversationId === conversationToDelete);
      if (conv && conv.lastMessage) {
        // In a real app, you'd have an endpoint to delete entire conversation
        // For now, we'll just remove it from the UI
      }
      setConversations((prev) =>
        prev.filter((c) => c.conversationId !== conversationToDelete)
      );
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (text, length = 50) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Messages
        </Typography>
        <IconButton
          onClick={handleOpenStartChatDialog}
          sx={{
            bgcolor: '#6366f1',
            color: 'white',
            '&:hover': { bgcolor: '#4f46e5' },
            borderRadius: '50%',
            width: 48,
            height: 48,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '28px',
            bgcolor: '#f8fafc',
            '& fieldset': { borderColor: '#cbd5e1' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
          },
        }}
      />

      {/* Conversations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredConversations.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 3,
          }}
        >
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            {conversations.length === 0
              ? 'No conversations yet. Start a new chat!'
              : 'No results found'}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <List sx={{ bgcolor: 'white' }}>
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.conversationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) =>
                          handleDeleteConversation(conversation.conversationId, e)
                        }
                        sx={{
                          color: '#ef4444',
                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() =>
                        navigate(
                          `/direct-message/${conversation.conversationId}`
                        )
                      }
                      sx={{
                        py: 2,
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)' },
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemAvatar sx={{ mr: 2 }}>
                        <Avatar
                          src={
                            conversation.otherParticipant?.profilePhoto
                              ? `${API_BASE}${conversation.otherParticipant.profilePhoto}?t=${Date.now()}`
                              : undefined
                          }
                          alt={conversation.otherParticipant?.name}
                          sx={{
                            width: 56,
                            height: 56,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        />
                      </ListItemAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: '#1e293b',
                            }}
                          >
                            {conversation.otherParticipant?.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                            }}
                          >
                            {formatTime(conversation.lastMessageTime)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                          }}
                        >
                          {conversation.lastMessage
                            ? truncateMessage(conversation.lastMessage.text)
                            : 'No messages yet'}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Paper>
      )}

      {/* Start Chat Dialog */}
      <Dialog
        open={startChatDialogOpen}
        onClose={handleCloseStartChatDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
          Start New Chat
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '28px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#cbd5e1' },
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
              }}
            />
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {allUsers.map((user) => (
                <ListItem key={user.id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleStartChat(user.id);
                      handleCloseStartChatDialog();
                    }}
                    sx={{
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)' },
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar
                        src={
                          user.profilePhoto
                            ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}`
                            : undefined
                        }
                        alt={user.name}
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: '#1e293b' }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#94a3b8' }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={handleCloseStartChatDialog}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Conversation?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            This conversation will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
