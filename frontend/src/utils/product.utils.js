export const stringToArray = (str) => {
   if (!str) return [];
   return str.split(',').map(item => item.trim()).filter(Boolean);
};

export const formatSubmitData = (changedFields, formData) => {
   const submitData = {};

   Object.keys(changedFields).forEach(field => {
      switch (field) {
         case 'tags':
         case 'technologyStack':
            submitData[field] = stringToArray(changedFields[field]);
            break;
         case 'price':
            submitData[field] = Number(changedFields[field]);
            break;
         case 'images':
            submitData[field] = changedFields[field].filter(img => img.imageUrl && img.imageId);
            break;
         default:
            submitData[field] = changedFields[field];
      }
   });

   if (changedFields.categoryName || changedFields.subCategory || changedFields.path) {
      submitData.categories = [{
         main: changedFields.categoryName || formData.categoryName,
         sub: changedFields.subCategory || formData.subCategory,
         path: changedFields.path || formData.path
      }];
   }

   return submitData;
};

export const identifyChangedFields = (dirtyFields, formData, originalData) => {
   const changedFields = {};

   Object.keys(dirtyFields).forEach(field => {
      if (field === 'images') {
         if (JSON.stringify(formData.images) !== JSON.stringify(originalData.images)) {
            changedFields.images = formData.images;
         }
      } else if (field === 'sizes') {
         if (JSON.stringify(formData.sizes) !== JSON.stringify(originalData.sizes)) {
            changedFields.size = formData.sizes;
         }
      } else if (field === 'collections') {
         const originalCollectionIds = originalData.collections?.map(collection => collection._id) || [];
         if (JSON.stringify(formData.collections) !== JSON.stringify(originalCollectionIds)) {
            changedFields.collections = formData.collections;
         }
      } else if (typeof formData[field] === 'boolean') {
         if (Boolean(formData[field]) !== Boolean(originalData[field])) {
            changedFields[field] = formData[field];
         }
      } else {
         if (formData[field] !== originalData[field]) {
            changedFields[field] = formData[field];
         }
      }
   });

   return changedFields;
};

export const validateProductForm = (formData) => {
   const errors = {};

   if (!formData.title?.trim()) {
      errors.title = "Title is required";
   }

   if (!formData.description?.trim()) {
      errors.description = "Description is required";
   }

   if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = "Price must be a valid positive number";
   }

   const validImages = formData.images.filter(img => img.imageUrl && img.imageId);
   if (validImages.length === 0) {
      errors.images = "At least one product image is required";
   }

   if (formData.sizes.length === 0) {
      errors.sizes = "At least one size is required";
   }

   if (!formData.categoryName) {
      errors.categoryName = "Category is required";
   }

   if (!formData.subCategory) {
      errors.subCategory = "Sub-category is required";
   }

   return errors;
};

export const processProductData = (productData) => {
   const mainCategory = productData.categories?.[0]?.main || '';
   const subCategory = productData.categories?.[0]?.sub || '';
   const path = productData.categories?.[0]?.path || '';

   const collectionIds = productData.collections ?
      productData.collections.map(collection => collection._id) :
      [];

   const tagsString = Array.isArray(productData.tags)
      ? productData.tags.join(', ')
      : productData.tags || '';

   const techStackString = Array.isArray(productData.technologyStack)
      ? productData.technologyStack.join(', ')
      : productData.technologyStack || '';

   const imageArray = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images.map(img => ({
         imageUrl: img.imageUrl || '',
         imageId: img.imageId || ''
      }))
      : [{ imageUrl: '', imageId: '' }];

   let sizesArray = [];
   if (Array.isArray(productData.sizes) && productData.sizes.length > 0) {
      sizesArray = productData.sizes;
   } else if (Array.isArray(productData.size) && productData.size.length > 0) {
      sizesArray = productData.size;
   } else if (typeof productData.size === 'string' && productData.size) {
      sizesArray = [productData.size];
   }

   return {
      slug: productData.slug || '',
      title: productData.title || '',
      subTitle: productData.subTitle || '',
      description: productData.description || '',
      price: (productData.price !== undefined && productData.price !== null)
         ? productData.price.toString()
         : '',
      images: imageArray,
      sizes: sizesArray,
      tags: tagsString,
      technologyStack: techStackString,
      productModelLink: productData.productModelLink || '',
      isUnderPremium: Boolean(productData.isUnderPremium),
      isExcusiveProducts: Boolean(productData.isExcusiveProducts),
      isNewArrival: Boolean(productData.isNewArrival),
      isUnderHotDeals: Boolean(productData.isUnderHotDeals),
      isBestSeller: Boolean(productData.isBestSeller),
      isWomenFeatured: Boolean(productData.isWomenFeatured),
      isMenFeatured: Boolean(productData.isMenFeatured),
      isFeaturedToBanner: Boolean(productData.isFeaturedToBanner),
      isTrendingNow: Boolean(productData.isTrendingNow),
      categoryName: mainCategory,
      subCategory: subCategory,
      path: path,
      collections: collectionIds
   };
};

export const updateImageArray = (currentImages, { action, imageUrl, imageId, index }) => {
   let updatedImages = [...currentImages];

   switch (action) {
      case 'add':
         if (index !== undefined && updatedImages[index]) {
            updatedImages[index] = {
               ...updatedImages[index],
               ...(imageUrl && { imageUrl }),
               ...(imageId && { imageId })
            };
         } else {
            updatedImages.push({
               imageUrl: imageUrl || '',
               imageId: imageId || ''
            });
         }
         break;

      case 'remove':
         updatedImages = updatedImages.filter((_, i) => i !== index);
         if (updatedImages.length === 0) {
            updatedImages = [{ imageUrl: '', imageId: '' }];
         }
         break;

      case 'addField':
         updatedImages.push({ imageUrl: '', imageId: '' });
         break;
   }

   return updatedImages;
};