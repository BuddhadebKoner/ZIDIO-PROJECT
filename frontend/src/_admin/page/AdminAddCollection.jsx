import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X,  Plus, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from "react-toastify";
import SingleImageUploader from '../../components/shared/SingleImageUploader';

const AdminAddCollection = () => {
   const navigate = useNavigate()
   const [formData, setFormData] = useState({
      name: '',
      slug: '',
      subtitle: '',
      isFeatured: false,
      bannerImageUrl: '',
      bannerImageId: '',
      productIds: ['']
   })
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      setFormData({
         ...formData,
         [name]: type === 'checkbox' ? checked : value
      })
   }

   const handleProductIdChange = (index, value) => {
      const updatedProductIds = [...formData.productIds]
      updatedProductIds[index] = value
      setFormData({
         ...formData,
         productIds: updatedProductIds
      })
   }

   const addProductIdField = () => {
      setFormData({
         ...formData,
         productIds: [...formData.productIds, '']
      })
   }

   const removeProductIdField = (index) => {
      const updatedProductIds = formData.productIds.filter((_, i) => i !== index)
      setFormData({
         ...formData,
         productIds: updatedProductIds
      })
   }
   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      if (!formData.bannerImageUrl || !formData.bannerImageId) {
         setError('Please upload a banner image')
         toast.error('Banner image is required')
         setLoading(false)
         return
      }

      // Filter out empty product IDs
      const validProductIds = formData.productIds.filter(id => id.trim() !== '')

      if (validProductIds.length === 0) {
         setError('At least one product ID is required')
         toast.error('At least one product ID is required')
         setLoading(false)
         return
      }

      try {
         // Create submission data
         const dataToSubmit = {
            ...formData,
            productIds: validProductIds
         }

         // Submit to API endpoint
         // const response = await axios.post('/api/collections', dataToSubmit)

         // For now, just log the form data
         console.log("Form submitted:", dataToSubmit)

         // Redirect back to collection list
         // navigate('/admin/collections')
         toast.success('Collection added successfully!')
         alert('Collection added successfully!')
      } catch (error) {
         console.error('Error submitting form:', error)
         const errorMessage = error.response?.data?.message || 'Failed to add collection';
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   return (
      <>
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
               <Link to="/admin/collection" className="text-gray-400 hover:text-primary-500">
                  <ChevronLeft className="w-8 h-8" />
               </Link>
               <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>
            {
               error && (
                  <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-md border border-red-300">
                     {error}
                  </div>
               )
            }

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
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                           placeholder="Enter collection name"
                           required
                        />
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
                              className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                              placeholder="collection-slug"
                              required
                           />
                        </div>
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
                        className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                        required
                     ></textarea>
                  </div>
               </div>

               {/* Banner Image Section */}
               <div className="space-y-4 p-4 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Banner Information</h2>

                  <SingleImageUploader 
                     setImageUrl={(url) => setFormData({...formData, bannerImageUrl: url})}
                     setImageId={(id) => setFormData({...formData, bannerImageId: id})}
                     label="Banner Image"
                     currentImageUrl={formData.bannerImageUrl}
                     disabled={loading}
                     path="collections"
                  />
                  
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

                  <div className="flex justify-between items-center">
                     <h3 className="text-lg font-medium">Products</h3>
                     <button
                        type="button"
                        onClick={addProductIdField}
                        className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                     >
                        <Plus size={16} className="mr-1" />
                        Add Product
                     </button>
                  </div>

                  <div className="space-y-3">
                     {formData.productIds.map((productId, index) => (
                        <div key={index} className="flex items-center space-x-2">
                           <input
                              type="text"
                              value={productId}
                              onChange={(e) => handleProductIdChange(index, e.target.value)}
                              placeholder="Enter product ID"
                              className="flex-1 px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                              required
                           />
                           {formData.productIds.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => removeProductIdField(index)}
                                 className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md"
                              >
                                 <Trash2 size={18} />
                              </button>
                           )}
                        </div>
                     ))}
                  </div>

                  <p className="text-xs text-gray-400">
                     Add all product IDs that should be included in this collection
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