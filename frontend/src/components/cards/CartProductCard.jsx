import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRemoveFromCart, useUpdateCart } from '../../lib/query/queriesAndMutation'
import { toast } from 'react-toastify'
import { formatIndianCurrency } from '../../utils/amountFormater'

const CartProductCard = ({ item, setProductAbliability }) => {
  if (!item || typeof item !== 'object') {
    return <div className="text-error p-4">Invalid product data</div>
  }

  // console.log('CartProductCard item:', item)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedSize, setSelectedSize] = useState(
    item.selectedSize || (Array.isArray(item.size) && item.size.length > 0 ? item.size[0] : '')
  )
  const [isInStock, setIsInStock] = useState(true)
  const [availableQuantity, setAvailableQuantity] = useState(0)

  // Add debounce timer refs for rate limiting
  const incrementTimerRef = useRef(null)
  const decrementTimerRef = useRef(null)
  const isProcessingRef = useRef(false)
  const buttonCooldown = 300 // ms between allowed clicks

  const productId = item._id || ''
  const title = item.title || 'Product'
  const subTitle = item.subTitle || ''
  const price = Number(item.price) || 0
  const originalPrice = Number(item.originalPrice) || price
  const quantity = Number(item.quantity) || 1
  const subTotal = Number(item.subTotal) || price * quantity
  const sizes = Array.isArray(item.size) ? item.size : []

  const hasValidOffer = Boolean(item.hasDiscount && item.offer?.active)
  const discountValue = hasValidOffer ? Number(item.offer?.discountValue) || 0 : 0

  const images = Array.isArray(item.images) ? item.images : []
  const primaryImage = images.length > 0 ? images[0].imageUrl : '/placeholder-image.jpg'

  // Get inventory data
  const inventory = item.inventory || { totalQuantity: 0, stocks: [] }

  // Check stock availability based on selected size and update parent component
  useEffect(() => {
    if (!selectedSize || !inventory || !inventory.stocks) {
      setIsInStock(false);
      setAvailableQuantity(0);
      setProductAbliability?.(false);
      return;
    }

    const stockItem = inventory.stocks.find(stock => stock.size === selectedSize);

    if (!stockItem || stockItem.quantity < quantity) {
      setIsInStock(false);
      setAvailableQuantity(stockItem?.quantity || 0);
      setProductAbliability?.(false);
    } else {
      setIsInStock(true);
      setAvailableQuantity(stockItem.quantity);
    }
  }, [selectedSize, quantity, inventory, setProductAbliability]);

  const removeFromCart = useRemoveFromCart()
  const {
    mutate: onRemoveItem = () => { },
    isLoading: isRemovingItem = false,
    error: removeError = null
  } = removeFromCart || {}

  const updateCart = useUpdateCart()
  const {
    mutate: updateQuantity = () => { },
    isLoading: isUpdatingQuantity = false
  } = updateCart || {}

  const handleRemoveClick = useCallback(() => {
    setShowConfirmation(true)
  }, [])

  const confirmRemove = useCallback(() => {
    if (!productId) {
      toast.error('Invalid product ID')
      return
    }
    if (typeof onRemoveItem === 'function') {
      onRemoveItem(productId, {
        onSuccess: () => {
          console.log('Item removed from cart successfully')
          setShowConfirmation(false)
          if (!isInStock && typeof setProductAbliability === 'function') {
            setProductAbliability(true)
          }
        },
        onError: (error) => {
          toast.error(error?.message || 'Failed to remove item from cart')
          setShowConfirmation(false)
        }
      })
    }
  }, [productId, onRemoveItem, isInStock, setProductAbliability])

  const cancelRemove = useCallback(() => {
    setShowConfirmation(false)
  }, [])

  const onUpdateQuantity = useCallback((id, newQuantity) => {
    if (!id) {
      toast.error('Invalid product ID')
      return
    }

    if (isProcessingRef.current) return // Prevent multiple concurrent updates

    const validQuantity = Math.max(1, Math.min(99, Number(newQuantity) || 1))

    if (validQuantity === quantity) return

    // Check if requested quantity is available in stock
    const stockItem = inventory.stocks.find(stock => stock.size === selectedSize);
    if (!stockItem || stockItem.quantity < validQuantity) {
      toast.error(`Only ${stockItem?.quantity || 0} items available in ${selectedSize} size.`);
      return;
    }

    isProcessingRef.current = true

    if (typeof updateQuantity === 'function') {
      updateQuantity({
        productId: id,
        quantity: validQuantity,
        size: selectedSize
      }, {
        onSuccess: () => {
          console.log('Quantity updated successfully')
          setTimeout(() => {
            isProcessingRef.current = false
          }, buttonCooldown)
        },
        onError: (error) => {
          toast.error(error?.message || 'Failed to update quantity')
          isProcessingRef.current = false
        }
      })
    }
  }, [quantity, updateQuantity, selectedSize, inventory.stocks])

  // Rate-limited increment handler
  const handleIncrement = useCallback(() => {
    if (incrementTimerRef.current || isProcessingRef.current) return

    // Check stock before increment
    const stockItem = inventory.stocks.find(stock => stock.size === selectedSize);
    if (!stockItem || stockItem.quantity <= quantity) {
      toast.warning(`Maximum available quantity for size ${selectedSize} is ${stockItem?.quantity || 0}`);
      return;
    }

    // Apply the update
    onUpdateQuantity(productId, quantity + 1)

    // Set rate limiting
    incrementTimerRef.current = setTimeout(() => {
      incrementTimerRef.current = null
    }, buttonCooldown)
  }, [productId, quantity, onUpdateQuantity, selectedSize, inventory.stocks])

  // Rate-limited decrement handler
  const handleDecrement = useCallback(() => {
    if (decrementTimerRef.current || isProcessingRef.current || quantity <= 1) return

    // Apply the update
    onUpdateQuantity(productId, quantity - 1)

    // Set rate limiting
    decrementTimerRef.current = setTimeout(() => {
      decrementTimerRef.current = null
    }, buttonCooldown)
  }, [productId, quantity, onUpdateQuantity])

  // Clear timers on unmount
  React.useEffect(() => {
    return () => {
      if (incrementTimerRef.current) clearTimeout(incrementTimerRef.current)
      if (decrementTimerRef.current) clearTimeout(decrementTimerRef.current)
    }
  }, [])

  const handleSizeChange = useCallback((e) => {
    const newSize = e.target.value
    setSelectedSize(newSize)

    if (typeof updateQuantity === 'function' && productId) {
      // Check if current quantity is available for new size
      const stockItem = inventory.stocks.find(stock => stock.size === newSize);
      const availableQty = stockItem?.quantity || 0;
      const newQuantity = Math.min(quantity, availableQty);

      if (newQuantity < quantity) {
        toast.info(`Quantity adjusted to ${newQuantity} based on available stock for size ${newSize}`);
      }

      updateQuantity({
        productId: productId,
        quantity: newQuantity,
        size: newSize
      }, {
        onSuccess: () => console.log('Size updated successfully'),
        onError: (error) => toast.error(error?.message || 'Failed to update size')
      })
    }
  }, [productId, quantity, updateQuantity, inventory.stocks])

  const isDisabled = isRemovingItem || isUpdatingQuantity || isProcessingRef.current

  return (
    <div className="glass-morphism flex flex-col md:flex-row rounded-lg p-4 mb-6 red-velvet-border">
      <div className="md:w-1/4 mb-4 md:mb-0">
        <div className="overflow-hidden rounded-lg">
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-48 object-cover rounded-lg transition-all duration-500"
          />
        </div>
      </div>

      <div className="md:w-3/4 md:pl-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <p className="text-text-muted">{subTitle}</p>

          <div className="flex items-center mt-3">
            {hasValidOffer ? (
              <>
                <span className="text-xl font-medium text-text">{formatIndianCurrency(price)}</span>
                <span className="text-text-muted line-through ml-2">{formatIndianCurrency(originalPrice)}</span>
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                  {discountValue}% OFF
                </span>
              </>
            ) : (
              <span className="text-xl font-medium text-text">{formatIndianCurrency(price)}</span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="flex items-center mt-3">
              <span className="mr-3 text-text-muted">Size:</span>
              <select
                className="glass-morphism rounded-md px-3 py-2 text-text bg-transparent border border-gray-700"
                value={selectedSize}
                onChange={handleSizeChange}
                disabled={isDisabled}
              >
                {sizes.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock availability status */}
          <div className="mt-2">
            {isInStock ? (
              <span className="text-green-500 text-sm">In Stock ({availableQuantity} available)</span>
            ) : (
              <span className="text-error text-sm font-medium">
                {availableQuantity > 0
                  ? `Only ${availableQuantity} available (You selected ${quantity})`
                  : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-5 gap-4">
          <div className="flex items-center">
            <span className="mr-3 text-text-muted">Quantity:</span>
            <div className="glass-morphism rounded-md flex items-center border border-gray-700">
              <button
                className="px-4 py-2 border-r border-gray-700 hover:bg-primary-900 transition-colors rounded-l-md cursor-pointer"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isDisabled}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 py-2 text-text">{quantity}</span>
              <button
                className="px-4 py-2 border-l border-gray-700 hover:bg-primary-900 transition-colors rounded-r-md cursor-pointer"
                onClick={handleIncrement}
                disabled={isDisabled || quantity >= availableQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="font-semibold text-lg text-text">{formatIndianCurrency(subTotal)}</span>

            {showConfirmation ? (
              <div className="flex items-center space-x-2">
                <button
                  className={`btn-secondary text-sm ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={confirmRemove}
                  disabled={isDisabled}
                >
                  {isRemovingItem ? 'Removing...' : 'Confirm'}
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
                  onClick={cancelRemove}
                  disabled={isDisabled}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="text-error hover:text-primary-400 transition-colors px-3 py-1.5 cursor-pointer"
                onClick={handleRemoveClick}
                disabled={isDisabled}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {removeError && (
          <div className="mt-3 text-error text-sm bg-error/10 px-3 py-2 rounded">
            Error: {removeError.message || 'Failed to remove item'}
          </div>
        )}
      </div>
    </div>
  )
}

export default CartProductCard