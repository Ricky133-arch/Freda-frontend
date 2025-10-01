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
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      scrollToBottom();
    });

    socketRef.current.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    api
      .get(`/chat/${chatId}`)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
        scrollToBottom();
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
      style={{
        maxWidth: 600,
        margin: 'auto',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #5b21b6 0%, #2c5282 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 20s ease infinite',
      }}
    >
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          html, body, #root {
            background: transparent !important;
          }
        `}
      </style>

      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          p: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 600, color: '#1e293b', textAlign: 'center' }}
        >
          Group Chat
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 500,
              overflowY: 'auto',
              mb: 2,
              px: 1,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': {
                background: '#f1f3f5',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#64748b',
                borderRadius: '8px',
                '&:hover': { background: '#475569' },
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
                        my: 2,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          color: '#ffffff',
                          background: 'rgba(71, 85, 105, 0.8)',
                          borderRadius: '12px',
                          px: 2,
                          py: 0.5,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {formatDateLabel(item.date)}
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.data._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent:
                          item.data.sender._id === user.id ? 'flex-end' : 'flex-start',
                        mb: 1.5,
                        position: 'relative',
                        '&:hover .delete-button': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          maxWidth: '70%',
                        }}
                      >
                        {item.data.sender._id !== user.id && (
                          <Avatar
                            src={
                              item.data.sender.profilePhoto
                                ? `${API_BASE}${item.data.sender.profilePhoto}?t=${Date.now()}`
                                : undefined
                            }
                            alt={item.data.sender.name}
                            sx={{
                              mr: 1,
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.9 },
                            }}
                            onClick={() => handleProfileClick(item.data.sender._id)}
                          />
                        )}

                        {/* Message bubble */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '18px',
                            background:
                              item.data.sender._id === user.id
                                ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
                                : '#f1f5f9',
                            color:
                              item.data.sender._id === user.id ? 'white' : '#1e293b',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {/* Sender Name */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontWeight: 600,
                              mb: 0.5,
                              color:
                                item.data.sender._id === user.id
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : '#0f172a',
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
                            sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}
                          >
                            {item.data.text}
                          </Typography>

                          {/* Timestamp */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              fontSize: '0.75rem',
                              color:
                                item.data.sender._id === user.id
                                  ? 'rgba(255, 255, 255, 0.75)'
                                  : '#475569',
                            }}
                          >
                            {new Date(item.data.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>

                        {item.data.sender._id === user.id && (
                          <>
                            <Avatar
                              src={
                                item.data.sender.profilePhoto
                                  ? `${API_BASE}${item.data.sender.profilePhoto}?t=${Date.now()}`
                                  : undefined
                              }
                              alt={item.data.sender.name}
                              sx={{
                                ml: 1,
                                width: 32,
                                height: 32,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.9 },
                              }}
                              onClick={() => handleProfileClick(item.data.sender._id)}
                            />
                            <Tooltip title="Delete Message" arrow>
                              <IconButton
                                className="delete-button"
                                onClick={() => handleDeleteMessage(item.data._id)}
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  right: -40,
                                  transform: 'translateY(-50%)',
                                  opacity: 0,
                                  transition: 'all 0.2s ease-in-out',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  borderRadius: '50%',
                                  width: 28,
                                  height: 28,
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#dc2626',
                                    transform: 'translateY(-50%) scale(1.1)',
                                  },
                                }}
                                aria-label="Delete message"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
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

        {/* Input area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid #e5e7eb',
            pt: 1,
          }}
        >
          <TextField
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            fullWidth
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#fff',
                '& fieldset': { borderColor: '#d1d5db' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
            }}
            inputProps={{ 'aria-label': 'Message input', id: 'message-input' }}
            disabled={sending}
          />
          <IconButton
            type="submit"
            disabled={sending || !newMessage.trim()}
            sx={{
              ml: 1,
              backgroundColor: '#3b82f6',
              color: '#fff',
              borderRadius: '50%',
              width: 45,
              height: 45,
              '&:hover': { backgroundColor: '#2563eb' },
            }}
          >
            {sending ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: '16px',
            maxWidth: '400px',
          },
        }}
        TransitionComponent={motion.div}
        transitionProps={{
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#1e293b',
            textAlign: 'center',
            pb: 1,
          }}
        >
          Delete Message
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: '#475569',
              fontSize: '1rem',
              textAlign: 'center',
            }}
          >
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: 2,
            pb: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#475569',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '12px',
              padding: '8px 16px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.05)',
              },
            }}
            aria-label="Cancel deletion"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteMessage}
            sx={{
              color: '#fff',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '12px',
              padding: '8px 16px',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              },
            }}
            autoFocus
            aria-label="Confirm deletion"
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
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: '16px',
            maxWidth: '400px',
          },
        }}
        TransitionComponent={motion.div}
        transitionProps={{
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
      >
        <DialogTitle
          id="profile-dialog-title"
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#1e293b',
            textAlign: 'center',
            pb: 1,
          }}
        >
          User Profile
        </DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={
                  selectedUser.profilePhoto
                    ? `${API_BASE}${selectedUser.profilePhoto}?t=${Date.now()}`
                    : undefined
                }
                alt={selectedUser.name}
                sx={{
                  width: 80,
                  height: 80,
                  margin: 'auto',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}
              >
                {selectedUser.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#475569', mb: 1 }}
              >
                {selectedUser.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#64748b', fontStyle: selectedUser.bio ? 'normal' : 'italic' }}
              >
                {selectedUser.bio || 'No bio available'}
              </Typography>
            </Box>
          ) : (
            <CircularProgress size={30} />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseProfileDialog}
            sx={{
              color: '#fff',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '12px',
              padding: '8px 16px',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              },
            }}
            aria-label="Close profile"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}