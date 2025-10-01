// cropimage.js
export async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const image = new Image();
  image.src = imageSrc;

  // Wait for image to load
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to cropped area
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // Draw cropped section of the image onto the canvas
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // Convert canvas to a File object
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      resolve(file); // ✅ always returns File
    }, 'image/jpeg');
  });
}
