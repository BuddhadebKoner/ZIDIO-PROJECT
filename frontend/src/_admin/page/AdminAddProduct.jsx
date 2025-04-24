import { ChevronLeft, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import { toast } from 'react-toastify';
import { addProduct } from '../../lib/api/admin.api';
import FindCollections from '../../components/dataFinding/FindCollections';

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subTitle: '',
    description: '',
    price: '',
    images: [
      { imageUrl: '', imageId: '' },
    ],
    bannerImageUrl: '',
    bannerImageId: '',
    sizes: [],
    tags: '',
    technologyStack: '',
    productModelLink: '',
    isUnderPremium: false,
    isExcusiveProducts: false,
    isNewArrival: false,
    isUnderHotDeals: false,
    isBestSeller: false,
    isWomenFeatured: false,
    isMenFeatured: false,
    isFeaturedToBanner: false,
    isTrendingNow: false,
    categoryName: '',
    subCategory: '',
    path: '',
    collections: [] // Changed from string to array
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Size options
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Handle size selection
  const handleSizeChange = (size) => {
    if (formData.sizes.includes(size)) {
      // Remove size if already selected
      setFormData({
        ...formData,
        sizes: formData.sizes.filter(s => s !== size)
      });

      console.log("Size added:", formData.sizes);
    } else {
      // Add size if not already selected
      setFormData({
        ...formData,
        sizes: [...formData.sizes, size]
      });

      console.log("Size added:", formData.sizes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log("Form data before submission:", formData.bannerImageUrl);

    // Validate required fields
    if (!formData.bannerImageUrl || !formData.bannerImageId) {
      setError('Please upload a banner image');
      toast.error('Banner image is required');
      setLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one product image');
      toast.error('At least one product image is required');
      setLoading(false);
      return;
    }

    if (formData.sizes.length === 0) {
      setError('Please select at least one size');
      toast.error('At least one size is required');
      setLoading(false);
      return;
    }

    // Continue with form submission
    console.log("Form data:", formData);
    // Here you would typically send data to API
    const res = await addProduct(formData);
    console.log("Response from API:", res);
    toast.success("Product created successfully!");
    setLoading(false);
  };

  // Add image to the product images array
  const addProductImage = (imageUrl, imageId, index) => {
    setFormData(prevState => {
      const updatedImages = [...prevState.images];

      // If index exists, update that specific image
      if (index !== undefined && updatedImages[index]) {
        // If we're updating the URL, keep the existing ID
        if (imageUrl) {
          updatedImages[index] = {
            ...updatedImages[index],
            imageUrl: imageUrl
          };
        }
        // If we're updating the ID, keep the existing URL
        if (imageId) {
          updatedImages[index] = {
            ...updatedImages[index],
            imageId: imageId
          };
        }
      } else {
        // Otherwise add new image
        updatedImages.push({ imageUrl, imageId });
      }

      return {
        ...prevState,
        images: updatedImages
      };
    });
  };

  // Remove image from the array
  const removeProductImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  // Add empty image slot for uploader
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { imageUrl: '', imageId: '' }]
    });
  };

  // New function to handle removing a collection
  const removeCollection = (collectionId) => {
    setFormData({
      ...formData,
      collections: formData.collections.filter(id => id !== collectionId)
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-primary-500">
          <ChevronLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="Product Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="product-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="Product Subtitle"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="19.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                rows="4"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>
          </div>

          {/* Banner Image Section */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Banner Image</h2>
            <SingleImageUploader
              setImageUrl={(url) => setFormData({ ...formData, bannerImageUrl: url })}
              setImageId={(id) => {
                console.log("Setting banner ID:", id);
                setFormData(prevState => ({
                  ...prevState,
                  bannerImageId: id
                }));
              }}
              label="Banner Image"
              currentImageUrl={formData.bannerImageUrl}
              disabled={loading}
              path="products"
            />
          </div>

          {/* Product Images Section - Updated with SingleImageUploader for each image */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary-300">Product Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="btn-secondary text-sm px-3 py-1"
              >
                Add Image
              </button>
            </div>

            {/* Product Images Array */}
            {formData.images.map((image, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-700 rounded relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                  onClick={() => removeProductImage(index)}
                >
                  ✕
                </button>
                <SingleImageUploader
                  setImageUrl={(url) => addProductImage(url, image.imageId || '', index)}
                  setImageId={(id) => addProductImage(image.imageUrl || '', id, index)}
                  label={`Product Image #${index + 1}`}
                  currentImageUrl={image.imageUrl}
                  disabled={loading}
                  path="products"
                />
              </div>
            ))}

            {formData.images.length === 0 && (
              <div className="text-center p-4 border border-dashed border-gray-600 rounded">
                <p className="text-gray-400">Click "Add Image" to add product images</p>
              </div>
            )}
          </div>

          {/* Product Details - Updated with multi-select sizes */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Product Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sizes</label>
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <div key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`size-${size}`}
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="mr-2"
                    />
                    <label htmlFor={`size-${size}`} className="cursor-pointer">{size}</label>
                  </div>
                ))}
              </div>
              {formData.sizes.length > 0 && (
                <div className="mt-2 text-sm">
                  Selected sizes: {formData.sizes.join(', ')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Model Link</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                placeholder="https://example.com/model"
                value={formData.productModelLink}
                onChange={(e) => setFormData({ ...formData, productModelLink: e.target.value })}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                placeholder="shirt, cotton, summer"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Technology Stack (comma separated)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                placeholder="cotton, polyester, spandex"
                value={formData.technologyStack}
                onChange={(e) => setFormData({ ...formData, technologyStack: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Featured Options */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Featured Options</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUnderPremium"
                  className="mr-2"
                  checked={formData.isUnderPremium}
                  onChange={(e) => setFormData({ ...formData, isUnderPremium: e.target.checked })}
                />
                <label htmlFor="isUnderPremium">Premium Product</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isExcusiveProducts"
                  className="mr-2"
                  checked={formData.isExcusiveProducts}
                  onChange={(e) => setFormData({ ...formData, isExcusiveProducts: e.target.checked })}
                />
                <label htmlFor="isExcusiveProducts">Exclusive Product</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNewArrival"
                  className="mr-2"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                />
                <label htmlFor="isNewArrival">New Arrival</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUnderHotDeals"
                  className="mr-2"
                  checked={formData.isUnderHotDeals}
                  onChange={(e) => setFormData({ ...formData, isUnderHotDeals: e.target.checked })}
                />
                <label htmlFor="isUnderHotDeals">Hot Deal</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBestSeller"
                  className="mr-2"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                />
                <label htmlFor="isBestSeller">Best Seller</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isWomenFeatured"
                  className="mr-2"
                  checked={formData.isWomenFeatured}
                  onChange={(e) => setFormData({ ...formData, isWomenFeatured: e.target.checked })}
                />
                <label htmlFor="isWomenFeatured">Women Featured</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMenFeatured"
                  className="mr-2"
                  checked={formData.isMenFeatured}
                  onChange={(e) => setFormData({ ...formData, isMenFeatured: e.target.checked })}
                />
                <label htmlFor="isMenFeatured">Men Featured</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeaturedToBanner"
                  className="mr-2"
                  checked={formData.isFeaturedToBanner}
                  onChange={(e) => setFormData({ ...formData, isFeaturedToBanner: e.target.checked })}
                />
                <label htmlFor="isFeaturedToBanner">Featured to Banner</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isTrendingNow"
                  className="mr-2"
                  checked={formData.isTrendingNow}
                  onChange={(e) => setFormData({ ...formData, isTrendingNow: e.target.checked })}
                />
                <label htmlFor="isTrendingNow">Trending Now</label>
              </div>
            </div>
          </div>

          {/* Category - Updated with dropdowns */}
          <div className="md:col-span-2">
            <div className='flex flex-col'>
              <h2 className="text-xl font-semibold mb-4 text-primary-300">Category</h2>
              <p className='mb-4'>
                fill carefully category cant be change after creation product
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <select
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="T-shirt">T-shirt</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category</label>
                <select
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  required
                >
                  <option value="">Select Sub Category</option>
                  <option value="Oversized">Oversized</option>
                  <option value="Acid Wash">Acid-Wash</option>
                  <option value="Graphic Printed">Graphic-Printed</option>
                  <option value="Solid Color">Solid-Color</option>
                  <option value="Polo T-Shirts">Polo-T-Shirts</option>
                  <option value="Sleeveless">Sleeveless</option>
                  <option value="Long Sleeve">Long-Sleeve</option>
                  <option value="Henley">Henley</option>
                  <option value="Hooded">Hooded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Path</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="/t-shirts/oversized"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Collections */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Collections</h2>
            <div>
              <FindCollections
                onSelectCollection={(collectionId, collectionName) => {
                  // Check if the collection is already selected
                  if (formData.collections.includes(collectionId)) {
                    // Remove it
                    setFormData({
                      ...formData,
                      collections: formData.collections.filter(id => id !== collectionId)
                    });
                  } else {
                    // Add it
                    setFormData({
                      ...formData,
                      collections: [...formData.collections, collectionId]
                    });
                  }
                }}
                selectedCollectionId={formData.collections} // Pass the entire array
              />

              {/* Display selected collections */}
              {formData.collections.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 text-primary-300">Selected Collections:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.collections.map(collectionId => (
                      <div key={collectionId}
                        className="inline-flex items-center bg-surface/60 border border-gray-700 px-3 py-1 rounded-full">
                        <span className="text-sm">{collectionId}</span>
                        <button
                          type="button"
                          onClick={() => removeCollection(collectionId)}
                          className="ml-2 text-text-muted hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Link to="/admin/products" className="btn-secondary mr-4">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;