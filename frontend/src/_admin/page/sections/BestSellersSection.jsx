import { ChevronDown, ChevronUp, Loader2, Tag as Tags } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import FindProducts from '../../../components/dataFinding/FindProducts'
import { updateHomeContent } from '../../../lib/api/admin.api'

const BestSellersSection = ({ initialBestSeller }) => {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(initialBestSeller || null)
  const [hasChanges, setHasChanges] = useState(false)

  // console.log('BestSellersSection initialBestSeller:', initialBestSeller)

  // Reset hasChanges when initialBestSeller changes
  useEffect(() => {
    if (initialBestSeller !== selectedProduct) {
      setHasChanges(true)
    } else {
      setHasChanges(false)
    }
  }, [selectedProduct, initialBestSeller])

  const toggleExpanded = () => {
    setExpanded(prev => !prev)
  }

  const handleProductsSelection = (products) => {
    const newProduct = products.length > 0 ? products[0] : null
    setSelectedProduct(newProduct)
    setErrors(null)

    // Check if selection has changed from initial value
    setHasChanges(newProduct !== initialBestSeller)
  }

  const validateSelection = () => {
    if (!selectedProduct) {
      return 'Please select a best seller product'
    }
    return null
  }

  const updateProducts = async () => {
    if (!hasChanges) return

    const error = validateSelection()
    if (error) {
      setErrors(error)
      toast.error(error)
      return
    }

    setLoading(true)
    setErrors(null)

    try {
      const formattedProducts = {
        alltimeBestSellers: selectedProduct
      }

      const response = await updateHomeContent(formattedProducts)

      if (response && response.success) {
        toast.success('Best seller product updated successfully')
        setErrors(null)
        setHasChanges(false)
      } else {
        const errorMessage = response?.message || 'Failed to update best seller product'
        toast.error(errorMessage)
        setErrors(errorMessage)
      }
    } catch (error) {
      console.error('Error updating best seller product:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update best seller product. Please try again.'
      toast.error(errorMessage)
      setErrors(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-emerald-800/30 transition-all">
        <div className="flex items-center justify-between p-4 bg-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-900/40">
              <Tags className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Best Sellers</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleExpanded}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse Best Sellers section" : "Expand Best Sellers section"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button
              type="button"
              onClick={updateProducts}
              disabled={loading || !hasChanges}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>{hasChanges ? "Update" : "No Changes"}</span>
              )}
            </button>
          </div>
        </div>

        <div className={`transition-all duration-300 ${expanded ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-5 border-t border-gray-800">
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">
                Select your best selling product to feature in the Best Sellers section. This highlights popular items to your customers.
              </p>

              <FindProducts
                onSelectProducts={handleProductsSelection}
                selectedProductIds={selectedProduct ? [selectedProduct] : []}
                maxSelections={1}
                disabled={loading}
              />

              {errors && (
                <p className="text-red-400 text-sm mt-2">{errors}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BestSellersSection