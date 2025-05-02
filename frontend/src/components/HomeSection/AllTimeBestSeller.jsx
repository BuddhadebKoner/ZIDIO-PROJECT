import React, { useState } from 'react';
import { Heart, ShoppingCart, Minus, Plus, Truck } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const AllTimeBestSeller = ({ products: allTimeBestSeller }) => {
   const [thumbsSwiper, setThumbsSwiper] = useState(null);
   const [selectedSize, setSelectedSize] = useState('');
   const [quantity, setQuantity] = useState(1);
   const [isFavorite, setIsFavorite] = useState(false);

   // console.log('All Time Best Seller:', products);

   // Handle quantity changes
   const decreaseQuantity = () => {
      if (quantity > 1) setQuantity(quantity - 1);
   };

   const increaseQuantity = () => {
      setQuantity(quantity + 1);
   };

   // Calculate prices based on discount
   const calculatePrices = (product) => {
      if (!product) return { current: 0, original: 0, discount: 0 };

      const originalPrice = product.price;
      const discountValue = product.offer?.discountValue || 0;
      const currentPrice = discountValue > 0
         ? originalPrice - (originalPrice * (discountValue / 100))
         : originalPrice;

      return {
         current: Math.round(currentPrice),
         original: originalPrice,
         discount: discountValue
      };
   };

   // Get available sizes from product data
   const sizes = allTimeBestSeller?.size || ['S', 'M', 'L', 'XL', 'XXL'];

   // Format images for the gallery
   const formatImages = (product) => {
      if (!product || !product.images) return [];
      return product.images.map(img => ({
         src: img.imageUrl,
         id: img._id
      }));
   };

   // Fallback product data
   const defaultProduct = {
      title: 'Premium Product',
      description: 'High-quality premium product for all occasions',
      price: 999,
      offer: {
         discountValue: 20
      },
      images: [
         { imageUrl: '/api/placeholder/600/600', _id: '1' },
         { imageUrl: '/api/placeholder/600/600', _id: '2' },
         { imageUrl: '/api/placeholder/600/600', _id: '3' },
         { imageUrl: '/api/placeholder/600/600', _id: '4' }
      ],
      size: ['S', 'M', 'L', 'XL', 'XXL'],
      _id: 'PROD-12345'
   };

   // Use product data or fallback
   const productData = allTimeBestSeller || defaultProduct;

   // Calculate price information
   const priceInfo = calculatePrices(productData);

   // Format images for swiper
   const productImages = formatImages(productData);

   // Check if product is on sale
   const isOnSale = priceInfo.discount > 0;

   return (
      <>
         {/* Community's All-Time Bestseller */}
         <section className='w-full py-12'>
            <div className='container mx-auto px-4 md:px-8'>
               <h1 className='text-3xl font-bold text-center text-primary-300 mb-20'>
                  Community's All-Time Bestseller
               </h1>

               <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Product Images Gallery */}
                     <div className="w-full">
                        <div className="overflow-hidden rounded-lg mb-4">
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
                              {productImages.map((img, index) => (
                                 <SwiperSlide key={img.id || index} className="h-full w-full flex items-center justify-center">
                                    <img
                                       src={img.src}
                                       alt={`${productData.title} view ${index + 1}`}
                                       className="max-h-full max-w-full object-contain rounded-lg"
                                    />
                                 </SwiperSlide>
                              ))}
                           </Swiper>
                        </div>

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
                                       alt={`${productData.title} thumbnail ${index + 1}`}
                                       className="h-full w-full object-cover cursor-pointer"
                                    />
                                 </SwiperSlide>
                              ))}
                           </Swiper>
                        </div>
                     </div>

                     {/* Product Info */}
                     <div className="flex flex-col space-y-6">
                        {/* website logo */}
                        <div className='flex items-center justify-start space-y-2 mb-4'>
                           <img
                              src="./logo.png"
                              className='h-10 w-10'
                              alt="logo" />
                           <p className='flex items-center text-gray-400'>
                              <span className='text-white font-semibold text-lg'>Buddha's Clothings</span>
                           </p>
                        </div>

                        {/* Product Title */}
                        <div className='flex flex-col'>
                           <h2 className="text-2xl font-semibold text-white">{productData.title}</h2>
                           <p className="text-gray-400 mt-2">{productData.description}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                           <span className="text-2xl font-bold text-primary-300">
                              ₹ {priceInfo.current.toLocaleString()}
                           </span>

                           {isOnSale && (
                              <>
                                 <span className="text-lg text-gray-400 line-through">
                                    ₹ {priceInfo.original.toLocaleString()}
                                 </span>
                                 <span className="px-2 py-1 bg-primary-500 text-white text-sm rounded">
                                    {priceInfo.discount}% OFF
                                 </span>
                              </>
                           )}
                        </div>

                        {/* Size Selection */}
                        <div className="pt-2">
                           <h3 className="text-base font-medium text-white mb-3">Select Size</h3>
                           <div className="flex flex-wrap gap-3">
                              {sizes.map((size) => (
                                 <button
                                    key={size}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border ${selectedSize === size
                                       ? 'border-primary-500 bg-primary-500 text-white'
                                       : 'border-gray-600 text-gray-300 hover:border-primary-500'
                                       } transition-colors`}
                                    onClick={() => setSelectedSize(size)}
                                 >
                                    {size}
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
                                 className="px-3 py-2 text-gray-300 hover:text-primary-500"
                                 aria-label="Decrease quantity"
                              >
                                 <Minus size={16} />
                              </button>

                              <span className="flex-1 text-center py-2 text-white text-base font-medium">
                                 {quantity}
                              </span>

                              <button
                                 onClick={increaseQuantity}
                                 className="px-3 py-2 text-gray-300 hover:text-primary-500"
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
                              className="flex items-center justify-center gap-2 border border-gray-600 py-3 px-6 rounded hover:border-primary-500 transition duration-300"
                              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                           >
                              <Heart
                                 size={18}
                                 className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"}
                              />
                              <span className="whitespace-nowrap">{isFavorite ? 'Saved' : 'Save'}</span>
                           </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="glass-morphism border border-gray-700 rounded p-4 mt-2">
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
      </>
   )
}

export default AllTimeBestSeller