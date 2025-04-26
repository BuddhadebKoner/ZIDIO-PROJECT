import React, { useState, useRef, useCallback } from 'react';
import { uploadImage } from '../../lib/api/auth.api';
import { toast } from "react-toastify";
import { Image, X, Upload, Loader2 } from 'lucide-react';

const SingleImageUploader = ({
  setImageUrl,
  setImageId,
  label = "Upload Image",
  className = "",
  currentImageUrl = null,
  disabled = false,
  path = "unknown",
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(currentImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview when currentImageUrl changes
  React.useEffect(() => {
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

  const uploadToCloudinary = async (file) => {
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      // Generate local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      const result = await uploadImage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      setImageUrl(result.imageUrl);
      setImageId(result.imageId);
      toast.success('Image uploaded successfully');

      // Clean up local preview
      URL.revokeObjectURL(localPreview);

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
      setPreview(currentImageUrl); // Revert to previous image on error
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploadingImage(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a JPEG, PNG or WEBP image.');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please select a smaller image.');
      return false;
    }

    return true;
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      uploadToCloudinary(file);
    }

    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setImageUrl('');
    setImageId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploadingImage) {
      setIsDragging(true);
    }
  }, [disabled, uploadingImage]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploadingImage) return;

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      uploadToCloudinary(file);
    }
  }, [disabled, uploadingImage]);

  // Click the hidden file input when the drop zone is clicked
  const triggerFileInput = () => {
    if (!disabled && !uploadingImage && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        disabled={disabled || uploadingImage}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Drop zone and preview area */}
      <div
        className={`w-full rounded-lg border-2 transition-all ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 border-dashed'
          } ${preview ? 'p-2' : 'p-6'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-md bg-gray-900/50"
            />

            {!disabled && !uploadingImage && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-md">
                <p className="text-sm mb-2">Click or drop to replace</p>
                <Upload size={24} className="text-gray-300" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white rounded-md">
                <Loader2 size={32} className="animate-spin mb-2 text-primary-400" />
                <p className="font-medium">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-primary-500/20 rounded-full mb-3">
              <Image size={24} className="text-primary-400" />
            </div>

            {uploadingImage ? (
              <div className="flex flex-col items-center">
                <Loader2 size={24} className="animate-spin mb-2 text-primary-400" />
                <p className="text-sm text-gray-300">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-300 mb-1">
                  Drag and drop an image or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  JPEG, PNG or WEBP (max 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploadingImage && (
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-primary-500 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SingleImageUploader;