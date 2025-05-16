import React, { useRef, useCallback, useState } from 'react'
import { useGetAllReviews } from '../../lib/query/queriesAndMutation'
import { Star, Award, BadgeCheck, ChevronDown, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import FullPageLoader from '../../components/loaders/FullPageLoader'

const AdminReviews = () => {
  const [selectedRating, setSelectedRating] = useState(0)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllReviews()

  // Intersection observer for infinite scrolling
  const observer = useRef()
  const lastReviewElementRef = useCallback(node => {
    if (isFetchingNextPage) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })
    if (node) observer.current.observe(node)
  }, [isFetchingNextPage, fetchNextPage, hasNextPage])

  // Simple star rating display
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "text-[#e24d84] fill-[#e24d84]" : "text-gray-600"}
          />
        ))}
      </div>
    )
  }

  // Filter reviews based on selected filters
  const getFilteredReviews = () => {
    if (!data?.pages) return []

    let allReviews = []
    data.pages.forEach(page => {
      if (page?.reviews) {
        allReviews = [...allReviews, ...page.reviews]
      }
    })

    return allReviews.filter(review => {
      const ratingMatch = selectedRating === 0 || review.rating === selectedRating
      const featuredMatch = !showFeaturedOnly || review.isFeatured
      return ratingMatch && featuredMatch
    })
  }

  const filteredReviews = getFilteredReviews()

  if (isError) {
    return <div className="p-4 text-center text-error">Error: {error.message}</div>
  }

  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-auto p-4">
      <div className="sticky top-0 bg-background z-10 pb-4 mb-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h1 className="text-xl font-bold">
            Reviews <span className="text-sm text-text-muted">({filteredReviews.length})</span>
          </h1>

          <div className="flex gap-2 flex-wrap">
            {/* Rating filter */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded">
              {[0, 1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`w-7 h-7 rounded ${selectedRating === rating
                    ? 'bg-primary-600 text-bg-white'
                    : 'hover:bg-gray-800'
                    }`}
                >
                  {rating === 0 ? 'All' : rating}
                </button>
              ))}
            </div>

            {/* Featured filter */}
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`flex items-center gap-1 p-1 rounded ${showFeaturedOnly ? 'bg-primary-600' : 'bg-surface'
                }`}
            >
              {showFeaturedOnly ? <Award size={16} /> : <BadgeCheck size={16} />}
              <span className="text-sm">Featured</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-800 w-full"></div>
      </div>

      {isLoading ? (
        <>
          <FullPageLoader />
        </>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center p-8 bg-surface rounded">
          <p>No reviews match your current filters</p>
        </div>
      ) : (
        <div className="bg-surface rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Rating</th>
                <th className="text-left p-3 font-medium">Review</th>
                <th className="text-left p-3 font-medium w-24">Date</th>
                <th className="text-center p-3 font-medium w-24">Featured</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review, index) => {
                const isLastElement = index === filteredReviews.length - 1
                return (
                  <tr
                    ref={isLastElement ? lastReviewElementRef : null}
                    key={review._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="p-3">
                      <span className="font-medium truncate block max-w-[200px]" title={review.productId.title}>
                        {review.productId.title.replace("slevs", "sleeves")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="truncate block max-w-[150px]">{review.userId.fullName}</span>
                    </td>
                    <td className="p-3">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="p-3">
                      <p className="text-sm max-w-[300px] line-clamp-2" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>
                    <td className="p-3 text-xs text-text-muted">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </td>
                    <td className="p-3 text-center">
                      {review.isFeatured ? (
                        <Award size={18} className="text-primary-500 inline-block" />
                      ) : (
                        <span className="inline-block w-5 h-5"></span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {isFetchingNextPage && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
        </div>
      )}

      {!hasNextPage && filteredReviews.length > 0 && (
        <div className="text-center py-4 text-sm text-text-muted">
          No more reviews to load
        </div>
      )}
    </div>
  )
}

export default AdminReviews