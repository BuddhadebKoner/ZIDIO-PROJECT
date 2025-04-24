/**
 * Identifies changes between original and updated collection data
 * 
 * @param {Object} originalData - The original collection data
 * @param {Object} updatedData - The updated collection data
 * @returns {Object|null} - Object containing only changed fields or null if no changes
 */
export const identifyCollectionChanges = (originalData, updatedData) => {
  if (!originalData) return null;

  const changedFields = {};

  Object.keys(updatedData).forEach(key => {
    if (key === 'slug') return;

    if (Array.isArray(updatedData[key])) {
      const originalArray = originalData[key] || [];
      const currentArray = updatedData[key] || [];

      if (originalArray.length !== currentArray.length || 
          !originalArray.every(item => currentArray.includes(item)) || 
          !currentArray.every(item => originalArray.includes(item))) {
        changedFields[key] = updatedData[key];
      }
    }
    else if (updatedData[key] !== originalData[key]) {
      changedFields[key] = updatedData[key];
    }
  });

  return Object.keys(changedFields).length > 0 ? changedFields : null;
};

/**
 * Validates collection form data
 * 
 * @param {Object} formData - The collection form data to validate
 * @returns {Object} - Object containing validation errors, empty if valid
 */
export const validateCollectionForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Collection name is required';
  }

  if (!formData.subtitle?.trim()) {
    errors.subtitle = 'Subtitle is required';
  }

  if (!formData.bannerImageUrl || !formData.bannerImageId) {
    errors.bannerImageUrl = 'Banner image is required';
  }

  if (!formData.productIds || formData.productIds.length === 0) {
    errors.productIds = 'At least one product is required';
  }

  return errors;
};

/**
 * Formats collection data from API response for form use
 * 
 * @param {Object} collectionData - The raw collection data from API
 * @returns {Object} - Formatted collection data for form use
 */
export const formatCollectionDataForForm = (collectionData) => {
  return {
    name: collectionData.name || '',
    slug: collectionData.slug || '',
    subtitle: collectionData.subtitle || '',
    isFeatured: collectionData.isFeatured || false,
    bannerImageUrl: collectionData.bannerImageUrl || '',
    bannerImageId: collectionData.bannerImageId || '',
    productIds: collectionData.products || []
  };
};