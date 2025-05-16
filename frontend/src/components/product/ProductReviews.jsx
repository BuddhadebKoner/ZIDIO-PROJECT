import React, { useState, useRef, useEffect } from 'react'
import { useGetReviewsById } from '../../lib/query/queriesAndMutation'
import { avatars } from '../../utils/constant'

const ProductReviews = ({ slug }) => {
  // State for reviews and loading status
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  // Reference for intersection observer
  const loadMoreRef = useRef(null)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetReviewsById(slug)

  // Handle intersection for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Calculate average rating and flatten reviews from all pages
  const reviews = data?.pages.flatMap(page => page.reviews || []) || []

  useEffect(() => {
    if (data?.pages?.length > 0) {
      const firstPage = data.pages[0]
      setTotalReviews(firstPage.totalReviews || 0)
      
      // Use the server-provided averageRating instead of calculating it manually
      setAverageRating(firstPage.averageRating || 0)
    }
  }, [data])

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Find avatar URL by avatar name
  const getAvatarUrl = (avatarName) => {
    const avatar = avatars.find(a => a.name === avatarName)
    return avatar ? avatar.url : null
  }

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Customer Reviews</h2>

      {isLoading && reviews.length === 0 ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-500">
          <p>Error loading reviews: {error?.message || 'Something went wrong'}</p>
        </div>
      ) : reviews.length > 0 ? (
        <div>
          {/* Summary */}
          <div className="mb-6 bg-glass p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</div>
              <div className="mr-2">{renderStars(Math.round(averageRating))}</div>
              <div className="text-sm text-secondary">({totalReviews} reviews)</div>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-theme pb-4 last:border-b-0">
                <div className="flex items-start mb-1">
                  {review.userAvatar && (
                    <img
                      src={getAvatarUrl(review.userAvatar)}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-primary">{review.userName}</div>
                      <div className="text-xs text-secondary">{formatDate(review.createdAt)}</div>
                    </div>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className="text-secondary text-sm sm:text-base">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator for next page */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-highlight-primary"></div>
              ) : (
                <div className="h-6 w-6"></div> // Placeholder to maintain same height
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-secondary mb-4">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}

export default ProductReviews