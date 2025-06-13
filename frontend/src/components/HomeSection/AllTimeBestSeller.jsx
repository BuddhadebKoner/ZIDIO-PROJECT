import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Truck, AlertCircle, Tag } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useAddToCart, useAddToWishlist, useRemoveFromWishlist } from '../../lib/query/queriesAndMutation';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const AllTimeBestSeller = ({ products: product }) => {
   const [thumbsSwiper, setThumbsSwiper] = useState(null);
   const [selectedSize, setSelectedSize] = useState('');
   const navigate = useNavigate();
   const { currentUser } = useAuth();

   const productImages = product?.images?.map(img => ({
      src: img.imageUrl,
      id: img._id
   })) || [];

   const isInWishlist = currentUser?.wishlist?.some(item => item._id === product?._id);
   const cartItem = currentUser?.cart?.find(item =>
      item.productId === product?._id && item.size === selectedSize
   );
   const isInCart = !!cartItem;
   const inventory = product?.inventory?.stocks || [];
   const stockMap = inventory.reduce((acc, item) => {
      acc[item.size] = item.quantity;
      return acc;
   }, {});

   // Simplified offer check
   const hasOffer = !!product?.offer?.discountValue;
   const discountPercentage = hasOffer ? product.offer.discountValue : 0;
   const originalPrice = product?.price || 0;
   const currentPrice = hasOffer
      ? originalPrice - (originalPrice * (discountPercentage / 100))
      : originalPrice;
   const saveAmount = originalPrice - currentPrice;

   const priceInfo = {
      current: Math.round(currentPrice),
      original: originalPrice,
      discount: discountPercentage,
      saveAmount: Math.round(saveAmount)
   };

   const isOnSale = priceInfo.discount > 0;
   const sizes = product?.size?.map(size => ({
      size,
      stock: stockMap[size] || 0,
      isAvailable: (stockMap[size] || 0) > 0,
      isLowStock: (stockMap[size] || 0) <= 5 && (stockMap[size] || 0) > 0
   })) || [];

   const selectedSizeStock = selectedSize ? (stockMap[selectedSize] || 0) : 0;
   const isSizeInStock = selectedSizeStock > 0;
   const isLowStock = selectedSizeStock <= 5 && selectedSizeStock > 0;

   const {
      mutate: addToWishlist,
      isLoading: isAddingToWishlist,
   } = useAddToWishlist({
      onSuccess: () => {
         toast.success("Added to wishlist");
      },
      onError: (error) => {
         toast.error(error?.response?.data?.message || "Failed to add to wishlist");
      }
   });

   const {
      mutate: removeFromWishlist,
      isLoading: isRemovingFromWishlist,
   } = useRemoveFromWishlist({
      onSuccess: () => {
         toast.success("Removed from wishlist");
      },
      onError: (error) => {
         toast.error(error?.response?.data?.message || "Failed to remove from wishlist");
      }
   });

   const {
      mutate: addToCart,
      isLoading: isAddingToCart,
   } = useAddToCart({
      onSuccess: () => {
         toast.success("Added to cart");
      },
      onError: (error) => {
         toast.error(error?.response?.data?.message || "Failed to add to cart");
      }
   });

   useEffect(() => {
      if (!selectedSize && sizes.length > 0) {
         const firstAvailableSize = sizes.find(s => s.isAvailable);
         if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize.size);
         }
      }
   }, [product, sizes]);

   const handleSizeSelect = (size) => {
      if (stockMap[size] > 0) {
         setSelectedSize(size);
      } else {
         toast.warning(`Size ${size} is out of stock`);
      }
   };

   const handleAddToCart = () => {
      if (!currentUser) {
         toast.warning("Please sign in to add items to cart");
         navigate('/sign-in');
         return;
      }

      if (!selectedSize) {
         toast.warning("Please select a size first");
         return;
      }

      if (!isSizeInStock) {
         toast.error(`Size ${selectedSize} is out of stock`);
         return;
      }

      if (isInCart) {
         navigate('/cart');
      } else {
         addToCart({
            productId: product._id,
            size: selectedSize,
            quantity: 1,
         });
      }
   };

   const handleWishlistToggle = () => {
      if (!currentUser) {
         toast.warning("Please login to save items");
         navigate('/sign-in');
         return;
      }

      if (isInWishlist) {
         removeFromWishlist(product._id);
      } else {
         addToWishlist(product._id);
      }
   };

   const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

   if (!product) {
      return <div className="container mx-auto px-4 py-12 text-center text-white">Product not found</div>;
   }

   return (
      <section className='w-full py-12'>
         <div className='container mx-auto px-4 md:px-8'>
            <h1 className='text-3xl font-bold text-center text-primary-300 mb-20'>
               Community's All-Time Bestseller
            </h1>

            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="w-full">
                     <div className="overflow-hidden rounded-lg mb-4 relative">
                        {isOnSale && (
                           <div className="absolute top-4 left-4 z-10 bg-primary-500 text-white px-3 py-2 rounded-full font-bold flex items-center gap-1 animate-pulse-slow shadow-lg">
                              <Tag size={14} />
                              <span>{priceInfo.discount}% OFF</span>
                           </div>
                        )}
                        <Swiper
                           style={{
                              '--swiper-navigation-color': '#fff',
                              '--swiper-pagination-color': '#fff',
                           }}
                           spaceBetween={10}
                           navigation={true}
                           thumbs={{ swiper: thumbsSwiper }}
                           modules={[FreeMode, Navigation, Thumbs]}
                           className="h-full w-full"
                        >
                           {productImages.length > 0 ? (
                              productImages.map((img, index) => (
                                 <SwiperSlide key={img.id || index} className="h-full w-full flex items-center justify-center">
                                    <img
                                       src={img.src}
                                       alt={`${product.title} view ${index + 1}`}
                                       className="max-h-full max-w-full object-contain rounded-lg"
                                    />
                                 </SwiperSlide>
                              ))
                           ) : (
                              <SwiperSlide className="h-full w-full flex items-center justify-center">
                                 <div className="text-gray-400">No images available</div>
                              </SwiperSlide>
                           )}
                        </Swiper>
                     </div>

                     {productImages.length > 1 && (
                        <div className="w-full h-24 mt-4">
                           <Swiper
                              onSwiper={setThumbsSwiper}
                              spaceBetween={8}
                              slidesPerView={4}
                              freeMode={true}
                              watchSlidesProgress={true}
                              modules={[FreeMode, Navigation, Thumbs]}
                              className="h-full"
                           >
                              {productImages.map((img, index) => (
                                 <SwiperSlide key={img.id || index} className="h-full rounded-md overflow-hidden">
                                    <img
                                       src={img.src}
                                       alt={`${product.title} thumbnail ${index + 1}`}
                                       className="h-full w-full object-cover cursor-pointer"
                                    />
                                 </SwiperSlide>
                              ))}
                           </Swiper>
                        </div>
                     )}
                  </div>

                  <div className="flex flex-col space-y-6">
                     <div className='flex items-center gap-2 mb-2'>
                        <img
                           src="./logo.png"
                           className='h-10 w-10'
                           alt="logo" />
                        <p className='flex items-center'>
                           <span className='text-white font-semibold text-lg'>Buddha's Clothings</span>
                        </p>
                     </div>

                     <div className='flex flex-col'>
                        <h2 className="text-2xl font-semibold text-white">{product.title}</h2>
                        <p className="text-gray-400 mt-2">{product.subTitle}</p>
                     </div>

                     <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-4">
                           <span className="text-3xl font-bold text-primary-300">
                              ₹{priceInfo.current.toLocaleString()}
                           </span>

                           {isOnSale && (
                              <span className="text-xl text-gray-400 line-through">
                                 ₹{priceInfo.original.toLocaleString()}
                              </span>
                           )}
                        </div>

                        {isOnSale && (
                           <div className="flex flex-col">
                              <div className="px-3 py-1 bg-green-900/30 text-green-500 rounded-md inline-flex items-center w-fit">
                                 <span className="text-sm font-medium">
                                    You save: ₹{priceInfo.saveAmount.toLocaleString()} ({priceInfo.discount}%)
                                 </span>
                              </div>
                           </div>
                        )}
                     </div>

                     {selectedSize && (
                        <div className="flex items-center">
                           {isSizeInStock ? (
                              <span className={`flex items-center text-sm ${isLowStock ? 'text-amber-400' : 'text-green-500'}`}>
                                 <div className={`w-2 h-2 ${isLowStock ? 'bg-amber-400' : 'bg-green-500'} rounded-full mr-2`}></div>
                                 {isLowStock ?
                                    `Low Stock - Only ${selectedSizeStock} left` :
                                    `In Stock (${selectedSizeStock} available)`}
                              </span>
                           ) : (
                              <span className="text-red-500 flex items-center text-sm">
                                 <AlertCircle size={14} className="mr-1" />
                                 Out of Stock
                              </span>
                           )}
                        </div>
                     )}

                     <div className="pt-2">
                        <h3 className="text-base font-medium text-white mb-3">Select Size</h3>
                        {sizes.length > 0 ? (
                           <div className="flex flex-wrap gap-3">
                              {sizes.map((sizeOption) => (
                                 <button
                                    key={sizeOption.size}
                                    className={`w-12 h-12 flex items-center justify-center rounded-md border
                                    ${selectedSize === sizeOption.size
                                          ? 'border-primary-500 bg-primary-500 text-white shadow-glow-primary'
                                          : 'border-gray-600 text-gray-300 hover:border-primary-500'
                                       } 
                                    ${!sizeOption.isAvailable ? 'opacity-50 cursor-not-allowed relative overflow-hidden' : 'cursor-pointer'}
                                    ${sizeOption.isLowStock && 'border-amber-500 border-opacity-50'}
                                    transition-all duration-200`}
                                    onClick={() => handleSizeSelect(sizeOption.size)}
                                    disabled={!sizeOption.isAvailable}
                                 >
                                    <span>{sizeOption.size}</span>
                                    {!sizeOption.isAvailable && (
                                       <div className="absolute inset-0 border-t border-red-500 transform rotate-45"></div>
                                    )}
                                    {sizeOption.isLowStock && sizeOption.isAvailable && (
                                       <span className="absolute -bottom-1 left-0 right-0 text-[9px] text-amber-400 font-medium">
                                          Low stock
                                       </span>
                                    )}
                                 </button>
                              ))}
                           </div>
                        ) : (
                           <p className="text-gray-400">No sizes available for this product</p>
                        )}
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                           onClick={handleAddToCart}
                           className={`flex items-center justify-center gap-2 
                              ${selectedSize && isSizeInStock
                                 ? 'bg-primary-500 hover:bg-primary-600 active:scale-95'
                                 : 'bg-gray-700 cursor-not-allowed'
                              } text-white py-3 px-6 rounded-md flex-1 transition duration-300 relative overflow-hidden shadow-md`}
                           disabled={!selectedSize || !isSizeInStock || isAddingToCart}
                        >
                           {isAddingToCart ? (
                              <span className="flex items-center">
                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Adding...
                              </span>
                           ) : (
                              <>
                                 <ShoppingCart size={18} strokeWidth={2.5} />
                                 {isInCart ? 'Go to Cart' : 'Add to Cart'}
                              </>
                           )}
                        </button>

                        <button
                           onClick={handleWishlistToggle}
                           className={`flex items-center justify-center gap-2 border border-gray-600 py-3 px-6 rounded-md hover:border-primary-500 active:scale-95 transition duration-300 ${isInWishlist ? 'bg-red-500/10' : ''}`}
                           aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
                           disabled={isWishlistLoading}
                        >
                           {isWishlistLoading ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                           ) : (
                              <>
                                 <Heart
                                    size={18}
                                    strokeWidth={2.5}
                                    className={`transition-colors duration-300 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                                 />
                                 <span className="whitespace-nowrap">{isInWishlist ? 'Saved' : 'Save'}</span>
                              </>
                           )}
                        </button>
                     </div>

                     {isOnSale && (
                        <div className="glass-morphism border border-primary-700 rounded-md p-4 mt-2 bg-primary-900/30">
                           <div className="flex items-start gap-3">
                              <Tag className="text-primary-300 mt-1 flex-shrink-0" size={18} />
                              <div>
                                 <h4 className="text-primary-300 font-medium text-sm">Limited Time Offer</h4>
                                 <p className="text-white text-sm mt-1">Get {priceInfo.discount}% off for a limited time!</p>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="glass-morphism border border-gray-700 rounded-md p-4 mt-2">
                        <div className="flex items-start gap-3">
                           <Truck className="text-primary-300 mt-1 flex-shrink-0" size={18} />
                           <div>
                              <h4 className="text-white font-medium text-sm">Delivery Information</h4>
                              <p className="text-gray-400 text-sm mt-1">Free shipping on orders over ₹999</p>
                              <p className="text-gray-400 text-sm">Estimated delivery: 3-5 business days</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}

export default AllTimeBestSeller;