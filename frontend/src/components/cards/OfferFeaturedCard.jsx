import React from 'react';
import { Link } from 'react-router-dom';

const OfferFeaturedCard = ({ offer }) => {
   return (
      <Link
         to={`${offer.path}`}
      >
         <div className="cursor-pointer w-full mb-6">
            <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
               <img
                  src={offer.imageUrl}
                  alt="Featured offer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
               />
               <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col justify-center items-center">
                  {/* You can add title or other content here if needed */}
               </div>
            </div>
         </div>
      </Link>
   )
}

export default OfferFeaturedCard