import { X } from 'lucide-react'
import React, { useEffect, Suspense, useState } from 'react'
import { motion } from 'framer-motion'
const LazySpline = React.lazy(() => import('@splinetool/react-spline'))

const SplineModel = ({
   url,
   setIsModelPopupOpen,
}) => {
   const [isLoading, setIsLoading] = useState(true);
   // Create a cache-busting URL with timestamp
   const cacheBustUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;

   // Reset loading state whenever URL changes
   useEffect(() => {
      setIsLoading(true);
   }, [url]);

   // improved scroll lock when modal is open
   useEffect(() => {
      // Store original body style and scroll position
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const scrollY = window.scrollY;
      
      // Apply scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
         // Restore original style and position
         document.body.style.overflow = originalStyle;
         document.body.style.position = '';
         document.body.style.top = '';
         document.body.style.width = '';
         window.scrollTo(0, scrollY);
      }
   }, []);

   // close modal when escape key is pressed
   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            setIsModelPopupOpen(false)
         }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
         window.removeEventListener('keydown', handleKeyDown)
      }
   }, [setIsModelPopupOpen])

   return (
      <>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-morphism fixed inset-0 z-50 flex items-center justify-center p-4"
         >
            <div
               className="absolute inset-0  bg-opacity-75"
            />
            <div className="relative rounded-lg w-full max-w-4xl h-[80vh] z-10 overflow-hidden mt-20">
               <button
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all text-white z-20"
                  onClick={() => setIsModelPopupOpen(false)}
               >
                  <X size={20} className='cursor-pointer' />
               </button>

               <div className="w-full h-full flex items-center justify-center">
                  <Suspense fallback={
                     <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300"></div>
                        <p className="text-white mt-4 text-lg">Loading 3D Model...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                     </div>
                  }>
                     {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 glass-morphism bg-opacity-50">
                           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300"></div>
                           <p className="text-white mt-4 text-lg">Loading 3D Model...</p>
                           <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                        </div>
                     )}
                     <LazySpline
                        key={cacheBustUrl} // Add key to force re-render
                        scene={cacheBustUrl} // Use cache-busting URL
                        onLoad={() => setIsLoading(false)}
                        className={isLoading ? "opacity-0" : "opacity-100"}
                     />
                  </Suspense>
               </div>
            </div>
         </motion.div>
      </>
   )
}

export default SplineModel