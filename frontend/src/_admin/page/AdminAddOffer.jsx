import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from "react-toastify"

const AdminAddOffer = () => {
   const navigate = useNavigate()
   const [formData, setFormData] = useState({
      offerName: '',
      offerStatus: false,
      offerCode: '',
      discountValue: '',
      startDate: '',
      endDate: '',
      products: ['']
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
      const updatedProducts = [...formData.products]
      updatedProducts[index] = value
      setFormData({
         ...formData,
         products: updatedProducts
      })
   }

   const addProductIdField = () => {
      setFormData({
         ...formData,
         products: [...formData.products, '']
      })
   }

   const removeProductIdField = (index) => {
      const updatedProducts = formData.products.filter((_, i) => i !== index)
      setFormData({
         ...formData,
         products: updatedProducts
      })
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      // Validate dates
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
         setError('End date must be after start date')
         toast.error('End date must be after start date')
         setLoading(false)
         return
      }

      // Filter out empty product IDs
      const validProducts = formData.products.filter(id => id.trim() !== '')

      try {
         // Create submission data
         const dataToSubmit = {
            ...formData,
            products: validProducts
         }

         // Submit to API endpoint
         // const response = await axios.post('/api/offers', dataToSubmit)

         // For now, just log the form data
         console.log("Offer form submitted:", dataToSubmit)

         // Redirect back to offer list
         toast.success('Offer added successfully!')
         alert('Offer added successfully!')
         // navigate('/admin/offer')
      } catch (error) {
         console.error('Error submitting form:', error)
         const errorMessage = error.response?.data?.message || 'Failed to add offer'
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
               <Link to="/admin/offer" className="text-gray-400 hover:text-primary-500">
                  <ChevronLeft className="w-8 h-8" />
               </Link>
               <h1 className="text-2xl font-bold">Add New Offer</h1>
            </div>

            {error && (
               <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-md border border-red-300">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg">
               {/* Basic Information Section */}
               <div className="space-y-4 p-4 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Offer Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Offer Name Field */}
                     <div className="space-y-2">
                        <label htmlFor="offerName" className="block text-sm font-medium">
                           Offer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           id="offerName"
                           name="offerName"
                           value={formData.offerName}
                           onChange={handleChange}
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                           placeholder="Enter offer name"
                           required
                           minLength={3}
                           maxLength={50}
                        />
                     </div>

                     {/* Offer Code Field */}
                     <div className="space-y-2">
                        <label htmlFor="offerCode" className="block text-sm font-medium">
                           Offer Code <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           id="offerCode"
                           name="offerCode"
                           value={formData.offerCode}
                           onChange={handleChange}
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                           placeholder="e.g., SUMMER2025"
                           required
                        />
                        <p className="text-xs text-gray-400">
                           This code will be used by customers during checkout
                        </p>
                     </div>
                  </div>

                  {/* Discount Value Field */}
                  <div className="space-y-2">
                     <label htmlFor="discountValue" className="block text-sm font-medium">
                        Discount Value <span className="text-red-500">*</span>
                     </label>
                     <div className="flex items-center">
                        <input
                           type="number"
                           id="discountValue"
                           name="discountValue"
                           value={formData.discountValue}
                           onChange={handleChange}
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                           placeholder="Enter discount amount"
                           required
                           min="0"
                           step="0.01"
                        />
                        <span className="ml-2">%</span>
                     </div>
                  </div>
               </div>

               {/* Date Range Section */}
               <div className="space-y-4 p-4 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Offer Validity</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Start Date Field */}
                     <div className="space-y-2">
                        <label htmlFor="startDate" className="block text-sm font-medium">
                           Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="datetime-local"
                           id="startDate"
                           name="startDate"
                           value={formData.startDate}
                           onChange={handleChange}
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text"
                           required
                        />
                     </div>

                     {/* End Date Field */}
                     <div className="space-y-2">
                        <label htmlFor="endDate" className="block text-sm font-medium">
                           End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="datetime-local"
                           id="endDate"
                           name="endDate"
                           value={formData.endDate}
                           onChange={handleChange}
                           className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text"
                           required
                        />
                     </div>
                  </div>
               </div>

               {/* Products Section */}
               <div className="space-y-4 bg-gray-850 p-4 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Applicable Products</h2>

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
                     {formData.products.map((productId, index) => (
                        <div key={index} className="flex items-center space-x-2">
                           <input
                              type="text"
                              value={productId}
                              onChange={(e) => handleProductIdChange(index, e.target.value)}
                              placeholder="Enter product ID"
                              className="flex-1 px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                           />
                           {formData.products.length > 1 && (
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
                     Add product IDs that this offer applies to. Leave empty to apply to all products.
                  </p>
               </div>

               {/* Offer Status Checkbox */}
               <div className="flex items-center bg-gray-800 p-3 rounded-md">
                  <input
                     type="checkbox"
                     id="offerStatus"
                     name="offerStatus"
                     checked={formData.offerStatus}
                     onChange={handleChange}
                     className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded"
                  />
                  <label htmlFor="offerStatus" className="ml-2 block text-sm">
                     Activate this offer immediately
                  </label>
               </div>

               {/* Form Actions */}
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
                           Adding Offer...
                        </>
                     ) : 'Add Offer'}
                  </button>
                  <button
                     type="button"
                     onClick={() => navigate('/admin/offer')}
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

export default AdminAddOffer