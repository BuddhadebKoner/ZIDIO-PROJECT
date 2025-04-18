import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from "react-toastify";
import SingleImageUploader from '../../components/shared/SingleImageUploader';
import { addCollection } from '../../lib/api/admin.api';
import FindProducts from '../../components/dataFinding/FindProducts';

const AdminAddCollection = () => {
   const navigate = useNavigate()
   const [formData, setFormData] = useState({
      name: '',
      slug: '',
      subtitle: '',
      isFeatured: false,
      bannerImageUrl: '',
      bannerImageId: '',
      productIds: []
   })
   const [loading, setLoading] = useState(false)
   const [errors, setErrors] = useState({})
   const [generalError, setGeneralError] = useState('')

   // Generate slug from name
   useEffect(() => {
      if (formData.name && !formData.slug) {
         const generatedSlug = formData.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Remove consecutive hyphens

         setFormData(prev => ({ ...prev, slug: generatedSlug }));
      }
   }, [formData.name]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target

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
      })
   }

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
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setGeneralError('')
      setErrors({})

      // Basic client-side validation
      const clientErrors = {};

      if (!formData.name.trim()) {
         clientErrors.name = 'Collection name is required';
      }

      if (!formData.slug.trim()) {
         clientErrors.slug = 'Slug is required';
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
         clientErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
      }

      if (!formData.subtitle.trim()) {
         clientErrors.subtitle = 'Subtitle is required';
      }

      if (!formData.bannerImageUrl || !formData.bannerImageId) {
         clientErrors.bannerImageUrl = 'Banner image is required';
      }

      if (formData.productIds.length === 0) {
         clientErrors.productIds = 'At least one product is required';
      }

      // If client-side validation fails, show errors and return
      if (Object.keys(clientErrors).length > 0) {
         setErrors(clientErrors);
         setLoading(false);
         toast.error('Please fix the form errors');
         return;
      }

      try {
         // Create submission data
         const dataToSubmit = {
            ...formData,
         }

         // Submit to API endpoint
         const response = await addCollection(dataToSubmit);

         if (!response.success) {
            // Handle field-specific errors from API
            if (response.fieldErrors) {
               setErrors(response.fieldErrors);
               toast.error('Please fix the form errors');
            } else {
               setGeneralError(response.message || 'Failed to add collection');
               toast.error(response.message || 'Failed to add collection');
            }
            setLoading(false);
            return;
         }

         // Success case
         toast.success('Collection added successfully!');
      } catch (error) {
         console.error('Error submitting form:', error);
         setGeneralError('An unexpected error occurred');
         toast.error('An unexpected error occurred');
      } finally {
         setLoading(false);
      }
   }

   return (
      <>
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
               <Link to="/admin/collection" className="text-gray-400 hover:text-primary-500">
                  <ChevronLeft className="w-8 h-8" />
               </Link>
               <h1 className="text-2xl font-bold">Add New Collection</h1>
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

                     {/* Collection Slug Field */}
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
                              className={`w-full px-4 py-3 bg-surface border ${errors.slug ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                              placeholder="collection-slug"
                              required
                           />
                        </div>
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
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Add Products</h2>

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
                     disabled={loading}
                     className="btn-primary flex items-center justify-center min-w-32"
                  >
                     {loading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Adding Collection...
                        </>
                     ) : 'Add Collection'}
                  </button>
                  <button
                     type="button"
                     onClick={() => navigate('/admin/collections')}
                     className="btn-secondary"
                  >
                     Cancel
                  </button>
               </div>
            </form>
         </div>
      </>
   )
}

export default AdminAddCollection