import React from 'react';
import { format } from 'date-fns';

const OfferFeaturedCard = ({ product }) => {
   // Get the correct image from the offer object
   const productImage = product.imageUrl || "https://picsum.photos/300/400";

   // Format the end date to display day and month
   const formatEndDate = () => {
      if (!product.endDate) return { day: '', month: '' };
      try {
         const date = new Date(product.endDate);
         return {
            day: format(date, 'd'),
            month: format(date, 'MMMM')
         };
      } catch (error) {
         return { day: '', month: '' };
      }
   };

   const { day, month } = formatEndDate();

   return (
      <div className="cursor-pointer w-full mb-6">
         <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            {/* Product image with gradient overlay */}
            <img
               src={productImage}
               alt={product.title}
               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70"></div>

            {/* Date display in top right */}
            {day && month && (
               <div className="absolute top-4 right-4 p-2 rounded-lg text-center text-white">
                  <div className="text-3xl font-bold text-primary-500">{day}</div>
                  <div className="text-sm font-semibold">{month}</div>
               </div>
            )}

            {/* Product details */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col justify-center items-center">
               <h3 className="font-bold text-3xl tracking-wide">{product.title}</h3>
               <p className="text-xl font-bold text-gray-200 mb-2">{product.subTitle}</p>

               {/* Discount text */}
               {product.discount && (
                  <div className="text-primary-500 inline-block px-3 py-1 rounded-md font-semibold text-lg mb-3">
                     Up to {product.discount}% OFF
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

export default OfferFeaturedCard