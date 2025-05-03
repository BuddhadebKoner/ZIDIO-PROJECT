import React, { useState, useEffect } from 'react'
import Card from '../shared/Card'
import CardFooter from '../shared/CardFooter'
import AddToCart from '../buttons/AddToCart'
import { Heart, LoaderCircle, ShoppingCart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAddToWishlist, useAddToCart } from '../../lib/query/queriesAndMutation'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
   const navigate = useNavigate();
   const [isHovered, setIsHovered] = useState(false);
   const [isHeartActive, setIsHeartActive] = useState(false);
   const [isInCart, setIsInCart] = useState(false);

   const {
      mutate: addToWishlist,
      isLoading: isAddingToWishlist,
      isError: isAddingToWishlistError,
      isSuccess: isAddingToWishlistSuccess,
   } = useAddToWishlist()

   const {
      mutate: addToCart,
      isLoading: isAddingToCart,
      isError: isAddingToCartError,
      isSuccess: isAddingToCartSuccess,
   } = useAddToCart()

   const { currentUser, isLoading } = useAuth()

   useEffect(() => {
      if (currentUser && currentUser.wishlist && product) {
         const isInWishlist = currentUser.wishlist.some(item =>
            item === product._id || item === product.slug ||
            (typeof item === 'object' && (item._id === product._id || item.slug === product.slug))
         );
         setIsHeartActive(isInWishlist);
      }
   }, [currentUser, product]);

   useEffect(() => {
      if (isAddingToWishlistSuccess) {
         setIsHeartActive(prev => !prev);
      }
   }, [isAddingToWishlistSuccess]);

   useEffect(() => {
      if (isAddingToCartSuccess) {
         setIsInCart(true);
         toast.success("Product added to cart");
      }
   }, [isAddingToCartSuccess]);

   useEffect(() => {
      if (isAddingToCartError) {
         toast.error("Failed to add to cart");
      }
   }, [isAddingToCartError]);

   useEffect(() => {
      if (currentUser && currentUser.cart && product) {
         const isProductInCart = currentUser.cart.some(item =>
            item.productId === product._id
         );
         setIsInCart(isProductInCart);
      }
   }, [currentUser, product]);

   const firstImage = product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : "https://picsum.photos/300/400";

   const secondImage = product.images && product.images.length > 1
      ? product.images[1].imageUrl
      : firstImage || "https://picsum.photos/300/400";

   const hasActiveDiscount = product.offer && product.offer.active;
   const discountedPrice = hasActiveDiscount
      ? Math.round(product.price - (product.price * product.offer.discountValue / 100))
      : null;

   const handleMouseEnter = () => {
      setIsHovered(true);
   };

   const handleMouseLeave = () => {
      setIsHovered(false);
   };

   const toggleHeart = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isAddingToWishlist) return;

      if (!currentUser) {
         toast.error("Please login to add items to your wishlist");
         return;
      }

      try {
         addToWishlist(product.slug);
      } catch (error) {
         toast.error("Failed to add to wishlist");
      }
   };

   const handleCartAction = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!currentUser) {
         toast.error("Please login to add items to your cart");
         return;
      }

      if (isInCart) {
         navigate('/cart');
      } else {
         addToCart(product._id);
      }
   };

   return (
      <Card
         className="cursor-pointer w-full border border-gray-800 
                  hover:border-gray-700 transition-all duration-300 transform hover:translate-y-[-5px] 
                  hover:shadow-lg hover:shadow-primary-900/10"
         radius="lg"
         shadow="sm"
         slug={product.slug}
      >
         <div
            className="p-0 overflow-hidden relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <Link
               to={`/product/${product.slug}`}>
               <div className="relative w-full h-[450px] sm:h-[400px] md:h-[400px] overflow-hidden">

                  <img
                     src={firstImage}
                     alt={`${product.title} - view 1`}
                     className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out 
                           ${isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
                  />

                  <img
                     src={secondImage}
                     alt={`${product.title} - view 2`}
                     className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out 
                           ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                  />

                  <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 
                             ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
               </div>
            </Link>

            {product.isUnderHotDeals && (
               <span className="absolute top-3 left-3 text-green-500 text-xs font-medium bg-white px-2 py-1 rounded z-10 
                              shadow-md backdrop-blur-sm">
                  Hot Deal
               </span>
            )}

            <div className="absolute top-3 right-3 z-10">
               {isAddingToWishlist ? (
                  <div className="w-8 h-8 rounded-full bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
                     <LoaderCircle className='w-4 h-4 text-primary-500 animate-spin' />
                  </div>
               ) : (
                  <button
                     className="bg-gray-900/80 hover:bg-gray-900 text-white backdrop-blur-sm
                              w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300
                              transform hover:scale-110 active:scale-90"
                     onClick={toggleHeart}
                  >
                     <Heart className={`w-4 h-4 transition-colors duration-300 ${isHeartActive ? 'fill-primary-500 text-primary-500' : 'text-white'}`} />
                  </button>
               )}
            </div>

            <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out 
                          transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
               <AddToCart
                  className={`${isInCart
                     ? 'bg-green-500 hover:bg-green-600'
                     : 'bg-primary-500 hover:bg-primary-600'} 
                     text-sm px-4 py-2 rounded-full font-medium shadow-md transition-all duration-300 flex items-center gap-1.5`}
                  onPress={handleCartAction}
                  disabled={isAddingToCart}
               >
                  {isAddingToCart ? (
                     <LoaderCircle className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                     <ShoppingCart className="w-4 h-4" />
                  )}
                  {isAddingToCart ? 'Adding...' : isInCart ? 'View in Cart' : 'Add to Cart'}
               </AddToCart>
            </div>
         </div>

         <CardFooter className="flex flex-col items-start gap-1 px-2 sm:px-3 py-2 sm:py-3 bg-surface">
            <h3 className="font-medium text-gray-100 text-xs sm:text-sm md:text-base line-clamp-1">{product.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-1">{product.subTitle || product.description}</p>

            <div className="flex flex-wrap gap-1 sm:gap-2 items-center mt-1">
               {hasActiveDiscount ? (
                  <>
                     <span className="text-primary-500 font-semibold text-xs sm:text-sm">₹{discountedPrice}</span>
                     <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
                     <span className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
                        {product.offer.discountValue}% OFF
                     </span>
                  </>
               ) : (
                  <span className="text-gray-100 font-semibold text-xs sm:text-sm">₹{product.price}</span>
               )}

               <div className="flex gap-1.5 ml-auto">
                  {product.isNewArrival && (
                     <span className="text-blue-500 text-xs font-medium bg-white px-1.5 py-0.5 rounded">New</span>
                  )}
               </div>
            </div>
         </CardFooter>
      </Card>
   )
}

export default ProductCard