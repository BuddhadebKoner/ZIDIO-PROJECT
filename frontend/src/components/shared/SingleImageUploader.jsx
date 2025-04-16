import React, { useState, useRef } from 'react';
import { uploadImage } from '../../lib/api/auth.api';
import { toast } from "react-toastify";

const SingleImageUploader = ({
  setImageUrl,
  setImageId,
  label = "Upload Image",
  className = "",
  currentImageUrl = null,
  disabled = false ,
  path = "unknown",
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const uploadToCloudinary = async (file) => {
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const result = await uploadImage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      setImageUrl(result.imageUrl);
      setImageId(result.imageId);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a JPEG, PNG or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please select a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    uploadToCloudinary(file);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">
        {label} {uploadingImage && `(${uploadProgress}%)`}
      </label>

      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          disabled={disabled || uploadingImage}
          accept="image/jpeg,image/png,image/webp"
          className="w-full px-4 py-2 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {currentImageUrl && (
        <div className="mt-2">
          <img
            src={currentImageUrl}
            alt="Current image"
            className="h-20 object-cover rounded-md"
          />
        </div>
      )}

      {uploadingImage && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div
            className="bg-primary-500 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUploader;