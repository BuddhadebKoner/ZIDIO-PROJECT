import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const ProductPriceDetails = ({
  product,
  originalPrice,
  discountedPrice,
  formattedOriginalPrice,
  formattedDiscountedPrice,
  isOfferActive,
  statusColorClass,
  isInCart,
  currentUser,
  isAuthLoading,
  refreshCurrentUser,
  isMobile
}) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(
    product.size && product.size.length > 0 ? product.size[0].size : ''
  )
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : ''
  )
  const [addingToCart, setAddingToCart] = useState(false)

  // Handle add to cart functionality
  const handleAddToCart = async () => {
    if (!currentUser?.id) {
      // Redirect to sign in page with message
      toast.warning('Please sign in to add items to cart')
      navigate('/sign-in')
      return
    }

    if (isInCart) {
      // Navigate to cart page
      window.location.href = '/cart'
      return
    }

    setAddingToCart(true)

    try {
      // In a real app, you would make an API call here
      console.log(`Adding product to cart: ${product.slug}`)
      console.log(`Selected size: ${selectedSize}, Selected color: ${selectedColor}`)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Refresh user data to update cart state
      refreshCurrentUser()

      // Show success message
      toast.success('Product added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add product to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className={`bg-glass rounded-lg p-4 sm:p-6 ${isMobile ? 'w-full' : 'w-full sticky top-4'}`}>
      {/* Price display */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-lg sm:text-xl font-bold ${isOfferActive ? 'text-highlight-primary' : 'text-primary'}`}>
            {formattedDiscountedPrice}
          </span>
          {isOfferActive && (
            <span className="text-sm sm:text-base line-through text-secondary">
              {formattedOriginalPrice}
            </span>
          )}
        </div>

        {isOfferActive && (
          <div className="mt-1 flex items-center">
            <span className={`text-xs sm:text-sm ${statusColorClass}`}>
              {product.discount}% OFF • Sale ends in {getRemainingDays(product.offerEndDate)} days
            </span>
          </div>
        )}
      </div>

      {/* Size selection */}
      {product.size && product.size.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary mb-1">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.size.map((sizeOption, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedSize(sizeOption.size)}
                disabled={sizeOption.stock <= 0}
                className={`px-3 py-1 text-sm border rounded-md ${selectedSize === sizeOption.size
                    ? 'border-highlight-primary bg-highlight-primary bg-opacity-10 text-highlight-primary'
                    : sizeOption.stock > 0
                      ? 'border-theme text-primary hover:border-highlight-primary'
                      : 'border-theme text-secondary bg-background-secondary cursor-not-allowed'
                  }`}
              >
                {sizeOption.size}
                {sizeOption.stock <= 0 && <span className="ml-1">(Out of stock)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color selection */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary mb-1">Color</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-highlight-primary ring-offset-2' : ''
                  }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={addingToCart || isAuthLoading}
        className={`w-full py-2 px-4 rounded-md font-medium mt-2 transition-all ${isInCart
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-highlight-primary text-white hover:bg-opacity-90'
          } ${addingToCart || isAuthLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {addingToCart || isAuthLoading ? (
          'Processing...'
        ) : isInCart ? (
          'View in Cart'
        ) : (
          'Add to Cart'
        )}
      </button>

      {/* Shipping info */}
      <div className="mt-4 pt-4 border-t border-theme">
        <div className="flex items-start gap-2 text-sm text-secondary">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Free shipping on orders over $50</span>
        </div>
        <div className="flex items-start gap-2 mt-2 text-sm text-secondary">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          <span>Easy 30-day returns</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to calculate remaining days for offer
const getRemainingDays = (endDateString) => {
  const endDate = new Date(endDateString)
  const today = new Date()
  const diffTime = endDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export default ProductPriceDetails