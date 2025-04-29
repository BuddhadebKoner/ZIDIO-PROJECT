import React, { useState, useEffect } from 'react'
import ElementLoader from './ElementLoader';

const    FullPageLoader = () => {
   const [isGifLoaded, setIsGifLoaded] = useState(false);

   useEffect(() => {
      const img = new Image();
      img.src = "/loadingLogo.gif";
      img.onload = () => setIsGifLoaded(true);
   }, []);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
         <div className="flex flex-col items-center">
            {isGifLoaded ? (
               <img
                  src="/loadingLogo.gif"
                  alt="Loading..."
                  className="w-50 h-50 object-contain"
               />
            ) : (
               <ElementLoader />
            )}
         </div>
      </div>
   )
}

export default FullPageLoader