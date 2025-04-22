import React, { useState, useEffect } from 'react';
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import FindProducts from '../../components/dataFinding/FindProducts';
import FindCollections from '../../components/dataFinding/FindCollections';
import FindOffers from '../../components/dataFinding/FindOffers';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  // Section loading states
  const [loadingStates, setLoadingStates] = useState({
    banners: false,
    exclusiveProducts: false,
    newArrivals: false,
    collections: false,
    offerFeatured: false,
    bestSellers: false,
    womenFeatured: false,
    initialFetch: true
  });

  // Initialize state based on schema
  const [formData, setFormData] = useState({
    heroBannerImages: [{
      imageUrl: '',
      imageId: '',
      path: ''
    }],
    exclusiveProducts: [],
    newArrivals: [],
    collections: {
      collectionId: '',
      imageUrl: '',
      imageId: ''
    },
    offerFeatured: [{
      imageUrl: '',
      imageId: '',
      offerId: ''
    }],
    alltimeBestSellers: '',
    womenFeatured: []
  });

  const [errors, setErrors] = useState({});

  // Fetch initial data (simulated)
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        // Mock data fetch - replace with actual API call
        setTimeout(() => {
          // Simulated data - replace with API response
          const homeContent = {
            heroBannerImages: [
              { imageUrl: 'https://example.com/banner1.jpg', imageId: 'banner1', path: '/collections/summer' }
            ],
            exclusiveProducts: [
              { productId: '60d21b4667d0d8992e610c85' }
            ],
            newArrivals: [
              { productId: '60d21b4667d0d8992e610c86' },
              { productId: '60d21b4667d0d8992e610c87' }
            ],
            collections: [
              '60d21b4667d0d8992e610c88',
              { imageUrl: 'https://example.com/collection.jpg', imageId: 'collection1' }
            ],
            offerFeatured: [
              { imageUrl: 'https://example.com/offer.jpg', imageId: 'offer1', offer: '60d21b4667d0d8992e610c89' }
            ],
            alltimeBestSellers: '60d21b4667d0d8992e610c90',
            womenFeatured: [
              { productId: '60d21b4667d0d8992e610c91' }
            ]
          };

          // Format data to match component state structure
          setFormData({
            heroBannerImages: homeContent.heroBannerImages || [{
              imageUrl: '',
              imageId: '',
              path: ''
            }],
            exclusiveProducts: homeContent.exclusiveProducts || [],
            newArrivals: homeContent.newArrivals || [],
            collections: {
              collectionId: homeContent.collections?.[0] || '',
              imageUrl: homeContent.collections?.[1]?.imageUrl || '',
              imageId: homeContent.collections?.[1]?.imageId || ''
            },
            offerFeatured: homeContent.offerFeatured || [{
              imageUrl: '',
              imageId: '',
              offerId: ''
            }],
            alltimeBestSellers: homeContent.alltimeBestSellers || '',
            womenFeatured: homeContent.womenFeatured || []
          });

          setLoadingStates(prev => ({ ...prev, initialFetch: false }));
        }, 1000);
      } catch (error) {
        console.error("Error fetching home content:", error);
        toast.error("Failed to load home content settings");
        setLoadingStates(prev => ({ ...prev, initialFetch: false }));
      }
    };

    fetchHomeContent();
  }, []);

  // BANNER METHODS
  const handleBannerImageChange = (url, index = 0) => {
    const updatedBanners = [...formData.heroBannerImages];
    updatedBanners[index] = {
      ...updatedBanners[index],
      imageUrl: url
    };

    setFormData(prevData => ({
      ...prevData,
      heroBannerImages: updatedBanners
    }));

    if (errors.heroBannerImages) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.heroBannerImages;
        return updated;
      });
    }
  };

  const handleBannerImageIdChange = (id, index = 0) => {
    const updatedBanners = [...formData.heroBannerImages];
    updatedBanners[index] = {
      ...updatedBanners[index],
      imageId: id
    };

    setFormData(prevData => ({
      ...prevData,
      heroBannerImages: updatedBanners
    }));
  };

  const handleBannerPathChange = (path, index = 0) => {
    const updatedBanners = [...formData.heroBannerImages];
    updatedBanners[index] = {
      ...updatedBanners[index],
      path: path
    };

    setFormData(prevData => ({
      ...prevData,
      heroBannerImages: updatedBanners
    }));

    if (errors[`heroBannerImages[${index}]`]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[`heroBannerImages[${index}]`];
        return updated;
      });
    }
  };

  const handleAddBanner = () => {
    setFormData(prevData => ({
      ...prevData,
      heroBannerImages: [
        ...prevData.heroBannerImages,
        { imageUrl: '', imageId: '', path: '' }
      ]
    }));
  };

  const handleRemoveBanner = (index) => {
    const updatedBanners = formData.heroBannerImages.filter((_, i) => i !== index);
    setFormData(prevData => ({
      ...prevData,
      heroBannerImages: updatedBanners
    }));

    setErrors(prev => {
      const updated = { ...prev };
      delete updated[`heroBannerImages[${index}]`];
      return updated;
    });
  };

  // PRODUCTS SELECTION METHODS
  const handleExclusiveProductsSelection = (productIds) => {
    setFormData(prevData => ({
      ...prevData,
      exclusiveProducts: productIds.map(id => ({ productId: id }))
    }));

    if (errors.exclusiveProducts) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.exclusiveProducts;
        return updated;
      });
    }
  };

  const handleNewArrivalsSelection = (productIds) => {
    setFormData(prevData => ({
      ...prevData,
      newArrivals: productIds.map(id => ({ productId: id }))
    }));

    if (errors.newArrivals) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.newArrivals;
        return updated;
      });
    }
  };

  const handleBestSellersSelection = (productIds) => {
    setFormData(prevData => ({
      ...prevData,
      alltimeBestSellers: productIds.length > 0 ? productIds[0] : ''
    }));

    if (errors.alltimeBestSellers) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.alltimeBestSellers;
        return updated;
      });
    }
  };

  const handleWomenFeaturedSelection = (productIds) => {
    setFormData(prevData => ({
      ...prevData,
      womenFeatured: productIds.map(id => ({ productId: id }))
    }));

    if (errors.womenFeatured) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.womenFeatured;
        return updated;
      });
    }
  };

  // COLLECTIONS METHODS
  const handleCollectionSelection = (collectionId) => {
    setFormData(prevData => ({
      ...prevData,
      collections: {
        ...prevData.collections,
        collectionId: collectionId
      }
    }));

    if (errors.collections) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.collections;
        return updated;
      });
    }
  };

  const handleCollectionImageChange = (url) => {
    setFormData(prevData => ({
      ...prevData,
      collections: {
        ...prevData.collections,
        imageUrl: url
      }
    }));

    if (errors.collectionImage) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.collectionImage;
        return updated;
      });
    }
  };

  const handleCollectionImageIdChange = (id) => {
    setFormData(prevData => ({
      ...prevData,
      collections: {
        ...prevData.collections,
        imageId: id
      }
    }));
  };

  // OFFER FEATURED METHODS
  const handleOfferImageChange = (url, index = 0) => {
    const updatedOffers = [...formData.offerFeatured];
    updatedOffers[index] = {
      ...updatedOffers[index],
      imageUrl: url
    };

    setFormData(prevData => ({
      ...prevData,
      offerFeatured: updatedOffers
    }));
  };

  const handleOfferImageIdChange = (id, index = 0) => {
    const updatedOffers = [...formData.offerFeatured];
    updatedOffers[index] = {
      ...updatedOffers[index],
      imageId: id
    };

    setFormData(prevData => ({
      ...prevData,
      offerFeatured: updatedOffers
    }));
  };

  const handleOfferSelection = (offerId, index = 0) => {
    const updatedOffers = [...formData.offerFeatured];
    updatedOffers[index] = {
      ...updatedOffers[index],
      offerId: offerId
    };

    setFormData(prevData => ({
      ...prevData,
      offerFeatured: updatedOffers
    }));
  };

  const handleAddOffer = () => {
    setFormData(prevData => ({
      ...prevData,
      offerFeatured: [
        ...prevData.offerFeatured,
        { imageUrl: '', imageId: '', offerId: '' }
      ]
    }));
  };

  const handleRemoveOffer = (index) => {
    const updatedOffers = formData.offerFeatured.filter((_, i) => i !== index);
    setFormData(prevData => ({
      ...prevData,
      offerFeatured: updatedOffers
    }));
  };

  // VALIDATION FUNCTIONS
  const validateBanners = () => {
    const bannerErrors = {};

    formData.heroBannerImages.forEach((banner, index) => {
      if (!banner.imageUrl) {
        bannerErrors[`heroBannerImages[${index}]`] = 'Banner image is required';
      }

      if (!banner.path) {
        bannerErrors[`heroBannerImages[${index}]`] = bannerErrors[`heroBannerImages[${index}]`]
          ? `${bannerErrors[`heroBannerImages[${index}]`]}. Redirect path is required`
          : 'Redirect path is required';
      }
    });

    return bannerErrors;
  };

  const validateExclusiveProducts = () => {
    if (formData.exclusiveProducts.length === 0) {
      return { exclusiveProducts: 'Please select at least one exclusive product' };
    }
    return {};
  };

  const validateNewArrivals = () => {
    if (formData.newArrivals.length === 0) {
      return { newArrivals: 'Please select at least one new arrival product' };
    }
    return {};
  };

  const validateCollections = () => {
    const collectionErrors = {};

    if (!formData.collections.collectionId) {
      collectionErrors.collections = 'Please select a collection';
    }

    if (!formData.collections.imageUrl && formData.collections.collectionId) {
      collectionErrors.collectionImage = 'Collection image is required';
    }

    return collectionErrors;
  };

  const validateOfferFeatured = () => {
    const offerErrors = {};

    formData.offerFeatured.forEach((offer, index) => {
      if (!offer.imageUrl) {
        offerErrors[`offerFeatured[${index}]`] = 'Offer image is required';
      }

      if (!offer.offerId) {
        offerErrors[`offerFeatured[${index}]`] = offerErrors[`offerFeatured[${index}]`]
          ? `${offerErrors[`offerFeatured[${index}]`]}. Offer selection is required`
          : 'Offer selection is required';
      }
    });

    return offerErrors;
  };

  const validateBestSellers = () => {
    if (!formData.alltimeBestSellers) {
      return { alltimeBestSellers: 'Please select a best seller product' };
    }
    return {};
  };

  const validateWomenFeatured = () => {
    if (formData.womenFeatured.length === 0) {
      return { womenFeatured: 'Please select at least one women featured product' };
    }
    return {};
  };

  // UPDATE SECTION HANDLERS
  const updateBanners = () => {
    const sectionErrors = validateBanners();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, banners: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, banners: false }));
        toast.success('Banner settings updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please fix banner errors before updating');
    }
  };

  const updateExclusiveProducts = () => {
    const sectionErrors = validateExclusiveProducts();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, exclusiveProducts: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, exclusiveProducts: false }));
        toast.success('Exclusive products updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please select at least one exclusive product');
    }
  };

  const updateNewArrivals = () => {
    const sectionErrors = validateNewArrivals();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, newArrivals: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, newArrivals: false }));
        toast.success('New arrivals updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please select at least one new arrival product');
    }
  };

  const updateCollections = () => {
    const sectionErrors = validateCollections();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, collections: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, collections: false }));
        toast.success('Featured collection updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please fix collection errors before updating');
    }
  };

  const updateOfferFeatured = () => {
    const sectionErrors = validateOfferFeatured();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, offerFeatured: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, offerFeatured: false }));
        toast.success('Featured offers updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please fix offer errors before updating');
    }
  };

  const updateBestSellers = () => {
    const sectionErrors = validateBestSellers();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, bestSellers: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, bestSellers: false }));
        toast.success('Best seller updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please select a best seller product');
    }
  };

  const updateWomenFeatured = () => {
    const sectionErrors = validateWomenFeatured();
    if (Object.keys(sectionErrors).length === 0) {
      setLoadingStates(prev => ({ ...prev, womenFeatured: true }));

      // Simulate API call
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, womenFeatured: false }));
        toast.success('Women featured products updated successfully');
      }, 800);
    } else {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      toast.error('Please select at least one women featured product');
    }
  };

  // Loading overlay for initial data fetch
  if (loadingStates.initialFetch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-300">Loading home content settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary-200 mb-6">Home Content Settings</h1>

      {/* Banner Information */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Banner Information</h2>
          <button
            type="button"
            onClick={updateBanners}
            disabled={loadingStates.banners}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.banners ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Banners'}
          </button>
        </div>

        {formData.heroBannerImages.map((banner, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-primary-200">Banner #{index + 1}</h3>
              {formData.heroBannerImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBanner(index)}
                  className="text-red-500 hover:text-red-400 p-1"
                  disabled={loadingStates.banners}
                >
                  <span className="text-xs">Remove</span>
                </button>
              )}
            </div>

            <SingleImageUploader
              setImageUrl={(url) => handleBannerImageChange(url, index)}
              setImageId={(id) => handleBannerImageIdChange(id, index)}
              label="Banner Image"
              currentImageUrl={banner.imageUrl}
              disabled={loadingStates.banners}
              path="homecontent"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Redirect Path
              </label>
              <input
                type="text"
                value={banner.path || ''}
                onChange={(e) => handleBannerPathChange(e.target.value, index)}
                placeholder="/collections/summer-sale"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                disabled={loadingStates.banners}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the path where this banner should redirect when clicked (e.g., /products/123)
              </p>
            </div>

            {errors[`heroBannerImages[${index}]`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`heroBannerImages[${index}]`]}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddBanner}
          disabled={loadingStates.banners}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <span className="mr-2">+</span> Add Another Banner
        </button>
      </div>

      {/* Exclusive Products */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Exclusive Products</h2>
          <button
            type="button"
            onClick={updateExclusiveProducts}
            disabled={loadingStates.exclusiveProducts}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.exclusiveProducts ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Exclusive Products'}
          </button>
        </div>

        <div className="space-y-3">
          <FindProducts
            onSelectProducts={handleExclusiveProductsSelection}
            selectedProductIds={formData.exclusiveProducts.map(p => p.productId)}
            disabled={loadingStates.exclusiveProducts}
          />
        </div>

        {errors.exclusiveProducts && (
          <p className="text-red-500 text-xs mt-1">{errors.exclusiveProducts}</p>
        )}

        <p className="text-xs text-gray-400">
          Select products to feature in the exclusive products section
        </p>
      </div>

      {/* New Arrivals */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">New Arrivals</h2>
          <button
            type="button"
            onClick={updateNewArrivals}
            disabled={loadingStates.newArrivals}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.newArrivals ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update New Arrivals'}
          </button>
        </div>

        <div className="space-y-3">
          <FindProducts
            onSelectProducts={handleNewArrivalsSelection}
            selectedProductIds={formData.newArrivals.map(p => p.productId)}
            disabled={loadingStates.newArrivals}
          />
        </div>

        {errors.newArrivals && (
          <p className="text-red-500 text-xs mt-1">{errors.newArrivals}</p>
        )}

        <p className="text-xs text-gray-400">
          Select products to feature in the new arrivals section
        </p>
      </div>

      {/* Featured Collection */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Featured Collection</h2>
          <button
            type="button"
            onClick={updateCollections}
            disabled={loadingStates.collections}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.collections ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Collection'}
          </button>
        </div>

        <div>
          <FindCollections
            onSelectCollection={(collectionId) => handleCollectionSelection(collectionId)}
            selectedCollectionId={formData.collections.collectionId}
            disabled={loadingStates.collections}
          />
          {formData.collections.collectionId && (
            <div className="mt-2 text-sm text-primary-300">
              Selected collection ID: {formData.collections.collectionId}
            </div>
          )}
        </div>

        {errors.collections && (
          <p className="text-red-500 text-xs mt-1">{errors.collections}</p>
        )}

        {formData.collections.collectionId && (
          <div className="mt-4">
            <SingleImageUploader
              setImageUrl={(url) => handleCollectionImageChange(url)}
              setImageId={(id) => handleCollectionImageIdChange(id)}
              label="Collection Image"
              currentImageUrl={formData.collections.imageUrl}
              disabled={loadingStates.collections}
              path="collections"
            />
            {errors.collectionImage && (
              <p className="text-red-500 text-xs mt-1">{errors.collectionImage}</p>
            )}
          </div>
        )}
      </div>

      {/* Offer Featured */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Featured Offers</h2>
          <button
            type="button"
            onClick={updateOfferFeatured}
            disabled={loadingStates.offerFeatured}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.offerFeatured ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Offers'}
          </button>
        </div>

        {formData.offerFeatured.map((offer, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-primary-200">Offer #{index + 1}</h3>
              {formData.offerFeatured.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOffer(index)}
                  className="text-red-500 hover:text-red-400 p-1"
                  disabled={loadingStates.offerFeatured}
                >
                  <span className="text-xs">Remove</span>
                </button>
              )}
            </div>

            <SingleImageUploader
              setImageUrl={(url) => handleOfferImageChange(url, index)}
              setImageId={(id) => handleOfferImageIdChange(id, index)}
              label="Offer Image"
              currentImageUrl={offer.imageUrl}
              disabled={loadingStates.offerFeatured}
              path="offers"
            />

            <div className="mt-4">
              <FindOffers
                onSelectOffer={(offerId) => handleOfferSelection(offerId, index)}
                selectedOfferId={offer.offerId}
                disabled={loadingStates.offerFeatured}
              />
            </div>

            {errors[`offerFeatured[${index}]`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`offerFeatured[${index}]`]}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddOffer}
          disabled={loadingStates.offerFeatured}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <span className="mr-2">+</span> Add Another Offer
        </button>
      </div>

      {/* Best Sellers */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Best Sellers</h2>
          <button
            type="button"
            onClick={updateBestSellers}
            disabled={loadingStates.bestSellers}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.bestSellers ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Best Sellers'}
          </button>
        </div>

        <div className="space-y-3">
          <FindProducts
            onSelectProducts={handleBestSellersSelection}
            selectedProductIds={formData.alltimeBestSellers ? [formData.alltimeBestSellers] : []}
            disabled={loadingStates.bestSellers}
            maxItems={1}
          />
        </div>

        {errors.alltimeBestSellers && (
          <p className="text-red-500 text-xs mt-1">{errors.alltimeBestSellers}</p>
        )}

        <p className="text-xs text-gray-400">
          Select a product to feature in the best sellers section
        </p>
      </div>

      {/* Women Featured */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-850">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-300">Women Featured Products</h2>
          <button
            type="button"
            onClick={updateWomenFeatured}
            disabled={loadingStates.womenFeatured}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
          >
            {loadingStates.womenFeatured ? (
              <>
                <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : 'Update Women Featured'}
          </button>
        </div>

        <div className="space-y-3">
          <FindProducts
            onSelectProducts={handleWomenFeaturedSelection}
            selectedProductIds={formData.womenFeatured.map(p => p.productId)}
            disabled={loadingStates.womenFeatured}
          />
        </div>

        {errors.womenFeatured && (
          <p className="text-red-500 text-xs mt-1">{errors.womenFeatured}</p>
        )}

        <p className="text-xs text-gray-400">
          Select products to feature in the women section
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;