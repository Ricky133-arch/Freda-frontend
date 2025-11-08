import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Button, Typography, Box, Paper, Avatar } from "@mui/material";

export default function Welcome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: 650, margin: "auto", padding: 20 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 5,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Avatar Section */}
          {user?.profilePhoto && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                src={user?.profilePhoto ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}` : ""}
                alt={user?.name || "User"}
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 3,
                  border: "3px solid #6a11cb",
                }}
              />
            </motion.div>
          )}

          {/* Welcome Text */}
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Welcome, {user?.name || "User"}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
            Start chatting or update your profile to personalize your experience.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ mt: 2 }}>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              sx={{
                mr: 2,
                px: 4,
                py: 1.3,
                borderRadius: 3,
                fontWeight: "bold",
                background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              }}
              onClick={() => navigate("/chat/default-chat")}
            >
              Start Chatting
            </Button>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: 3,
                fontWeight: "bold",
                borderColor: "#6a11cb",
                color: "#6a11cb",
                "&:hover": {
                  borderColor: "#2575fc",
                  backgroundColor: "rgba(106,17,203,0.08)",
                },
              }}
              onClick={() => navigate("/profile")}
            >
              Update Profile
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Logout Button (Bottom-right corner) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
      >
        <Button
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="contained"
          color="error"
          size="medium"
          sx={{
            borderRadius: 3,
            fontWeight: "bold",
            px: 3,
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}