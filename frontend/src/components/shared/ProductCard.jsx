import React, { useState } from 'react'
import Card from './Card'
import CardFooter from './CardFooter'
import AddToCart from '../buttons/AddToCart'
import { Heart, ShoppingCart } from 'lucide-react'

const ProductCard = ({ product }) => {
   const [isHovered, setIsHovered] = useState(false);
   const [isHeartActive, setIsHeartActive] = useState(false);

   // Ensure we have valid image URLs
   const firstImage = Array.isArray(product.image) && product.image.length > 0
      ? product.image[0]
      : "https://picsum.photos/300/400";

   const secondImage = Array.isArray(product.image) && product.image.length > 1
      ? product.image[1]
      : "https://picsum.photos/300/400";

   // Handle mouse events  
   const handleMouseEnter = () => {
      setIsHovered(true);
   };

   const handleMouseLeave = () => {
      setIsHovered(false);
   };

   const toggleHeart = (e) => {
      e.stopPropagation();
      setIsHeartActive(!isHeartActive);
   };

   return (
      <Card
         className="cursor-pointer w-full max-w-[300px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[280px] border border-gray-800 
                  hover:border-gray-700 transition-all duration-300 transform hover:translate-y-[-5px] 
                  hover:shadow-lg hover:shadow-primary-900/10"
         radius="lg"
         shadow="sm"
      >
         <div
            className="p-0 overflow-hidden relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <div className="relative w-full h-[280px] sm:h-[300px] md:h-[320px] overflow-hidden">
               {/* First image (shown by default) */}
               <img
                  src={firstImage}
                  alt={`${product.name} - view 1`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out 
                           ${isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
               />

               {/* Second image (shown on hover) */}
               <img
                  src={secondImage}
                  alt={`${product.name} - view 2`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out 
                           ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
               />

               {/* Overlay on hover */}
               <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 
                             ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            {/* Wishlist button */}
            <button
               className="absolute top-3 right-3 bg-gray-900/80 hover:bg-gray-900 text-white backdrop-blur-sm z-10
                        w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300
                        transform hover:scale-110 active:scale-90"
               onClick={toggleHeart}
            >
               <Heart className={`w-4 h-4 transition-colors duration-300 ${isHeartActive ? 'fill-primary-500 text-primary-500' : 'text-white'}`} />
            </button>

            {/* Quick add button appears on hover */}
            <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out 
                          transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
               <AddToCart
                  className="btn-primary bg-primary-500 hover:bg-primary-600 text-sm px-4 py-2 rounded-full
                           font-medium shadow-md transition-all duration-300 flex items-center gap-1.5"
                  onPress={() => console.log("Added to cart")}
               >
                  <ShoppingCart className="w-4 h-4" /> Quick Add
               </AddToCart>
            </div>
         </div>

         <CardFooter className="flex flex-col items-start gap-1.5 px-3 py-3 bg-surface">
            <h3 className="font-medium text-gray-100 text-sm sm:text-base line-clamp-1">{product.name}</h3>
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">{product.description}</p>
            <div className="flex gap-2 items-center mt-0.5">
               <span className="text-gray-100 font-semibold">₹{product.price.current}</span>
               {product.price.original && (
                  <span className="text-gray-500 line-through text-xs sm:text-sm">₹{product.price.original}</span>
               )}
               {product.price.discount && (
                  <span className="text-green-500 text-xs sm:text-sm font-medium">{product.price.discount}% off</span>
               )}
            </div>
         </CardFooter>
      </Card>
   )
}

export default ProductCard