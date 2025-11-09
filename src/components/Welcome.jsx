// src/components/Welcome.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Button, Typography, Box, Avatar, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";

export default function Welcome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Glass Card */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(16px)",
            borderRadius: 5,
            p: { xs: 4, sm: 6 },
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
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
                border: "6px solid white",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)",
              }}
            >
              {!user?.profilePhoto && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-full h-full rounded-full" />
              )}
            </Avatar>
          </motion.div>

          {/* Welcome Text */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
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
            color="text.secondary"
            sx={{ mb: 5, fontSize: "1.1rem" }}
          >
            Ready to connect and chat?
          </Typography>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              variant="contained"
              size="large"
              startIcon={<ChatIcon />}
              onClick={() => navigate("/chat/default-chat")}
              sx={{
                py: 2,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5b5ce0, #7c3aed)",
                },
              }}
            >
              Start Chatting
            </Button>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              variant="outlined"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate("/profile")}
              sx={{
                py: 2,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
                borderColor: "#6366f1",
                color: "#6366f1",
                "&:hover": {
                  borderColor: "#4f46e5",
                  bgcolor: "rgba(99, 102, 241, 0.08)",
                },
              }}
            >
              Edit Profile
            </Button>
          </div>

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
                  bgcolor: "rgba(239, 68, 68, 0.08)",
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