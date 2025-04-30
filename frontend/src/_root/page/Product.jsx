import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
// Import components
import ProductImageGallery from '../../components/product/ProductImageGallery'
import ProductReviews from '../../components/product/ProductReviews'
import { Heart, ShoppingCart, Minus, Plus, Truck, X } from 'lucide-react'
import { useGetProductById } from '../../lib/query/queriesAndMutation'

// Lazy load the SplineModel component
const LazySplineModel = lazy(() => import('../../components/ui/SplineModel'));

const Product = () => {
  // grab type from url
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('description')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);

  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
  } = useGetProductById(slug)

  // Extract product from data
  const product = productData?.product || {}

  // console.log('Product Data:', product)

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  // Calculate values based on product data and offer
  const hasOffer = product.offer &&
    product.offer.offerStatus === true &&
    product.offer.products.includes(product._id);

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
  const sizes = product?.size?.map(size => ({ size, stock: 1 })) || [];

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

            {/* Product Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
              <p className="text-gray-400">{product.subTitle}</p>
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
                      ${sizeOption.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => sizeOption.stock > 0 && setSelectedSize(sizeOption.size)}
                    disabled={sizeOption.stock === 0}
                  >
                    {sizeOption.size.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <h3 className="text-base font-medium text-white mb-3">Quantity</h3>
              <div className="flex items-center border border-gray-600 rounded w-32">
                <button
                  onClick={decreaseQuantity}
                  className="px-3 py-2 text-gray-300 hover:text-primary-300"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="flex-1 text-center py-2 text-white text-base font-medium">
                  {quantity}
                </span>

                <button
                  onClick={increaseQuantity}
                  className="px-3 py-2 text-gray-300 hover:text-primary-300"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className={`flex items-center justify-center gap-2 ${selectedSize
                  ? 'bg-primary-500 hover:bg-primary-600 cursor-pointer'
                  : 'bg-gray-700 cursor-not-allowed'
                  } text-white py-3 px-6 rounded flex-1 transition duration-300`}
                disabled={!selectedSize}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center justify-center gap-2 border border-gray-600 py-3 px-6 rounded hover:border-primary-300 transition duration-300"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  size={18}
                  className={isFavorite ? "fill-primary-300 text-primary-300" : "text-gray-300"}
                />
                <span className="whitespace-nowrap">{isFavorite ? 'Saved' : 'Save'}</span>
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