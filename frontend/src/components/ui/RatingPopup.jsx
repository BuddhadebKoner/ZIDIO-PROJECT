import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAddReview } from '../../lib/query/queriesAndMutation';

const RatingPopup = ({ onClose, products, orderId }) => {
   const [ratings, setRatings] = useState(
      products.map(product => ({
         productId: product.product?._id || product.productId,
         productName: product.product?.title || product.title,
         rating: 0,
         comment: '',
      }))
   );
   
   // Use the mutation hook
   const { mutate: submitReview, isLoading } = useAddReview();

   const handleRatingChange = (index, newRating) => {
      const updatedRatings = [...ratings];
      updatedRatings[index].rating = newRating;
      setRatings(updatedRatings);
   };

   const handleCommentChange = (index, comment) => {
      const updatedRatings = [...ratings];
      updatedRatings[index].comment = comment;
      setRatings(updatedRatings);
   };

   const validateRatings = () => {
      // Check if at least one product has been rated
      if (!ratings.some(item => item.rating > 0)) {
         toast.error('Please rate at least one product');
         return false;
      }

      // Check if all rated products have comments
      const ratedWithoutComments = ratings.filter(
         item => item.rating > 0 && !item.comment.trim()
      );

      if (ratedWithoutComments.length > 0) {
         const productNames = ratedWithoutComments.map(item => item.productName);
         toast.error(`Please add comments for all rated products: ${productNames.join(', ')}`);
         return false;
      }

      return true;
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      // Validate all fields
      if (!validateRatings()) {
         return;
      }

      // Filter out products that haven't been rated
      const validRatings = ratings.filter(item => item.rating > 0);

      // Submit data using the mutation
      const reviewData = {
         orderId,
         ratings: validRatings,
      };
      
      // Log the data that would be submitted
      console.log('Rating submission data:', reviewData);
      
      // Use the mutation function from the hook
      submitReview(reviewData, {
         onSuccess: () => {
            // Close the popup on success
            onClose();
         }
      });
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
         <div className="bg-surface text-text rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto red-velvet-border">
            <div className="flex justify-between items-center p-4 border-b border-primary-700/30">
               <h2 className="text-xl font-bold text-primary-300">Rate Your Purchase</h2>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-primary-300 transition-colors duration-300"
                  aria-label="Close"
               >
                  <X size={24} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
               <p className="text-text-muted mb-6">
                  Share your thoughts about the products you purchased. Your feedback helps other shoppers!
               </p>

               <div className="space-y-8">
                  {products.map((product, index) => (
                     <div key={index} className="border border-gray-800 rounded-lg p-6 hover:border-primary-700/50 transition-all duration-300">
                        <div className="flex items-start gap-4 mb-4">
                           {product.imagesUrl && (
                              <img
                                 src={product.imagesUrl}
                                 alt={product.title}
                                 className="w-20 h-20 object-cover rounded-md"
                              />
                           )}
                           <div>
                              <h3 className="font-medium text-primary-200 text-lg">{product.title}</h3>
                              {product.subTitle && (
                                 <p className="text-sm text-text-muted">{product.subTitle}</p>
                              )}
                              <div className="flex gap-2 mt-1 text-xs text-text-muted">
                                 {product.selectedSize && (
                                    <span className="px-2 py-1 bg-gray-800 rounded-md">Size: {product.selectedSize}</span>
                                 )}
                                 {product.quantity && (
                                    <span className="px-2 py-1 bg-gray-800 rounded-md">Qty: {product.quantity}</span>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="mb-5">
                           <p className="text-sm text-text-muted mb-2">
                              Rating <span className="text-red-500">*</span>
                           </p>
                           <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(index, star)}
                                    className={`p-1 transform hover:scale-110 transition-transform duration-200 ${ratings[index].rating >= star ? 'text-yellow-400' : 'text-gray-600'
                                       }`}
                                    aria-label={`Rate ${star} stars`}
                                 >
                                    <Star
                                       size={28}
                                       fill={ratings[index].rating >= star ? 'currentColor' : 'none'}
                                       strokeWidth={ratings[index].rating >= star ? 0 : 1.5}
                                    />
                                 </button>
                              ))}
                           </div>
                           <p className="mt-2 text-xs text-text-muted">
                              {ratings[index].rating === 0 && "Click on a star to rate"}
                              {ratings[index].rating === 1 && "Poor"}
                              {ratings[index].rating === 2 && "Fair"}
                              {ratings[index].rating === 3 && "Good"}
                              {ratings[index].rating === 4 && "Very Good"}
                              {ratings[index].rating === 5 && "Excellent"}
                           </p>
                        </div>

                        <div>
                           <label htmlFor={`comment-${index}`} className="text-sm text-text-muted block mb-2">
                              Review <span className={ratings[index].rating > 0 ? "text-red-500" : ""}>
                                 {ratings[index].rating > 0 ? "* Required" : "(Optional)"}
                              </span>
                           </label>
                           <textarea
                              id={`comment-${index}`}
                              value={ratings[index].comment}
                              onChange={(e) => handleCommentChange(index, e.target.value)}
                              placeholder={ratings[index].rating > 0
                                 ? "Please share your thoughts about this product (required)"
                                 : "Write your thoughts about this product..."}
                              className={`w-full bg-gray-900/50 border ${ratings[index].rating > 0 && !ratings[index].comment.trim()
                                 ? "border-red-500"
                                 : "border-gray-700"
                                 } rounded-md p-3 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-text placeholder-gray-500 transition-all duration-200`}
                           />
                           {ratings[index].rating > 0 && !ratings[index].comment.trim() && (
                              <p className="text-red-500 text-xs mt-1">Comment is required when rating a product</p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="flex justify-end gap-4 mt-8">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-5 py-2.5 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-5 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                     disabled={isLoading}
                  >
                     {isLoading ? 'Submitting...' : 'Submit Ratings'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default RatingPopup;