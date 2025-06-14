export const sanitizedProduct = (product) => {
   try {
      const sanitizedProduct = {};
      const errors = {};

      // Validate and sanitize slug
      if (!product.slug || typeof product.slug !== 'string' || product.slug.includes(' ')) {
         errors.slug = "Slug must be a string without spaces";
      } else {
         sanitizedProduct.slug = product.slug.trim();
      }

      // Validate and sanitize title
      if (!product.title || typeof product.title !== 'string' || !product.title.trim()) {
         errors.title = "Title is required";
      } else {
         sanitizedProduct.title = product.title.trim();
      }

      // Validate and sanitize subTitle
      if (!product.subTitle || typeof product.subTitle !== 'string' || !product.subTitle.trim()) {
         errors.subTitle = "Subtitle is required";
      } else {
         sanitizedProduct.subTitle = product.subTitle.trim();
      }

      // Validate and sanitize description
      if (!product.description || typeof product.description !== 'string' || !product.description.trim()) {
         errors.description = "Description is required";
      } else {
         sanitizedProduct.description = product.description.trim();
      }

      // Validate and sanitize price
      if (product.price) {
         const parsedPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
         if (isNaN(parsedPrice) || parsedPrice < 0) {
            errors.price = "Price must be a positive number";
         } else {
            sanitizedProduct.price = parsedPrice;
         }
      } else {
         errors.price = "Price is required";
      }

      // Validate and sanitize images
      if (Array.isArray(product.images)) {
         const validImages = product.images.filter(img =>
            img && typeof img.imageUrl === 'string' &&
            typeof img.imageId === 'string' &&
            img.imageUrl.trim() &&
            img.imageId.trim()
         );

         if (validImages.length === 0) {
            errors.images = "At least one valid image is required";
         } else {
            sanitizedProduct.images = validImages;
         }
      } else {
         errors.images = "Images must be in array format";
      }

      // Validate and sanitize sizes
      const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
         const filteredSizes = product.sizes.filter(size => validSizes.includes(size));
         if (filteredSizes.length === 0) {
            errors.sizes = "At least one valid size is required (S, M, L, XL, XXL)";
         } else {
            sanitizedProduct.sizes = filteredSizes;
            sanitizedProduct.size = filteredSizes[0]; 
         }
      } else {
         errors.sizes = "At least one size is required";
      }

      // Validate and sanitize tags
      if (product.tags) {
         if (typeof product.tags === 'string') {
            const tagArray = product.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (tagArray.length === 0) {
               errors.tags = "At least one tag is required";
            } else {
               sanitizedProduct.tags = tagArray;
            }
         } else if (Array.isArray(product.tags) && product.tags.length > 0) {
            sanitizedProduct.tags = product.tags.filter(tag => tag && typeof tag === 'string');
            if (sanitizedProduct.tags.length === 0) {
               errors.tags = "At least one valid tag is required";
            }
         } else {
            errors.tags = "Tags must be provided as a comma-separated string or array";
         }
      } else {
         errors.tags = "Tags are required";
      }

      // Validate and sanitize technologyStack
      if (product.technologyStack) {
         if (typeof product.technologyStack === 'string') {
            const techArray = product.technologyStack.split(',').map(tech => tech.trim()).filter(Boolean);
            if (techArray.length === 0) {
               errors.technologyStack = "At least one technology is required";
            } else {
               sanitizedProduct.technologyStack = techArray;
            }
         } else if (Array.isArray(product.technologyStack) && product.technologyStack.length > 0) {
            sanitizedProduct.technologyStack = product.technologyStack.filter(tech => tech && typeof tech === 'string');
            if (sanitizedProduct.technologyStack.length === 0) {
               errors.technologyStack = "At least one valid technology is required";
            }
         } else {
            errors.technologyStack = "Technology stack must be provided as a comma-separated string or array";
         }
      } else {
         errors.technologyStack = "Technology stack is required";
      }

      // Validate and sanitize productModelLink (optional)
      if (product.productModelLink !== undefined && product.productModelLink !== '') {
         if (typeof product.productModelLink !== 'string') {
            errors.productModelLink = "Product model link must be a string";
         } else {
            sanitizedProduct.productModelLink = product.productModelLink.trim();
         }
      }

      // Validate and sanitize category fields
      if (!product.categoryName || !product.subCategory) {
         errors.category = "Category name, subcategory, are required";
      } else {
         sanitizedProduct.categories = [{
            main: String(product.categoryName).trim(),
            sub: String(product.subCategory).trim(),
         }];
      }

      // Handle collections field (optional)
      if (product.collections && product.collections !== '') {
         if (typeof product.collections === 'string') {
            // If it's a comma-separated string
            const collectionIds = product.collections.split(',')
               .map(id => id.trim())
               .filter(id => id !== '');

            if (collectionIds.length > 0) {
               sanitizedProduct.collections = collectionIds;
            }
         } else if (Array.isArray(product.collections)) {
            // If it's already an array
            const validCollections = product.collections
               .filter(id => id && typeof id === 'string' && id.trim() !== '');

            if (validCollections.length > 0) {
               sanitizedProduct.collections = validCollections;
            }
         }
      }
      // Don't include collections if it's empty or invalid

      // Handle offer field (optional)
      if (product.offer && typeof product.offer === 'string' && product.offer.trim() !== '') {
         sanitizedProduct.offer = product.offer.trim();
      }
      // Don't include offer if it's empty or invalid

      // Return validation result
      if (Object.keys(errors).length > 0) {
         return { valid: false, errors };
      }

      return { valid: true, data: sanitizedProduct };
   } catch (error) {
      console.error("Error sanitizing product:", error);
      return {
         valid: false,
         errors: { general: "Failed to validate product data" },
         exception: error.message
      };
   }
};

export const sanitizedCollection = (collection) => {
   try {
      // Initialize result object
      const result = {
         valid: true,
         data: {},
         errors: {},
         exception: null
      };

      // Check required fields
      const requiredFields = ['name', 'slug', 'subtitle', 'bannerImageUrl', 'bannerImageId'];
      for (const field of requiredFields) {
         if (!collection[field] || typeof collection[field] !== 'string' || !collection[field].trim()) {
            result.valid = false;
            result.errors[field] = `${field} is required and must be a non-empty string`;
         }
      }

      // Validate name (trim and check length)
      if (collection.name && typeof collection.name === 'string') {
         const trimmedName = collection.name.trim();
         if (trimmedName.length < 2 || trimmedName.length > 100) {
            result.valid = false;
            result.errors.name = 'Collection name must be between 2 and 100 characters';
         } else {
            result.data.name = trimmedName;
         }
      }

      // Validate slug (alphanumeric, hyphens, no spaces)
      if (collection.slug && typeof collection.slug === 'string') {
         const trimmedSlug = collection.slug.trim().toLowerCase();
         const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

         if (!slugRegex.test(trimmedSlug)) {
            result.valid = false;
            result.errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
         } else if (trimmedSlug.length < 2 || trimmedSlug.length > 100) {
            result.valid = false;
            result.errors.slug = 'Slug must be between 2 and 100 characters';
         } else {
            result.data.slug = trimmedSlug;
         }
      }

      // Validate subtitle
      if (collection.subtitle && typeof collection.subtitle === 'string') {
         const trimmedSubtitle = collection.subtitle.trim();
         if (trimmedSubtitle.length < 3 || trimmedSubtitle.length > 200) {
            result.valid = false;
            result.errors.subtitle = 'Subtitle must be between 3 and 200 characters';
         } else {
            result.data.subtitle = trimmedSubtitle;
         }
      }

      // Validate banner image URL
      if (collection.bannerImageUrl && typeof collection.bannerImageUrl === 'string') {
         const trimmedUrl = collection.bannerImageUrl.trim();
         // Simple URL validation - can be enhanced with more specific checks
         const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,})([\/\w \.-]*)*\/?$/;

         if (!urlRegex.test(trimmedUrl)) {
            result.valid = false;
            result.errors.bannerImageUrl = 'Banner image URL is not valid';
         } else {
            result.data.bannerImageUrl = trimmedUrl;
         }
      }

      // Validate banner image ID
      if (collection.bannerImageId && typeof collection.bannerImageId === 'string') {
         const trimmedImageId = collection.bannerImageId.trim();
         if (trimmedImageId.length < 1) {
            result.valid = false;
            result.errors.bannerImageId = 'Banner image ID is required';
         } else {
            result.data.bannerImageId = trimmedImageId;
         }
      }

      // Validate featured flag (boolean)
      if (collection.isFeatured !== undefined) {
         result.data.isFeatured = Boolean(collection.isFeatured);
      } else {
         result.data.isFeatured = false; // Default value
      }

      // Validate product IDs
      if (collection.productIds && Array.isArray(collection.productIds)) {
         // Filter out empty strings and validate MongoDB ObjectIDs
         const validProductIds = collection.productIds
            .filter(id => id && typeof id === 'string' && id.trim() !== '')
            .filter(id => {
               // Check if valid MongoDB ObjectId
               const objectIdRegex = /^[0-9a-fA-F]{24}$/;
               return objectIdRegex.test(id.trim());
            })
            .map(id => id.trim());

         if (validProductIds.length === 0) {
            result.valid = false;
            result.errors.productIds = 'At least one valid product ID is required';
         } else {
            // Convert to products array as per schema
            result.data.products = validProductIds;
         }
      } else {
         result.valid = false;
         result.errors.productIds = 'Product IDs must be an array';
      }

      return result;
   } catch (error) {
      return {
         valid: false,
         data: {},
         errors: { general: 'Failed to validate collection data' },
         exception: error.message
      };
   }
};

export const sanitizedOffer = (offer) => {
  try {
    const sanitizedOffer = {};
    const errors = {};

    // Validate offerName (required, string, 3-50 chars)
    if (!offer.offerName || typeof offer.offerName !== 'string' || !offer.offerName.trim()) {
      errors.offerName = "Offer name is required";
    } else if (offer.offerName.trim().length < 3 || offer.offerName.trim().length > 50) {
      errors.offerName = "Offer name must be between 3 and 50 characters";
    } else {
      sanitizedOffer.offerName = offer.offerName.trim();
    }

    // Validate offerCode (required, string, must be uppercase)
    if (!offer.offerCode || typeof offer.offerCode !== 'string' || !offer.offerCode.trim()) {
      errors.offerCode = "Offer code is required";
    } else {
      const code = offer.offerCode.trim();
      if (code !== code.toUpperCase()) {
        errors.offerCode = "Offer code must be in UPPERCASE";
      } else {
        sanitizedOffer.offerCode = code;
      }
    }

    // Validate offerStatus (boolean, defaults to false)
    if (offer.offerStatus !== undefined) {
      sanitizedOffer.offerStatus = Boolean(offer.offerStatus);
    } else {
      sanitizedOffer.offerStatus = false; // Default value
    }

    // Validate discountValue (required, positive number)
    if (offer.discountValue !== undefined) {
      const parsedDiscount = typeof offer.discountValue === 'string' 
        ? parseFloat(offer.discountValue) 
        : offer.discountValue;
      
      if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
        errors.discountValue = "Discount value must be a positive number";
      } else {
        sanitizedOffer.discountValue = parsedDiscount;
      }
    } else {
      errors.discountValue = "Discount value is required";
    }

    // Validate startDate (required, valid date)
    if (!offer.startDate) {
      errors.startDate = "Start date is required";
    } else {
      const startDate = new Date(offer.startDate);
      if (isNaN(startDate.getTime())) {
        errors.startDate = "Start date is not a valid date";
      } else {
        sanitizedOffer.startDate = startDate;
      }
    }

    // Validate endDate (required, valid date, after startDate)
    if (!offer.endDate) {
      errors.endDate = "End date is required";
    } else {
      const endDate = new Date(offer.endDate);
      if (isNaN(endDate.getTime())) {
        errors.endDate = "End date is not a valid date";
      } else {
        sanitizedOffer.endDate = endDate;
        
        // Check if endDate is after startDate (only if both are valid)
        if (sanitizedOffer.startDate && !errors.startDate && !errors.endDate) {
          if (endDate <= sanitizedOffer.startDate) {
            errors.endDate = "End date must be after start date";
          }
        }
      }
    }

    // Validate products (array of valid ObjectIds)
    if (offer.products) {
      if (!Array.isArray(offer.products)) {
        errors.products = "Products must be an array";
      } else {
        const validProductIds = offer.products
          .filter(id => id && typeof id === 'string' && id.trim() !== '')
          .filter(id => {
            // Check if valid MongoDB ObjectId format
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            return objectIdRegex.test(id.trim());
          })
          .map(id => id.trim());
        
        sanitizedOffer.products = validProductIds;
      }
    } else {
      // Products array is optional in this case
      sanitizedOffer.products = [];
    }

    // Return validation result
    if (Object.keys(errors).length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data: sanitizedOffer };
  } catch (error) {
    console.error("Error sanitizing offer:", error);
    return {
      valid: false,
      errors: { general: "Failed to validate offer data" },
      exception: error.message
    };
  }
};