// src/components/Profile.jsx
import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Avatar,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = useCallback(async () => {
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      setPhoto(croppedFile);
      setCropDialogOpen(false);
    } catch (err) {
      console.error("Crop error:", err);
      setError("Failed to crop image.");
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (photo) formData.append("photo", photo);
      await updateProfile(formData);
      setSuccess("Profile updated successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto"
      >
        {/* Card */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 5,
            p: { xs: 3, sm: 5 },
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Edit Profile
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Make your profile pop
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Avatar */}
          <Box sx={{ position: "relative", display: "inline-block", mx: "auto" }}>
            <Avatar
              src={
                photo
                  ? URL.createObjectURL(photo)
                  : user?.profilePhoto
                  ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}`
                  : ""
              }
              alt="Profile"
              sx={{
                width: 140,
                height: 140,
                mx: "auto",
                border: "6px solid white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            />
            <label htmlFor="photo-upload">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  bgcolor: "white",
                  boxShadow: 3,
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
                component="span"
              >
                <PhotoCamera sx={{ color: "#6366f1" }} />
              </IconButton>
            </label>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <Button
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.8,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  background: "linear-gradient(90deg, #5b5ce0, #9f46e5)",
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, overflow: "hidden" },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: "relative", width: "100%", height: 350 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ containerStyle: { background: "#f9f9f9" } }}
            />
          </Box>
          <Box sx={{ p: 3, pb: 2 }}>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                width: "100%",
                height: 8,
                borderRadius: 5,
                background: "#e0e0e0",
                outline: "none",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "space-between" }}>
          <Button onClick={() => setCropDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCrop} variant="contained" sx={{ borderRadius: 3 }}>
            Apply Crop
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}