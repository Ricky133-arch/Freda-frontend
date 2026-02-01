// src/components/Welcome.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Button,
  Typography,
  Box,
  Avatar,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MailIcon from "@mui/icons-material/Mail";
import GroupsIcon from "@mui/icons-material/Groups";

export default function Welcome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState(0);

  // Dark mode state — saved in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    // Default to system preference only on first visit
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Save to localStorage + apply to DOM
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.background = "#0f172a";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.background = "";
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Glass Card */}
        <Box
          sx={{
            position: "relative",
            bgcolor: darkMode
              ? "rgba(30, 41, 59, 0.9)"
              : "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(16px)",
            borderRadius: 5,
            p: { xs: 4, sm: 6 },
            boxShadow: darkMode
              ? "0 12px 32px rgba(0, 0, 0, 0.3)"
              : "0 12px 32px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "none",
          }}
        >
          {/* Dark Mode Toggle – Top-Right Inside Card */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
              borderRadius: 3,
              p: 1,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }}
          >
            <LightModeIcon
              sx={{
                fontSize: 16,
                color: darkMode ? "#94a3b8" : "#6366f1",
              }}
            />
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size="small"
              sx={{
                "& .MuiSwitch-thumb": {
                  width: 14,
                  height: 14,
                  bgcolor: darkMode ? "#8b5cf6" : "#6366f1",
                },
                "& .MuiSwitch-track": {
                  width: 36,
                  height: 20,
                  bgcolor: darkMode ? "#475569" : "#e2e8f0",
                  opacity: 1,
                },
              }}
            />
            <DarkModeIcon
              sx={{
                fontSize: 16,
                color: darkMode ? "#8b5cf6" : "#94a3b8",
              }}
            />
          </Box>

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              src={
                user?.profilePhoto
                  ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}`
                  : undefined
              }
              alt={user?.name}
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 3,
                border: "6px solid",
                borderColor: darkMode ? "#1e293b" : "white",
                boxShadow: darkMode
                  ? "0 8px 20px rgba(0,0,0,0.4)"
                  : "0 8px 20px rgba(99, 102, 241, 0.2)",
              }}
            >
              {!user?.profilePhoto && (
                <div
                  className={`w-full h-full rounded-full ${
                    darkMode
                      ? "bg-gradient-to-br from-indigo-600 to-purple-700"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600"
                  }`}
                />
              )}
            </Avatar>
          </motion.div>

          {/* Welcome Text */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: darkMode
                ? "linear-gradient(90deg, #a855f7, #ec4899)"
                : "linear-gradient(90deg, #6366f1, #a855f7)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Hi, {user?.name || "User"}!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              color: darkMode ? "#cbd5e1" : "text.secondary",
            }}
          >
            Ready to connect and chat?
          </Typography>

          {/* Tabs */}
          <Box sx={{ mb: 4, borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: darkMode ? '#94a3b8' : '#64748b',
                  '&.Mui-selected': {
                    color: '#6366f1',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6366f1',
                },
              }}
            >
              <Tab icon={<MailIcon />} iconPosition="start" label="Messages" />
              <Tab icon={<GroupsIcon />} iconPosition="start" label="Group Chat" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 ? (
            // Messages Tab
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? '#cbd5e1' : '#475569',
                  mb: 3,
                }}
              >
                Direct messages with your contacts
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ChatIcon />}
                onClick={() => navigate("/messages")}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: darkMode
                    ? "0 6px 16px rgba(16, 185, 129, 0.4)"
                    : "0 6px 16px rgba(16, 185, 129, 0.3)",
                  "&:hover": {
                    background: 'linear-gradient(135deg, #059669, #047857)',
                  },
                }}
              >
                Open Messages
              </Button>
            </Box>
          ) : (
            // Group Chat Tab
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? '#cbd5e1' : '#475569',
                  mb: 3,
                }}
              >
                Chat with your entire team or group
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ChatIcon />}
                onClick={() => navigate("/chat/default-chat")}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: darkMode
                    ? "0 6px 16px rgba(99, 102, 241, 0.4)"
                    : "0 6px 16px rgba(99, 102, 241, 0.3)",
                  "&:hover": {
                    background: 'linear-gradient(135deg, #5b5ce0, #7c3aed)',
                  },
                }}
              >
                Start Group Chat
              </Button>
            </Box>
          )}

          {/* Edit Profile Button */}
          <Button
            component={motion.button}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/profile")}
            sx={{
              mt: 3,
              py: 2,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              borderColor: darkMode ? "#8b5cf6" : "#6366f1",
              color: darkMode ? "#8b5cf6" : "#6366f1",
              "&:hover": {
                borderColor: darkMode ? "#a855f7" : "#4f46e5",
                bgcolor: darkMode
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(99, 102, 241, 0.08)",
              },
            }}
          >
            Edit Profile
          </Button>

          {/* Logout (Bottom) */}
          <Box sx={{ mt: 6 }}>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="text"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: "#ef4444",
                fontWeight: 500,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: darkMode
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </motion.div>
    </div>
  );
}