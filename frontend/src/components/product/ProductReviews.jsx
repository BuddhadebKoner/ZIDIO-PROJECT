import React, { useState, useEffect } from 'react'

const ProductReviews = ({ slug }) => {
  // State for reviews and loading status
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  // Fetch reviews data
  useEffect(() => {
    // In a real app, you would fetch reviews from an API
    const fetchReviews = async () => {
      setIsLoading(true)

      try {
        // Simulate API call with dummy data
        await new Promise(resolve => setTimeout(resolve, 800))

        // Dummy reviews data
        const dummyReviews = [
          {
            userId: 'user1',
            name: 'John Smith',
            rating: 5,
            comment: 'Excellent t-shirt quality. The fabric is soft and comfortable, and the design has held up well after multiple washes. Sizing is accurate as described.',
            createdAt: '2025-03-25T14:32:22Z'
          },
          {
            userId: 'user2',
            name: 'Sarah Johnson',
            rating: 4,
            comment: 'Great design and color, fits as expected. Took away one star because the fabric is a bit thinner than I expected, but still good quality overall.',
            createdAt: '2025-03-20T09:15:43Z'
          },
          {
            userId: 'user3',
            name: 'Miguel Rodriguez',
            rating: 5,
            comment: 'This t-shirt exceeded my expectations! The print quality is exceptional and the material is breathable and perfect for summer.',
            createdAt: '2025-04-01T16:22:10Z'
          }
        ]

        setReviews(dummyReviews)

        // Calculate average rating
        const totalRating = dummyReviews.reduce((acc, review) => acc + review.rating, 0)
        setAverageRating(dummyReviews.length > 0 ? totalRating / dummyReviews.length : 0)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [slug])

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
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

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight-primary"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div>
          {/* Summary */}
          <div className="mb-6 bg-glass p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</div>
              <div className="mr-2">{renderStars(Math.round(averageRating))}</div>
              <div className="text-sm text-secondary">({reviews.length} reviews)</div>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="border-b border-theme pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-primary">{review.name}</div>
                  <div className="text-xs text-secondary">{formatDate(review.createdAt)}</div>
                </div>
                <div className="mb-2">{renderStars(review.rating)}</div>
                <p className="text-secondary text-sm sm:text-base">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Write review button */}
          <div className="mt-6">
            <button className="bg-highlight-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-all">
              Write a Review
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-secondary mb-4">No reviews yet. Be the first to review this product!</p>
          <button className="bg-highlight-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-all">
            Write a Review
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductReviews