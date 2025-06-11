import { ChevronLeft, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import { toast } from 'react-toastify';
import { addProduct } from '../../lib/api/admin.api';
import FindCollections from '../../components/dataFinding/FindCollections';
import { useAuth } from '../../context/AuthContext';

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
    sizes: [],
    tags: '',
    technologyStack: '',
    productModelLink: '',
    categoryName: '',
    subCategory: '',
    collections: []
  });


  const { getToken } = useAuth();

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
  
    const token = await getToken();
    if (!token) {
      setError('You must be logged in to add products');
      toast.error('You must be logged in to add products');
      setLoading(false);
      return;
    }
    
    const res = await addProduct(formData, token);
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
  // const removeCollection = (collectionId) => {
  //   setFormData({
  //     ...formData,
  //     collections: formData.collections.filter(id => id !== collectionId)
  //   });
  // };

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