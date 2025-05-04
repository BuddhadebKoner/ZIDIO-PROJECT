import { ChevronLeft, Loader2, AlertCircle, Lock, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import { toast } from 'react-toastify';
import FindCollections from '../../components/dataFinding/FindCollections';
import { getProductById } from '../../lib/api/product.api';
import { updateProduct } from '../../lib/api/admin.api';
import {
  validateProductForm,
  processProductData,
  identifyChangedFields,
  formatSubmitData,
  updateImageArray
} from '../../utils/product.utils';

const AdminUpdateProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subTitle: '',
    description: '',
    price: '',
    images: [],
    bannerImageUrl: '',
    bannerImageId: '',
    sizes: [],
    tags: '',
    technologyStack: '',
    productModelLink: '',
    categoryName: '',
    subCategory: '',
    path: '',
    collections: []
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [offerData, setOfferData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [dirtyFields, setDirtyFields] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) {
        setFetchLoading(false);
        setFetchError("No product ID provided");
        return;
      }

      try {
        setFetchLoading(true);
        setFetchError('');

        const response = await getProductById(slug);
        // console.log("Product data response:", response);

        if (!response || !response.product) {
          throw new Error("Product not found or invalid response format");
        }

        const productData = response.product;
        setOriginalData(productData);

        if (productData.offer) {
          setOfferData(productData.offer);
        }

        if (productData.inventory) {
          // console.log("Inventory data:", productData.inventory);
          setInventoryData(productData.inventory);
        }

        const processedData = processProductData(productData);
        setFormData(processedData);

      } catch (err) {
        console.error("Failed to fetch product:", err);
        setFetchError(err.message || "Failed to load product data. Please try again.");
        toast.error("Error loading product data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setDirtyFields(prev => ({
      ...prev,
      [field]: true
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSizeChange = (size) => {
    const newSizes = [...formData.sizes];

    const sizeIndex = newSizes.indexOf(size);
    if (sizeIndex === -1) {
      newSizes.push(size);
    } else {
      newSizes.splice(sizeIndex, 1);
    }

    handleFieldChange('sizes', newSizes);
  };

  // const removeCollection = (collectionId) => {
  //   handleFieldChange('collections', formData.collections.filter(id => id !== collectionId));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateProductForm(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the form errors before submitting");
      const firstErrorId = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const changedFields = identifyChangedFields(dirtyFields, formData, originalData);

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes to update");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = formatSubmitData(changedFields, formData);

      if (submitData.images && submitData.images.filter(img => img.imageUrl && img.imageId).length === 0) {
        throw new Error('Please upload at least one product image');
      }

      console.log("Submitting changes:", submitData);

      const response = await updateProduct(slug, submitData);

      if (response.success) {
        toast.success(response.message || "Product updated successfully");
        setDirtyFields({});
        setOriginalData({ ...originalData, ...submitData });
      } else {
        throw new Error(response.message || "Failed to update product");
      }

    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product. Please try again.");
      toast.error("Error updating product");
    } finally {
      setLoading(false);
    }
  };

  const addProductImage = (imageUrl, imageId, index) => {
    const updatedImages = updateImageArray(formData.images, {
      action: 'add',
      imageUrl,
      imageId,
      index
    });

    setFormData(prev => ({ ...prev, images: updatedImages }));
    setDirtyFields(prev => ({ ...prev, images: true }));
  };

  const removeProductImage = (index) => {
    const updatedImages = updateImageArray(formData.images, {
      action: 'remove',
      index
    });

    setFormData(prev => ({ ...prev, images: updatedImages }));
    setDirtyFields(prev => ({ ...prev, images: true }));
  };

  const addImageField = () => {
    const updatedImages = updateImageArray(formData.images, { action: 'addField' });
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const hasChanges = Object.keys(dirtyFields).length > 0 &&
    Object.keys(identifyChangedFields(dirtyFields, formData, originalData)).length > 0;


  if (fetchLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
        <div className="text-xl">Loading product data...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/products" className="text-gray-400 hover:text-primary-500">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl font-bold">Update Product</h1>
        </div>
        <div className="bg-red-900/30 text-red-400 p-6 rounded-md mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl mb-2 font-semibold">Error Loading Product</h3>
              <p>{fetchError}</p>
              <Link to="/admin/products" className="btn-primary mt-4 inline-block">
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-primary-500">
          <ChevronLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold">Update Product</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 text-red-400 p-4 rounded-md mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {Object.keys(dirtyFields).length > 0 && (
        <div className="bg-yellow-900/30 text-yellow-400 p-4 rounded-md mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>You have unsaved changes. Don't forget to click "Update Product" when you're done.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  className={`w-full px-4 py-3 bg-surface border ${validationErrors.title ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                  placeholder="Product Title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  required
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Slug</label>
                  <Lock className="w-4 h-4 ml-2 text-gray-400" title="Non-editable field" />
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                  value={formData.slug}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Slug cannot be changed after creation</p>
              </div>
              <div>
                <label htmlFor="subTitle" className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  id="subTitle"
                  type="text"
                  className={`w-full px-4 py-3 bg-surface border ${validationErrors.subTitle ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                  placeholder="Product Subtitle"
                  value={formData.subTitle}
                  onChange={(e) => handleFieldChange('subTitle', e.target.value)}
                  required
                />
                {validationErrors.subTitle && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.subTitle}</p>
                )}
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 bg-surface border ${validationErrors.price ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                  placeholder="19.99"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  required
                />
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="description"
                className={`w-full px-4 py-3 bg-surface border ${validationErrors.description ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                rows="4"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                required
              ></textarea>
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Banner Image</h2>
            {validationErrors.bannerImage && (
              <div className="mb-3 p-3 bg-red-900/30 text-red-400 rounded-md">
                {validationErrors.bannerImage}
              </div>
            )}
            <SingleImageUploader
              setImageUrl={(url) => {
                handleFieldChange('bannerImageUrl', url);
              }}
              setImageId={(id) => {
                handleFieldChange('bannerImageId', id);
              }}
              label="Banner Image"
              currentImageUrl={formData.bannerImageUrl}
              disabled={loading}
              path="products"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary-300">Product Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="btn-secondary text-sm px-3 py-1"
                disabled={loading}
              >
                Add Image
              </button>
            </div>

            {validationErrors.images && (
              <div className="mb-3 p-3 bg-red-900/30 text-red-400 rounded-md">
                {validationErrors.images}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-md relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600"
                    onClick={() => removeProductImage(index)}
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <SingleImageUploader
                    setImageUrl={(url) => addProductImage(url, image.imageId || '', index)}
                    setImageId={(id) => addProductImage(image.imageUrl || '', id, index)}
                    label={`Product Image #${index + 1}`}
                    currentImageUrl={image.imageUrl}
                    disabled={loading}
                    path="products"
                    aspectRatio="square"
                  />
                </div>
              ))}
            </div>

            {formData.images.length === 0 && (
              <div className="text-center p-8 border border-dashed border-gray-600 rounded-md">
                <p className="text-gray-400 mb-3">No product images added</p>
                <button
                  type="button"
                  onClick={addImageField}
                  className="btn-secondary text-sm px-4 py-2"
                  disabled={loading}
                >
                  Add Image
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Product Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sizes</label>
              {validationErrors.sizes && (
                <p className="mb-2 text-sm text-red-500">{validationErrors.sizes}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <div
                    key={size}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${formData.sizes.includes(size)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
              {formData.sizes.length > 0 && (
                <div className="mt-2 text-sm text-primary-300">
                  Selected sizes: {formData.sizes.join(', ')}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="productModelLink" className="block text-sm font-medium mb-1">Product Model Link (Optional)</label>
              <input
                id="productModelLink"
                type="text"
                className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                placeholder="https://example.com/model"
                value={formData.productModelLink}
                onChange={(e) => handleFieldChange('productModelLink', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">URL to 3D model or external reference (if available)</p>
            </div>

            <div className="mt-4">
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                id="tags"
                type="text"
                className={`w-full px-4 py-3 bg-surface border ${validationErrors.tags ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                placeholder="shirt, cotton, summer"
                value={formData.tags}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                required
              />
              {validationErrors.tags && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.tags}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter keywords to make your product discoverable</p>
            </div>

            <div className="mt-4">
              <label htmlFor="technologyStack" className="block text-sm font-medium mb-1">Technology Stack (comma separated)</label>
              <input
                id="technologyStack"
                type="text"
                className={`w-full px-4 py-3 bg-surface border ${validationErrors.technologyStack ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                placeholder="cotton, polyester, spandex"
                value={formData.technologyStack}
                onChange={(e) => handleFieldChange('technologyStack', e.target.value)}
                required
              />
              {validationErrors.technologyStack && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.technologyStack}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">List materials and technologies used in this product</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Category Name</label>
                  <Lock className="w-4 h-4 ml-2 text-gray-400" title="Non-editable field" />
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                  value={formData.categoryName}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Category cannot be changed after creation</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Sub Category</label>
                  <Lock className="w-4 h-4 ml-2 text-gray-400" title="Non-editable field" />
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                  value={formData.subCategory}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Sub-category cannot be changed after creation</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Path</label>
                  <Lock className="w-4 h-4 ml-2 text-gray-400" title="Non-editable field" />
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                  value={formData.path}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Path cannot be changed after creation</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-primary-300">Collections</h2>
              <div>
                <FindCollections
                  onSelectCollection={(collectionId, collectionName) => {
                    if (formData.collections.includes(collectionId)) {
                      handleFieldChange('collections',
                        formData.collections.filter(id => id !== collectionId));
                    } else {
                      handleFieldChange('collections',
                        [...formData.collections, collectionId]);
                    }
                  }}
                  selectedCollectionId={formData.collections}
                />
              </div>
            </div>
          </div>

          {/* offer */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Offer</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">
                Offers allow you to provide discounts on specific products. The current offer cannot be changed here.
                To manage the product's offer, please use the Offers management page.
              </p>
              <div className="border border-gray-700 rounded-md p-4">
                {offerData ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Offer</p>
                      <div className="text-gray-400">
                        <p>{offerData.offerName} ({offerData.offerCode})</p>
                        <p className="text-green-400">{offerData.discountValue}% discount</p>
                        <p className="text-xs mt-1">Valid until: {new Date(offerData.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/admin/offer/${offerData.offerCode}`} className="btn-secondary text-sm">
                      Manage Offer
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">This product is not part of any offer</p>
                    <Link to="/admin/offer" className="btn-secondary text-sm">
                      Manage Offers
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* inventory */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary-300">Inventory</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">
                Manage the inventory for this product. You can set the available quantity and track stock levels.
              </p>
              <div className="border border-gray-700 rounded-md p-4">
                {inventoryData ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium">Current Stock Levels</p>
                      <Link to="/admin/inventory/" className="btn-secondary text-sm">
                        Manage Inventory
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-4">Size</th>
                            <th className="text-right py-2 px-4">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData.stocks.map((stock) => (
                            <tr key={stock._id} className="border-b border-gray-700/50">
                              <td className="py-2 px-4">{stock.size}</td>
                              <td className="py-2 px-4 text-right">{stock.quantity}</td>
                            </tr>
                          ))}
                          <tr className="font-medium">
                            <td className="py-2 px-4">Total</td>
                            <td className="py-2 px-4 text-right">{inventoryData.totalQuantity}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">No inventory data available for this product</p>
                    <Link to="/admin/inventory" className="btn-secondary text-sm">
                      Manage Inventory
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <Link to="/admin/products" className="btn-secondary mr-4">
            Cancel
          </Link>
          <button
            type="submit"
            className={`btn-primary ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateProduct;