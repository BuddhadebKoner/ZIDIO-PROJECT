import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, LoaderCircle, Plus, Trash2, AlertCircle } from 'lucide-react'
import { toast } from "react-toastify"
import FindProducts from '../../components/dataFinding/FindProducts'
import { getOfferDetailsByCode } from '../../lib/api/offer.api'
import { updateOffer } from '../../lib/api/admin.api'

const AdminUpdateOffer = () => {
  const navigate = useNavigate()
  const { slug } = useParams();

  const [formData, setFormData] = useState({
    offerName: '',
    offerStatus: false,
    offerCode: '',
    discountValue: '',
    startDate: '',
    endDate: '',
    products: ['']
  })

  // Store original data to track changes
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    offerName: '',
    offerCode: '',
    discountValue: '',
    startDate: '',
    endDate: '',
    products: ''
  })

  // Fetch offer data on component mount
  useEffect(() => {
    const fetchOfferData = async () => {
      setLoading(true);
      try {
        const response = await getOfferDetailsByCode(slug);

        if (response.success && response.offer) {
          // Format dates for datetime-local inputs
          const offer = response.offer;
          const formattedData = {
            ...offer,
            startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : '',
            endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : '',
          };

          setFormData(formattedData);
          setOriginalData(formattedData);
        } else {
          toast.error('Failed to fetch offer details');
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        toast.error(error.message || 'Error loading offer data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchOfferData();
    }
  }, [slug]);

  // Track changes between original and current form data
  const getChangedFields = () => {
    if (!originalData) return {};

    const changes = {};

    Object.keys(formData).forEach(key => {
      // Skip offerCode as it shouldn't be changed
      if (key === 'offerCode') return;

      // For arrays (like products), compare differently
      if (Array.isArray(formData[key])) {
        if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
          changes[key] = formData[key];
        }
      }
      // For simple values
      else if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });

    return changes;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Clear field error when user starts typing
    setFieldErrors({
      ...fieldErrors,
      [name]: ''
    })

    // Skip if trying to change offerCode
    if (name === 'offerCode') return;

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

      if (startDate >= endDate) {
        errors.endDate = 'End date must be after start date'
        isValid = false
      }
    }

    // Products validation
    if (!formData.products || formData.products.length === 0 ||
      (formData.products.length === 1 && !formData.products[0])) {
      errors.products = 'At least one product must be selected'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    const changedFields = getChangedFields()

    if (Object.keys(changedFields).length === 0) {
      toast.info('No changes detected')
      return
    }

    setLoading(true)
    try {
      const response = await updateOffer(slug, changedFields)
      
      if (response.success) {
        // If there's a special message about replaced offers, show it
        if (response.message.includes('previous offers replaced')) {
          toast.success(response.message)
        } else {
          toast.success('Offer updated successfully')
        }
        
        // Update original data to reflect the new state
        setOriginalData({
          ...originalData,
          ...changedFields
        })
      } else {
        // Handle validation errors from server
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors)
          toast.error('Please fix the validation errors')
        } else {
          toast.error(response.message || 'Failed to update offer')
        }
      }
    } catch (error) {
      console.error('Error updating offer:', error)
      
      // Handle structured error responses
      if (error.response?.data) {
        const { fieldErrors, message } = error.response.data
        
        if (fieldErrors) {
          setFieldErrors(fieldErrors)
          toast.error('Please fix the validation errors')
        } else {
          toast.error(message || 'Failed to update offer')
        }
      } else {
        toast.error(error.message || 'Network error occurred. Please try again.')
      }
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

    // Clear any product selection errors
    if (selectedProductIds && selectedProductIds.length > 0) {
      setFieldErrors({
        ...fieldErrors,
        products: ''
      })
    }
  }

  if (loading && !originalData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin w-8 h-8 text-primary-500" />
        <span className="ml-2">Loading offer data...</span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/offer" className="text-gray-400 hover:text-primary-500">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl font-bold">Update Offer</h1>
        </div>

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

              {/* Offer Code Field (Read-only) */}
              <div className="space-y-2">
                <label htmlFor="offerCode" className="block text-sm font-medium">
                  Offer Code <span className="text-gray-400">(cannot be changed)</span>
                </label>
                <input
                  type="text"
                  id="offerCode"
                  name="offerCode"
                  value={formData.offerCode}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-gray-300 cursor-not-allowed"
                  readOnly
                  disabled
                />
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
              Activate this offer
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
                  Updating Offer...
                </>
              ) : 'Update Offer'}
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

export default AdminUpdateOffer