import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, LoaderCircle, Plus, Trash2, AlertCircle } from 'lucide-react'
import { toast } from "react-toastify"
import { addOffer } from '../../lib/api/admin.api'
import FindProducts from '../../components/dataFinding/FindProducts'
import { useAuth } from '../../context/AuthContext'

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


   const { getToken } = useAuth()

   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [fieldErrors, setFieldErrors] = useState({
      offerName: '',
      offerCode: '',
      discountValue: '',
      startDate: '',
      endDate: '',
      products: ''
   })

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target

      // Clear field error when user starts typing
      setFieldErrors({
         ...fieldErrors,
         [name]: ''
      })

      setFormData({
         ...formData,
         [name]: type === 'checkbox' ? checked : value
      })
   }

   // Validate the form before submission
   const validateForm = () => {
      let isValid = true
      const errors = {
         offerName: '',
         offerCode: '',
         discountValue: '',
         startDate: '',
         endDate: '',
         products: ''
      }

      // Offer name validation
      if (!formData.offerName.trim()) {
         errors.offerName = 'Offer name is required'
         isValid = false
      } else if (formData.offerName.trim().length < 3) {
         errors.offerName = 'Offer name must be at least 3 characters'
         isValid = false
      }

      // Offer code validation
      if (!formData.offerCode.trim()) {
         errors.offerCode = 'Offer code is required'
         isValid = false
      } else {
         const codePattern = /^[A-Z0-9_-]+$/
         if (!codePattern.test(formData.offerCode)) {
            errors.offerCode = 'Code should be uppercase letters, numbers, underscores or hyphens'
            isValid = false
         }
      }

      // Discount value validation
      if (!formData.discountValue) {
         errors.discountValue = 'Discount value is required'
         isValid = false
      } else {
         const discountValue = parseFloat(formData.discountValue)
         if (isNaN(discountValue) || discountValue <= 0) {
            errors.discountValue = 'Discount must be a positive number'
            isValid = false
         } else if (discountValue > 100) {
            errors.discountValue = 'Discount cannot exceed 100%'
            isValid = false
         }
      }

      // Date validation
      if (!formData.startDate) {
         errors.startDate = 'Start date is required'
         isValid = false
      }

      if (!formData.endDate) {
         errors.endDate = 'End date is required'
         isValid = false
      }

      if (formData.startDate && formData.endDate) {
         const startDate = new Date(formData.startDate)
         const endDate = new Date(formData.endDate)
         const now = new Date()

         if (startDate < now) {
            errors.startDate = 'Start date cannot be in the past'
            isValid = false
         }

         if (startDate >= endDate) {
            errors.endDate = 'End date must be after start date'
            isValid = false
         }
      }

      setFieldErrors(errors)
      return isValid
   }

   const handleSubmit = async (e) => {
      e.preventDefault()

      // Reset errors
      setError('')

      // Validate form
      if (!validateForm()) {
         toast.error('Please fix the form errors')
         return
      }

      setLoading(true)

      // Filter out empty product IDs
      const validProducts = formData.products.filter(id => id.trim() !== '')

      try {
         // Create submission data
         const dataToSubmit = {
            ...formData,
            products: validProducts,
            discountValue: parseFloat(formData.discountValue)
         }

         const token = await getToken()
         if (!token) {
            setError('You must be logged in to add an offer.')
            toast.error('You must be logged in to add an offer.')
            return
         }
         const response = await addOffer(dataToSubmit, token)

         if (response.success) {
            // Redirect back to offer list
            toast.success('Offer added successfully!')
            navigate('/admin/offer')
         } else {
            // Handle API validation errors
            if (response.fieldErrors) {
               setFieldErrors({
                  ...fieldErrors,
                  ...response.fieldErrors
               })
               toast.error('Please fix the form errors')
            } else {
               setError(response.message || 'Failed to add offer')
               toast.error(response.message || 'Failed to add offer')
            }
         }
      } catch (error) {
         console.error('Error submitting form:', error)
         const errorMessage = error.response?.data?.message || 'Failed to add offer'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   // Helper function to render field error message
   const renderFieldError = (fieldName) => {
      if (!fieldErrors[fieldName]) return null;

      return (
         <div className="text-red-500 text-sm mt-1 flex items-start">
            <AlertCircle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
            <span>{fieldErrors[fieldName]}</span>
         </div>
      );
   }

   //  handleProductSelection
   const handleProductSelection = (selectedProductIds) => {
      setFormData({
         ...formData,
         products: selectedProductIds
      })
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
                           className={`w-full px-4 py-3 bg-surface border ${fieldErrors.offerName ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                           placeholder="Enter offer name"
                           required
                           minLength={3}
                           maxLength={50}
                        />
                        {renderFieldError('offerName')}
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
                           className={`w-full px-4 py-3 bg-surface border ${fieldErrors.offerCode ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                           placeholder="e.g., SUMMER2025"
                           required
                        />
                        {renderFieldError('offerCode')}
                        <p className="text-xs text-gray-400">
                           Offer codes cannot be modified after creation
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
                           className={`w-full px-4 py-3 bg-surface border ${fieldErrors.discountValue ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                           placeholder="Enter discount amount"
                           required
                           min="0.1"
                           max="100"
                           step="0.01"
                        />
                        <span className="ml-2">%</span>
                     </div>
                     {renderFieldError('discountValue')}
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
                           className={`w-full px-4 py-3 bg-surface border ${fieldErrors.startDate ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text`}
                           required
                        />
                        {renderFieldError('startDate')}
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
                           className={`w-full px-4 py-3 bg-surface border ${fieldErrors.endDate ? 'border-red-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text`}
                           required
                        />
                        {renderFieldError('endDate')}
                     </div>
                  </div>
               </div>

               {/* Products Section */}
               <div className="space-y-4 p-4 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-primary-300">Applicable Products</h2>

                  <div className="space-y-2">
                     <label className="block text-sm font-medium">
                        Select Products <span className="text-red-500">*</span>
                     </label>
                     <FindProducts
                        onSelectProducts={handleProductSelection}
                        selectedProductIds={formData.products}
                     />

                     {renderFieldError('products')}
                  </div>
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
                     className="btn-primary flex items-center justify-center min-w-32 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                     {loading ? (
                        <>
                           <LoaderCircle className="animate-spin mr-2" />
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