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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, sm: 3, md: 4 },
        gap: { xs: 3, sm: 4 },
      }}
    >
      {/* Avatar + Name */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <Avatar
          src={
            user?.profilePhoto
              ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}`
              : undefined
          }
          alt={user?.name}
          sx={{
            width: { xs: 90, sm: 110, md: 130 },
            height: { xs: 90, sm: 110, md: 130 },
            mx: "auto",
            mb: 2,
            border: "6px solid white",
            boxShadow: "0 8px 25px rgba(99, 102, 241, 0.2)",
            bgcolor: "transparent",
          }}
        >
          {!user?.profilePhoto && (
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
              }}
            />
          )}
        </Avatar>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
          }}
        >
          Hi, {user?.name || "User"}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 1,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            maxWidth: 400,
          }}
        >
          Ready to chat or update your profile?
        </Typography>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <Button
          component={motion.button}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          variant="contained"
          size="large"
          startIcon={<ChatIcon />}
          onClick={() => navigate("/chat/default-chat")}
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 45%" },
            py: 1.8,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: "1.05rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(135deg, #5b5ce0, #7c3aed)",
            },
          }}
        >
          Start Chatting
        </Button>

        <Button
          component={motion.button}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          variant="outlined"
          size="large"
          startIcon={<PersonIcon />}
          onClick={() => navigate("/profile")}
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 45%" },
            py: 1.8,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: "1.05rem",
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
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <IconButton
          onClick={handleLogout}
          sx={{
            mt: 2,
            color: "#94a3b8",
            "&:hover": {
              color: "#ef4444",
              bgcolor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          <LogoutIcon />
        </IconButton>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5, fontSize: "0.8rem" }}
        >
          Logout
        </Typography>
      </motion.div>
    </Box>
  );
}