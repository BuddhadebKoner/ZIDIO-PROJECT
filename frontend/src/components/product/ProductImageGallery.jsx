import React, { useState } from 'react'

const ProductImageGallery = ({ images = [] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle navigation between images
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  } 

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  // If no images provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="mb-4 sm:mb-6">
        <div className="relative aspect-video md:aspect-square rounded-lg overflow-hidden mb-2 sm:mb-3 border border-theme bg-gray-100 flex items-center justify-center">
          <p className="text-secondary">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 sm:mb-6">
        <div className="relative aspect-video md:aspect-square rounded-lg overflow-hidden mb-2 sm:mb-3 border border-theme">
          <img
            src={images[currentImageIndex].imageUrl}
            alt={`Product Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain hover:scale-110 transition-transform cursor-grab"
          />

          {/* Navigation buttons - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background bg-opacity-70 p-1 sm:p-2 rounded-full shadow-lg hover:bg-opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-highlight-primary"
                aria-label="Previous image"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background bg-opacity-70 p-1 sm:p-2 rounded-full shadow-lg hover:bg-opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-highlight-primary"
                aria-label="Next image"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail navigation - scrollable on mobile (only show if more than 1 image) */}
        {images.length > 1 && (
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((image, index) => (
              <button
                key={image.imageId || index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-12 w-16 sm:h-16 sm:w-24 rounded-md overflow-hidden flex-shrink-0 border ${
                  currentImageIndex === index
                    ? 'border-highlight-primary'
                    : 'border-theme'
                } focus:outline-none focus:ring-2 focus:ring-highlight-primary transition-all`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ProductImageGallery