import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import ProductImageGallery from '../../components/product/ProductImageGallery'
import ProductReviews from '../../components/product/ProductReviews'
import { Heart, ShoppingCart, Truck, X, AlertCircle, Star } from 'lucide-react'
import { useGetProductById } from '../../lib/query/queriesAndMutation'
import { useAuth } from '../../context/AuthContext'
import { useAddToCart, useAddToWishlist, useRemoveFromWishlist } from '../../lib/query/queriesAndMutation'
import { toast } from 'react-toastify'

// Lazy load the SplineModel component
const LazySplineModel = lazy(() => import('../../components/ui/SplineModel'));

const Product = () => {
  // grab type from url
  const { slug } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('description')
  const [selectedSize, setSelectedSize] = useState('')
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const { currentUser, isLoading: userLoading } = useAuth();

  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
  } = useGetProductById(slug)

  console.log(productData, "productData")

  const {
    mutate: addToWishlist,
    isLoading: isAddingToWishlist,
  } = useAddToWishlist({
    onSuccess: () => {
      toast.success("Added to wishlist");
    },
    onError: () => {
      toast.error("Failed to add to wishlist");
    }
  });

  const {
    mutate: removeFromWishlist,
    isLoading: isRemovingFromWishlist,
  } = useRemoveFromWishlist({
    onSuccess: () => {
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    }
  });

  const {
    mutate: addToCart,
    isLoading: isAddingToCart,
    isError: isAddingToCartError,
    isSuccess: isAddingToCartSuccess,
  } = useAddToCart();

  // Extract product from data
  const product = productData?.product || {}

  // Check if product is in wishlist
  const isInWishlist = currentUser?.wishlist?.some(item => item._id === product._id);

  // Check if product is in cart
  const cartItem = currentUser?.cart?.find(item =>
    item.productId === product._id && item.size === selectedSize
  );

  const isInCart = !!cartItem;

  // Get inventory data
  const inventory = product?.inventory?.stocks || [];

  // Create a map of size to stock quantity for easier access
  const stockMap = inventory.reduce((acc, item) => {
    acc[item.size] = item.quantity;
    return acc;
  }, {});

  // Calculate values based on product data and offer
  const hasOffer = product.offer &&
    product.offer.offerStatus === true &&
    product.offer.products?.includes(product._id);

  const isOfferActive = hasOffer &&
    new Date() >= new Date(product.offer.startDate) &&
    new Date() <= new Date(product.offer.endDate);

  const discountPercentage = isOfferActive ? product.offer.discountValue : 0;
  const discountedPrice = isOfferActive
    ? product.price - (product.price * (discountPercentage / 100))
    : product.price;

  const formattedPrice = `₹${Math.round(product.price).toLocaleString('en-IN')}`;
  const formattedDiscountedPrice = `₹${Math.round(discountedPrice).toLocaleString('en-IN')}`;
  const productType = product.categories?.[0]?.main || 't-shirt';

  // Convert size array from strings to objects with size and stock properties
  const sizes = product?.size?.map(size => ({
    size,
    stock: stockMap[size] || 0,
    isAvailable: (stockMap[size] || 0) > 0
  })) || [];

  // Check if the selected size is in stock
  const selectedSizeStock = selectedSize ? (stockMap[selectedSize] || 0) : 0;
  const isSizeInStock = selectedSizeStock > 0;

  // Handle size selection
  const handleSizeSelect = (size) => {
    if (stockMap[size] > 0) {
      setSelectedSize(size);
    } else {
      console.log(`Size ${size} is out of stock`);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.warning("Please select a size first");
      return;
    }

    if (!isSizeInStock) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }

    // Check if item is already in cart with the selected size
    if (isInCart) {
      // Navigate to cart page instead of updating quantity
      navigate('/cart');
    } else {
      console.log(`Adding to cart: ${product.title}, Size: ${selectedSize}, Quantity: 1`);
      // Call addToCart mutation with product details
      addToCart({
        productId: product._id,
        size: selectedSize,
        quantity: 1,
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      console.log(`Removing from wishlist: ${product.title}`);
      // Here you would call the actual removeFromWishlist mutation
      removeFromWishlist(product._id);
    } else {
      console.log(`Adding to wishlist: ${product.title}`);
      // Here you would call the actual addToWishlist mutation
      addToWishlist(product._id);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-30 py-4 mt-20">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Column - Made sticky */}
          <div className="w-full flex flex-col md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-120px)]">
            {/* Breadcrumb navigation */}
            <nav className="mb-6 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
              <ol className="flex items-center">
                <li className="flex items-center">
                  <Link to="/" className="text-gray-400 hover:text-primary-300">
                    Home
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                </li>
                <li className="text-white font-medium truncate max-w-[150px] sm:max-w-xs">
                  {product.title}
                </li>
              </ol>
            </nav>
            <div className="md:overflow-y-hidden md:pb-4">
              <ProductImageGallery images={product.images} />
            </div>

            {/* Mobile view - Tab navigation and pricing card */}
            <div className="md:hidden mt-6">
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  className={`py-2 px-4 text-sm font-medium ${activeTab === 'description' ? 'text-primary-300 border-b-2 border-primary-300' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium ${activeTab === 'reviews' ? 'text-primary-300 border-b-2 border-primary-300' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="flex flex-col space-y-6">
            {/* website logo */}
            <div className='flex items-center justify-start space-y-2 mb-4'>
              <img
                src="/logo.png"
                className='h-10 w-10'
                alt="logo" />
              <p className='flex items-center text-gray-400'>
                <span className='text-white font-semibold text-lg'>Buddha's Clothings</span>
              </p>
            </div>
            {/* Tags section */}
            <div className="flex flex-wrap gap-2 mb-2">
              {product.tags && product.tags.length > 0 ? (
                product.tags.map((tag, index) => (
                  <span key={index} className="bg-surface text-xs py-1 px-3 rounded-full text-gray-300">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="bg-surface text-xs py-1 px-3 rounded-full text-gray-300">
                  {productType}
                </span>
              )}
            </div>

            {/* Product Title and Rating Section */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
              <p className="text-gray-400">{product.subTitle}</p>

              {/* Add Star Rating Display - only shown if there are reviews */}
              {product.reviewCount > 0 && (
                <div className="flex items-center mt-3">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${star <= (product.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-500"
                          } mr-0.5`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300">
                    {product.averageRating ? product.averageRating.toFixed(1) : "0"}
                  </span>
                </div>
              )}
            </div>

            {/* Price display */}
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-primary-300">
                {isOfferActive ? formattedDiscountedPrice : formattedPrice}
              </span>

              {isOfferActive && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formattedPrice}
                  </span>
                  <span className="px-2 py-1 bg-primary-500 text-white text-sm rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status Indicator */}
            {selectedSize ? (
              <div className="flex items-center">
                {isSizeInStock ? (
                  <span className="text-green-500 flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    In Stock ({selectedSizeStock} available)
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    Out of Stock
                  </span>
                )}
              </div>
            ) : null}

            {/* Size Selection */}
            <div className="pt-2">
              <h3 className="text-base font-medium text-white mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border 
                      ${selectedSize === sizeOption.size
                        ? 'border-primary-300 bg-primary-500 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-primary-300'} 
                      ${!sizeOption.isAvailable ? 'opacity-50 cursor-not-allowed relative overflow-hidden' : 'cursor-pointer'}`}
                    onClick={() => handleSizeSelect(sizeOption.size)}
                    disabled={!sizeOption.isAvailable}
                  >
                    {sizeOption.size}
                    {!sizeOption.isAvailable && (
                      <div className="absolute inset-0 border-t border-red-500 transform rotate-45"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 
                  ${selectedSize && isSizeInStock
                    ? 'bg-primary-500 hover:bg-primary-600 cursor-pointer'
                    : 'bg-gray-700 cursor-not-allowed'
                  } text-white py-3 px-6 rounded flex-1 transition duration-300`}
                disabled={!selectedSize || !isSizeInStock}
              >
                <ShoppingCart size={18} />
                {isInCart ? 'Go to Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlistToggle}
                className="flex items-center justify-center gap-2 border border-gray-600 py-3 px-6 rounded hover:border-primary-300 transition duration-300"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={18}
                  className={isInWishlist ? "fill-primary-300 text-primary-300" : "text-gray-300"}
                />
                <span className="whitespace-nowrap">{isInWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Delivery Info */}
            <div className="border border-gray-700 rounded p-4">
              <div className="flex items-start gap-3">
                <Truck className="text-primary-300 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-white font-medium text-sm">Delivery Information</h4>
                  <p className="text-gray-400 text-sm mt-1">Free shipping on orders over $99</p>
                  <p className="text-gray-400 text-sm">Estimated delivery: 3-5 business days</p>
                </div>
              </div>
            </div>

            {/* Product details tabs - desktop view */}
            <div className="hidden md:block mt-8">
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  className={`py-2 px-4 text-sm font-medium ${activeTab === 'description' ? 'text-primary-300 border-b-2 border-primary-300' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium ${activeTab === 'reviews' ? 'text-primary-300 border-b-2 border-primary-300' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </div>

              {/* Product Description Section */}
              {activeTab === 'description' && (
                <div className="text-gray-300 space-y-4">
                  <h3 className="text-lg font-semibold text-white">About This Product</h3>
                  <p>{product.description}</p>

                  <h4 className="text-base font-medium text-white mt-4">Materials & Features</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.technologyStack?.map((tech, index) => (
                      <span key={index} className="bg-surface px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-surface px-3 py-2 rounded-md">
                      <span className="text-xs text-gray-400">Type</span>
                      <p className="font-medium text-sm">{productType}</p>
                    </div>
                    <div className="bg-surface px-3 py-2 rounded-md">
                      <span className="text-xs text-gray-400">Sales</span>
                      <p className="font-medium text-sm">{product.totalSold} sold</p>
                    </div>
                    <div className="bg-surface px-3 py-2 rounded-md">
                      <span className="text-xs text-gray-400">Rating</span>
                      <p className="font-medium text-sm">{product.totalRating}/5</p>
                    </div>
                  </div>

                  {product.productModelLink && (
                    <div className="mt-6">
                      <button
                        onClick={() => setIsModelPopupOpen(true)}
                        className="bg-secondary-500 text-white px-4 py-2 rounded inline-flex items-center hover:bg-secondary-600 transition-all"
                      >
                        View 3D Model
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Section */}
              {activeTab === 'reviews' && (
                <ProductReviews
                  slug={slug}
                />
              )}
            </div>
          </div>

          {/* Mobile view description and reviews */}
          <div className="md:hidden mt-8">
            {activeTab === 'description' && (
              <div className="text-gray-300 space-y-4">
                <h3 className="text-lg font-semibold text-white">About This Product</h3>
                <p>{product.description}</p>

                <h4 className="text-base font-medium text-white mt-4">Materials & Features</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.technologyStack?.map((tech, index) => (
                    <span key={index} className="bg-surface px-3 py-1 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="bg-surface px-3 py-2 rounded-md">
                    <span className="text-xs text-gray-400">Type</span>
                    <p className="font-medium text-sm">{productType}</p>
                  </div>
                  <div className="bg-surface px-3 py-2 rounded-md">
                    <span className="text-xs text-gray-400">Sales</span>
                    <p className="font-medium text-sm">{product.totalSold} sold</p>
                  </div>
                  <div className="bg-surface px-3 py-2 rounded-md">
                    <span className="text-xs text-gray-400">Rating</span>
                    <p className="font-medium text-sm">{product.totalRating}/5</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews
                slug={slug}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3D Model Popup */}
      {isModelPopupOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="bg-surface p-8 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300"></div>
              <p className="text-white mt-4 text-lg">Loading 3D Viewer...</p>
            </div>
          </div>
        }>
          <LazySplineModel
            url={product.productModelLink}
            setIsModelPopupOpen={setIsModelPopupOpen}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Product