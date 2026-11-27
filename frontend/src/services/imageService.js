
import uploadImage from "../assets/images/icons/defaultplaceholder_noimageavailable.png"

/**
 * Handles multipart file uploads to the Spring Boot backend
 */
export const uploadLocalFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Note: For actual deployment, replace this URL with your backend upload endpoint
  // const response = await fetch('http://localhost:8080/api/images/upload', {
  //   method: 'POST',
  //   body: formData
  // });
  // return await response.json(); 
  
  // Developer prototype: Creates a temporary browser URL for instant UI feedback
  return URL.createObjectURL(file);
};

/**
 * Initializes and opens the Google Drive Picker API
 * Requires Google API script in index.html and OAuth credentials
 */
export const openGoogleDrivePicker = async (onImageSelected) => {
  console.log("Initializing Google Drive Picker API...");
  // Skeleton logic: Once OAuth and gapi.client are authenticated, open the picker window.
  // After the user selects a file, the Google API returns the file metadata.
  
  // Mock response for development testing
  setTimeout(() => {
    onImageSelected(uploadImage);
  }, 1000);
};