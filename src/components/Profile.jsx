import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Alert,
  Avatar,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";

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
      if (photo) {
        formData.append("photo", photo);
      }
      await updateProfile(formData);
      setSuccess("Profile updated successfully ✅");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
    }
  };

  return (
    <motion.div
      className="App"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 5,
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Edit Profile
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Update your personal info and profile picture
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Avatar
          src={user?.profilePhoto ? `${API_BASE}${user.profilePhoto}?t=${Date.now()}` : ""}
          alt="Profile"
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            mx: "auto",
            border: "4px solid #fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ borderRadius: 3 }}
          />

          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 3,
              borderColor: "#646cff",
              color: "#646cff",
              fontWeight: 600,
              "&:hover": {
                background: "rgba(100,108,255,0.1)",
              },
            }}
          >
            Upload Profile Photo
            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
          </Button>

          {photo && (
            <Typography variant="body2" sx={{ mt: 1, color: "green" }}>
              ✅ Cropped image selected
            </Typography>
          )}

          <Button
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(90deg, #ff6b6b, #ff9f43)",
              fontWeight: "bold",
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* Crop dialog */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Crop Your Photo
          </Typography>
          <Box sx={{ position: "relative", width: "100%", height: 300 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialogOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleCrop} variant="contained" color="primary">
            Crop
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}