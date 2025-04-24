import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { X, ChevronLeft, LoaderCircle } from 'lucide-react'
import { toast } from "react-toastify";
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import FindProducts from '../../components/dataFinding/FindProducts';
import { getCollectionById } from '../../lib/api/auth.api';
import { 
  identifyCollectionChanges, 
  validateCollectionForm,
  formatCollectionDataForForm
} from '../../utils/collection.utils';
import { updateCollection } from '../../lib/api/admin.api';

const AdminUpdateCollection = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subtitle: '',
    isFeatured: false,
    bannerImageUrl: '',
    bannerImageId: '',
    productIds: []
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Fetch collection data based on slug
  useEffect(() => {
    const fetchCollectionData = async () => {
      setFetchLoading(true);
      try {
        const response = await getCollectionById(slug);

        if (response && response.success) {
          const formattedData = formatCollectionDataForForm(response.collection);
          setFormData(formattedData);
          setOriginalData(formattedData);
        } else {
          setGeneralError('Failed to fetch collection data');
          toast.error('Failed to fetch collection data');
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setGeneralError('An error occurred while fetching collection data');
        toast.error('Failed to load collection data');
      } finally {
        setFetchLoading(false);
      }
    };

    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear field-specific error when user changes the value
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProductSelection = (selectedProductIds) => {
    setFormData({
      ...formData,
      productIds: selectedProductIds
    });

    // Clear product ID errors
    if (errors.productIds) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.productIds;
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setErrors({});

    // Validate form data using utility function
    const validationErrors = validateCollectionForm(formData);

    // If validation fails, show errors and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      toast.error('Please fix the form errors');
      return;
    }

    // Identify changed fields using utility function
    const changedFields = identifyCollectionChanges(originalData, formData);

    if (!changedFields) {
      toast.info('No changes detected');
      setLoading(false);
      return;
    }

    try {
      // Call the API with only the changed fields
      const response = await updateCollection(slug, changedFields);

      console.log('Update response:', response);
      
      if (response.success) {
        toast.success(response.message || 'Collection updated successfully');
      } else {
        // Handle field-specific errors
        if (response.fieldErrors) {
          setErrors(response.fieldErrors);
          toast.error('Please fix the form errors');
        } else {
          // Handle general error
          setGeneralError(response.message || 'Failed to update collection');
          toast.error(response.message || 'Failed to update collection');
        }
      }
    } catch (error) {
      console.error('Error in update submission:', error);
      setGeneralError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary-500 mb-4" />
        <div className="text-xl">Loading collection data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/collections" className="text-gray-400 hover:text-primary-500">
          <ChevronLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold">Update Collection</h1>
      </div>

      {generalError && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-md border border-red-300">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg">
        <div className="space-y-4 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collection Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Collection Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                placeholder="Enter collection name"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Collection Slug Field - Make it disabled */}
            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-md focus:outline-none text-text cursor-not-allowed opacity-70"
                  placeholder="collection-slug"
                  disabled={true}
                  required
                />
              </div>
              <p className="text-xs text-gray-400">Slug cannot be changed after creation</p>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          {/* Collection Subtitle Field */}
          <div className="space-y-2">
            <label htmlFor="subtitle" className="block text-sm font-medium">
              Subtitle <span className="text-red-500">*</span>
            </label>
            <textarea
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              rows={2}
              placeholder="Enter collection subtitle"
              className={`w-full px-4 py-3 bg-surface border ${errors.subtitle ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
              required
            ></textarea>
            {errors.subtitle && (
              <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>
            )}
          </div>
        </div>

        {/* Banner Image Section */}
        <div className="space-y-4 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">Banner Information</h2>

          <SingleImageUploader
            setImageUrl={(url) => {
              setFormData(prevData => ({ ...prevData, bannerImageUrl: url }));
              if (errors.bannerImageUrl) {
                setErrors(prev => {
                  const updated = { ...prev };
                  delete updated.bannerImageUrl;
                  return updated;
                });
              }
            }}
            setImageId={(id) => setFormData(prevData => ({ ...prevData, bannerImageId: id }))}
            label="Banner Image"
            currentImageUrl={formData.bannerImageUrl}
            disabled={loading}
            path="collections"
          />
          {errors.bannerImageUrl && (
            <p className="text-red-500 text-xs mt-1">{errors.bannerImageUrl}</p>
          )}

          {/* Image Preview - only show if image URL exists but not from SingleImageUploader */}
          {formData.bannerImageUrl && !formData.bannerImageUrl.includes('cloudinary') && (
            <div className="mt-4 rounded-md overflow-hidden border border-gray-700">
              <div className="flex items-center justify-center min-h-[150px] p-2">
                <img
                  src={formData.bannerImageUrl}
                  alt="Banner preview"
                  className="max-w-full max-h-48 rounded-md object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=Invalid+Image+URL";
                    e.target.classList.add("border", "border-red-500");
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="space-y-4 bg-gray-850 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">Products</h2>

          <div className="space-y-3">
            <FindProducts
              onSelectProducts={handleProductSelection}
              selectedProductIds={formData.productIds}
            />
          </div>

          {errors.productIds && (
            <p className="text-red-500 text-xs mt-1">{errors.productIds}</p>
          )}

          <p className="text-xs text-gray-400">
            Select all products that should be included in this collection
          </p>
        </div>

        {/* Featured Collection Checkbox */}
        <div className="flex items-center bg-gray-800 p-3 rounded-md">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 block text-sm">
            Feature this collection on homepage
          </label>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading || fetchLoading}
            className={`btn-primary flex items-center justify-center min-w-32 ${
              (loading || fetchLoading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <LoaderCircle className='animate-spin mr-2' />
                Updating Collection...
              </>
            ) : 'Update Collection'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/collections')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateCollection;