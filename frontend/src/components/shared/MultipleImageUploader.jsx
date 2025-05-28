import React, { useState, useRef, useCallback } from 'react';
import { uploadImage } from '../../lib/api/auth.api';
import { deleteImage } from '../../lib/api/admin.api';
import { toast } from "react-toastify";
import { Image, X, Upload, Loader2, Plus } from 'lucide-react';

const MultipleImageUploader = ({
  images = [],
  onImagesChange,
  label = "Product Images",
  className = "",
  disabled = false,
  path = "products",
  maxImages = 10,
}) => {
  const [uploadingStates, setUploadingStates] = useState({});
  const [draggingIndex, setDraggingIndex] = useState(null);
  const fileInputRefs = useRef({});

  // Ensure we have an array of image objects with proper structure
  const normalizedImages = images.map((img, index) => ({
    imageUrl: img?.imageUrl || '',
    imageId: img?.imageId || '',
    index
  }));

  const updateImages = (newImages) => {
    const cleanedImages = newImages.map(img => ({
      imageUrl: img.imageUrl || '',
      imageId: img.imageId || ''
    }));
    onImagesChange(cleanedImages);
  };

  const uploadToCloudinary = async (file, index) => {
    setUploadingStates(prev => ({ ...prev, [index]: true }));

    try {
      const result = await uploadImage(file, path);

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      // Update the specific image at this index
      const newImages = [...normalizedImages];
      newImages[index] = {
        imageUrl: result.imageUrl,
        imageId: result.imageId,
        index
      };

      updateImages(newImages);
      toast.success(`Image ${index + 1} uploaded successfully`);

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingStates(prev => ({ ...prev, [index]: false }));
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

  const handleFileSelect = async (e, index) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      // Check if we're replacing an existing image
      const existingImage = normalizedImages[index];
      if (existingImage?.imageId) {
        try {
          // Delete the old image from Cloudinary before uploading new one
          const result = await deleteImage(existingImage.imageId);
          if (result.success) {
            console.log('Old image deleted from Cloudinary:', existingImage.imageId);
          }
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
          // Continue with upload even if deletion fails
        }
      }
      
      uploadToCloudinary(file, index);
    }

    // Reset input value to allow uploading the same file again
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = '';
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = normalizedImages[index];
    
    // If the image has an imageId, delete it from Cloudinary
    if (imageToRemove?.imageId) {
      try {
        const result = await deleteImage(imageToRemove.imageId);
        if (result.success) {
          console.log('Image deleted from Cloudinary:', imageToRemove.imageId);
        } else {
          console.warn('Failed to delete image from Cloudinary:', result.message);
          // Continue with removal from local state even if Cloudinary deletion fails
        }
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with removal from local state even if Cloudinary deletion fails
      }
    }

    const newImages = normalizedImages.filter((_, i) => i !== index);
    updateImages(newImages);
  };

  const addNewImageSlot = () => {
    if (normalizedImages.length >= maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = [...normalizedImages, { imageUrl: '', imageId: '', index: normalizedImages.length }];
    updateImages(newImages);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploadingStates[index]) {
      setDraggingIndex(index);
    }
  }, [disabled, uploadingStates]);

  const handleDragLeave = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);

    if (disabled || uploadingStates[index]) return;

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      // Check if we're replacing an existing image
      const existingImage = normalizedImages[index];
      if (existingImage?.imageId) {
        try {
          // Delete the old image from Cloudinary before uploading new one
          const result = await deleteImage(existingImage.imageId);
          if (result.success) {
            console.log('Old image deleted from Cloudinary via drag/drop:', existingImage.imageId);
          }
        } catch (error) {
          console.error('Error deleting old image from Cloudinary via drag/drop:', error);
          // Continue with upload even if deletion fails
        }
      }
      
      uploadToCloudinary(file, index);
    }
  }, [disabled, uploadingStates]);

  const triggerFileInput = (index) => {
    if (!disabled && !uploadingStates[index] && fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <span className="text-xs text-gray-400">
          {normalizedImages.length}/{maxImages} images
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {normalizedImages.map((image, index) => (
          <div key={index} className="relative group">
            {/* Hidden file input */}
            <input
              ref={(el) => (fileInputRefs.current[index] = el)}
              type="file"
              onChange={(e) => handleFileSelect(e, index)}
              disabled={disabled || uploadingStates[index]}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Image slot */}
            <div
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                draggingIndex === index 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-gray-600 border-dashed'
              } ${
                image.imageUrl ? 'p-2' : 'p-6'
              } ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={(e) => handleDragLeave(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => triggerFileInput(index)}
            >
              {image.imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={image.imageUrl}
                    alt={`Product Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />

                  {!disabled && !uploadingStates[index] && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-md">
                      <p className="text-sm mb-2">Click or drop to replace</p>
                      <Upload size={20} className="text-gray-300" />
                    </div>
                  )}

                  {/* Remove button */}
                  {!disabled && !uploadingStates[index] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* Upload overlay */}
                  {uploadingStates[index] && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white rounded-md">
                      <Loader2 size={24} className="animate-spin mb-2 text-primary-400" />
                      <p className="text-sm font-medium">Uploading...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  {uploadingStates[index] ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={24} className="animate-spin mb-2 text-primary-400" />
                      <p className="text-sm text-gray-300">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-primary-500/20 rounded-full mb-3">
                        <Image size={20} className="text-primary-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-300 mb-1">
                        Click or drop image
                      </p>
                      <p className="text-xs text-gray-400">
                        Image #{index + 1}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add new image button */}
        {normalizedImages.length < maxImages && (
          <div
            className={`w-full aspect-square rounded-lg border-2 border-gray-600 border-dashed flex items-center justify-center transition-all hover:border-primary-500 hover:bg-primary-500/5 ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={addNewImageSlot}
          >
            <div className="flex flex-col items-center text-gray-400">
              <div className="p-3 bg-gray-600/20 rounded-full mb-2">
                <Plus size={20} />
              </div>
              <p className="text-sm font-medium">Add Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-400 space-y-1">
        <p>• Drag and drop images or click to browse</p>
        <p>• Supported formats: JPEG, PNG, WEBP (max 5MB each)</p>
        <p>• Maximum {maxImages} images allowed</p>
      </div>
    </div>
  );
};

export default MultipleImageUploader;
