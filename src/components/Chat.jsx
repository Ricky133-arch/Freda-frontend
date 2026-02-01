import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';

export default function Chat() {
  const { chatId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL;

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format date for display
  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const messageDate = new Date(date);
    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();
    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return messageDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let lastDate = null;

    messages.forEach((msg, index) => {
      const messageDate = new Date(msg.timestamp);
      const dateKey = messageDate.toDateString();

      if (lastDate !== dateKey) {
        grouped.push({
          type: 'date',
          id: `date-${dateKey}-${index}`,
          date: messageDate,
        });
        lastDate = dateKey;
      }
      grouped.push({ type: 'message', data: msg });
    });

    return grouped;
  };

  useEffect(() => {
    socketRef.current = io(API_BASE, { withCredentials: true });
    socketRef.current.emit('joinChat', chatId);

    socketRef.current.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    api
      .get(`/chat/${chatId}`)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        console.error('Fetch messages error:', err);
        setLoading(false);
      });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    socketRef.current.emit('sendMessage', {
      chatId,
      text: newMessage,
      sender: user.id,
      type: 'text',
    });
    setNewMessage('');
    setSending(false);
  };

  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await api.delete(`/chat/message/${messageToDelete}`);
      socketRef.current.emit('deleteMessage', { chatId, messageId: messageToDelete });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleProfileClick = async (userId) => {
    try {
      const res = await api.get(`/user/${userId}`);
      setSelectedUser(res.data);
      setProfileDialogOpen(true);
    } catch (err) {
      console.error('Fetch user profile error:', err);
    }
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        maxWidth: { xs: '100%', sm: 600 },
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 2,
          mb: 2,
          bgcolor: 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Group Chat
        </Typography>
      </Paper>

      {/* Messages Container */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} thickness={4.5} />
          </Box>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: { xs: 2, sm: 3 },
              pb: 1,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-track': { background: '#f1f5f9', borderRadius: '8px' },
              '&::-webkit-scrollbar-thumb': {
                background: '#94a3b8',
                borderRadius: '8px',
                '&:hover': { background: '#64748b' },
              },
            }}
          >
            <AnimatePresence>
              {groupMessagesByDate(messages).map((item, index) =>
                item.type === 'date' ? (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        my: 3,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        label={formatDateLabel(item.date)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(99, 102, 241, 0.15)',
                          color: '#6366f1',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          px: 2,
                          py: 0.5,
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.data._id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent:
                          item.data.sender._id === user.id ? 'flex-end' : 'flex-start',
                        mb: 2,
                        position: 'relative',
                        '&:hover .delete-button': { opacity: 1 },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 1.5,
                          maxWidth: '78%',
                        }}
                      >
                        {/* Avatar (others only) */}
                        {item.data.sender._id !== user.id && (
                          <Avatar
                            src={
                              item.data.sender.profilePhoto
                                ? `${API_BASE}${item.data.sender.profilePhoto}?t=${Date.now()}`
                                : undefined
                            }
                            alt={item.data.sender.name}
                            sx={{
                              width: 40,
                              height: 40,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)' },
                            }}
                            onClick={() => handleProfileClick(item.data.sender._id)}
                          />
                        )}

                        {/* Message Bubble */}
                        <Box
                          sx={{
                            p: { xs: 1.8, sm: 2 },
                            borderRadius: '20px',
                            background:
                              item.data.sender._id === user.id
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : '#ffffff',
                            color:
                              item.data.sender._id === user.id ? 'white' : '#1e293b',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                            border: item.data.sender._id === user.id ? 'none' : '1px solid #e2e8f0',
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                          }}
                        >
                          {/* Sender Name */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              mb: 0.6,
                              color:
                                item.data.sender._id === user.id
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : '#6366f1',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                            onClick={() => handleProfileClick(item.data.sender._id)}
                          >
                            {item.data.sender.name}
                          </Typography>

                          {/* Message Text */}
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              lineHeight: 1.5,
                              fontWeight: 500,
                            }}
                          >
                            {item.data.text}
                          </Typography>

                          {/* Timestamp */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.8,
                              fontSize: '0.7rem',
                              color:
                                item.data.sender._id === user.id
                                  ? 'rgba(255, 255, 255, 0.8)'
                                  : '#94a3b8',
                            }}
                          >
                            {new Date(item.data.timestamp).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>

                        {/* Delete Button (own message) */}
                        {item.data.sender._id === user.id && (
                          <Tooltip title="Delete Message" arrow>
                            <IconButton
                              className="delete-button"
                              onClick={() => handleDeleteMessage(item.data._id)}
                              sx={{
                                opacity: 0,
                                transition: 'all 0.25s ease',
                                bgcolor: 'rgba(239, 68, 68, 0.12)',
                                color: '#ef4444',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                )
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Input Area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: { xs: 2, sm: 3 },
            pt: 2,
            borderTop: '1px solid #e2e8f0',
            bgcolor: 'white',
          }}
        >
          <TextField
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            fullWidth
            variant="outlined"
            size="medium"
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '28px',
                bgcolor: '#f8fafc',
                fontSize: '1rem',
                pr: 1,
                '& fieldset': { borderColor: '#cbd5e1' },
                '&:hover fieldset': { borderColor: '#94a3b8' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
              },
            }}
            inputProps={{ 'aria-label': 'Message input', id: 'message-input' }}
          />
          <IconButton
            type="submit"
            disabled={sending || !newMessage.trim()}
            sx={{
              ml: 1.5,
              bgcolor: '#6366f1',
              color: 'white',
              width: 56,
              height: 56,
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': { bgcolor: '#4f46e5', transform: 'scale(1.05)' },
              '&:disabled': { bgcolor: '#cbd5e1' },
              transition: 'all 0.2s ease',
            }}
          >
            {sending ? (
              <CircularProgress size={28} thickness={5} sx={{ color: 'white' }} />
            ) : (
              <SendIcon sx={{ fontSize: 28 }} />
            )}
          </IconButton>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            p: 2,
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem' }}>
          Delete Message?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', color: '#475569', fontSize: '1rem' }}>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteMessage}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        aria-labelledby="profile-dialog-title"
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            p: 3,
          },
        }}
      >
        <DialogTitle id="profile-dialog-title" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem' }}>
          User Profile
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedUser ? (
            <>
              <Avatar
                src={
                  selectedUser.profilePhoto
                    ? `${API_BASE}${selectedUser.profilePhoto}?t=${Date.now()}`
                    : undefined
                }
                alt={selectedUser.name}
                sx={{
                  width: 90,
                  height: 90,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {selectedUser.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 1 }}>
                {selectedUser.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontStyle: selectedUser.bio ? 'normal' : 'italic',
                  mt: 1,
                }}
              >
                {selectedUser.bio || 'No bio available'}
              </Typography>
            </>
          ) : (
            <CircularProgress size={36} />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseProfileDialog}
            variant="contained"
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.3,
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}