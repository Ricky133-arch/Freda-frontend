// src/components/Welcome.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import PaletteIcon from "@mui/icons-material/Palette";

export default function Welcome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 28 }} />,
      title: "Secure & Private",
      desc: "End-to-end encryption for all messages.",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      title: "Lightning Fast",
      desc: "Real-time chat with zero lag.",
    },
    {
      icon: <PaletteIcon sx={{ fontSize: 28 }} />,
      title: "Beautiful UI",
      desc: "Modern design that feels premium.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 15s ease infinite",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            textAlign: "center",
          }}
        >
          <Avatar
            src={
              user?.profilePhoto
                ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}`
                : undefined
            }
            alt={user?.name}
            sx={{
              width: 110,
              height: 110,
              mx: "auto",
              mb: 2,
              border: "5px solid white",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)",
            }}
          >
            {!user?.profilePhoto && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-full h-full rounded-full" />
            )}
          </Avatar>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: "1.1rem" }}>
            You're all set to connect, chat, and collaborate in real-time.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variant="contained"
              size="large"
              startIcon={<ChatIcon />}
              onClick={() => navigate("/chat/default-chat")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
                textTransform: "none",
              }}
            >
              Open Chat
            </Button>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variant="outlined"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate("/profile")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: "1.1rem",
                borderColor: "#6366f1",
                color: "#6366f1",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#4f46e5",
                  bgcolor: "rgba(99, 102, 241, 0.08)",
                },
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
            Why You'll Love Freda
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: 8 }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Paper>
      </motion.div>

      {/* Stats / Fun Fact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, color: "#6366f1" }}>
            10K+
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Messages sent today
          </Typography>
        </Paper>
      </motion.div>

      {/* Logout (Bottom Fixed) */}
      <Box sx={{ mt: "auto", textAlign: "center", pb: 2 }}>
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            width: 56,
            height: 56,
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.25)" },
          }}
        >
          <LogoutIcon />
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Tap to logout
        </Typography>
      </Box>
    </Box>
  );
}