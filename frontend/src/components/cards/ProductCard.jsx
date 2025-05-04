import React, { useState, useEffect } from 'react'
import Card from '../shared/Card'
import CardFooter from '../shared/CardFooter'
import AddToCart from '../buttons/AddToCart'
import { Heart, LoaderCircle, ShoppingCart, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { useAddToCart, useAddToWishlist, useRemoveFromWishlist } from '../../lib/query/queriesAndMutation'

const ProductCard = ({ product }) => {
   const navigate = useNavigate();
   const [isHovered, setIsHovered] = useState(false);
   const [isHeartActive, setIsHeartActive] = useState(false);
   const [isInCart, setIsInCart] = useState(false);

   const { currentUser } = useAuth();

   // console.log(currentUser.cart, currentUser.wishlist, product);

   const {
      mutate: addToWishlist,
      isLoading: isAddingToWishlist,
   } = useAddToWishlist({
      onSuccess: () => {
         setIsHeartActive(true);
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
         setIsHeartActive(false);
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

   useEffect(() => {
      if (currentUser?.wishlist && product) {
         const isInWishlist = currentUser.wishlist.some(item =>
            item === product._id || item === product.slug ||
            (typeof item === 'object' && (item._id === product._id || item.slug === product.slug))
         );
         setIsHeartActive(isInWishlist);
      }
   }, [currentUser?.wishlist, product]);

   useEffect(() => {
      if (currentUser?.cart && product) {
         const cartItem = currentUser.cart.find(item => item.productId === product._id);
         if (cartItem) {
            setIsInCart(true);
         } else {
            setIsInCart(false);
         }
      }
   }, [currentUser?.cart, product]);

   useEffect(() => {
      if (isAddingToCartSuccess) {
         setIsInCart(true);
      }
   }, [isAddingToCartSuccess]);

   useEffect(() => {
      if (isAddingToCartError) {
         toast.error("Failed to add to cart");
      }
   }, [isAddingToCartError]);

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

      if (isAddingToWishlist || isRemovingFromWishlist) return;

      if (!currentUser) {
         toast.error("Please login to manage your wishlist");
         return;
      }

      try {
         if (isHeartActive) {
            removeFromWishlist(product._id);
         } else {
            addToWishlist(product._id);
         }
      } catch (error) {
         toast.error("Failed to update wishlist");
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
         // Get the first size from the product array if available
         let sizeToSend = null;
         if (product?.size?.length > 0) {
            const firstSize = product.size[0];
            sizeToSend = typeof firstSize === 'object' ? firstSize.value : firstSize;
            sizeToSend = sizeToSend.toString();
         }

         addToCart({ productId: product._id, quantity: 1, size: sizeToSend });
      }
   };

   const getCartButtonContent = () => {
      if (isAddingToCart) {
         return (
            <>
               <LoaderCircle className="w-4 h-4 animate-spin" />
               <span>Adding...</span>
            </>
         );
      } else if (isInCart) {
         return (
            <>
               <Link
                  to={`/cart`}
                  className='cursor-pointer flex items-center gap-2'
               >
                  <Check className="w-4 h-4" />
                  <span>View in Cart</span>
               </Link>
            </>
         );
      } else {
         return (
            <>
               <ShoppingCart className="w-4 h-4" />
               <span>Add to Cart</span>
            </>
         );
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

            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
               {product.isUnderHotDeals && (
                  <span className="text-green-500 text-xs font-medium bg-white px-2 py-1 rounded shadow-md backdrop-blur-sm">
                     Hot Deal
                  </span>
               )}

               {product.isNewArrival && (
                  <span className="text-blue-500 text-xs font-medium bg-white px-2 py-1 rounded shadow-md backdrop-blur-sm">
                     New
                  </span>
               )}
            </div>

            <div className="absolute top-3 right-3 z-10">
               <button
                  className={`${isAddingToWishlist || isRemovingFromWishlist ? 'bg-gray-900/90' : 'bg-gray-900/80 hover:bg-gray-900'} 
                           text-white backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center 
                           transition-all duration-300 transform ${isAddingToWishlist || isRemovingFromWishlist ? '' : 'hover:scale-110 active:scale-90'}`}
                  onClick={toggleHeart}
                  disabled={isAddingToWishlist || isRemovingFromWishlist}
               >
                  {(isAddingToWishlist || isRemovingFromWishlist) ? (
                     <LoaderCircle className="w-4 h-4 text-primary-500 animate-spin" />
                  ) : (
                     <Heart
                        className={`w-4 h-4 transition-colors duration-300 
                                 ${isHeartActive ? 'fill-primary-500 text-primary-500' : 'text-white'}`}
                     />
                  )}
               </button>
            </div>
            <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out 
                          transform ${isHovered || isInCart ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
               <AddToCart
                  className={`${isInCart
                     ? 'bg-green-500 hover:bg-green-600'
                     : 'bg-primary-500 hover:bg-primary-600'} 
                     text-sm px-5 py-2 rounded-full font-medium shadow-md transition-all duration-300 
                     flex items-center gap-2 text-white min-w-[140px] justify-center
                     ${isAddingToCart ? 'opacity-90 cursor-wait' : ''}`}
                  onPress={handleCartAction}
                  disabled={isAddingToCart}
               >
                  {getCartButtonContent()}
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

               <div className="ml-auto">
                  {isInCart && (
                     <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span className="hidden sm:inline">In Cart</span>
                     </span>
                  )}
               </div>
            </div>
         </CardFooter>
      </Card>
   )
}

export default ProductCard