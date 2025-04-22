import { LoaderCircle } from 'lucide-react'
import React from 'react'

const OfferDataTable = ({
   collection = [],
   isLoading = false,
   isError = false,
   error = null,
   hasNextPage = false,
   isFetchingNextPage = false,
   onLoadMore = () => { },
   onProductAction = () => { },
   actionLabel = "Edit",
   actionIcon = null,
   infiniteScrollRef = null,
   emptyStateMessage = "No offers found"
}) => {
   return (
      <>
         <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-700">
                  <thead style={{ background: 'rgba(30, 30, 30, 0.8)' }}>
                     <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Discount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Start Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           End Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Products
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                     {isLoading ? (
                        <tr>
                           <td colSpan="8" className="px-6 py-10 text-center text-text-muted">
                              <div className="flex justify-center items-center space-x-2">
                                 <LoaderCircle className="animate-spin h-5 w-5" />
                                 <span>Loading offers...</span>
                              </div>
                           </td>
                        </tr>
                     ) : isError ? (
                        <tr>
                           <td colSpan="8" className="px-6 py-8 text-center" style={{ color: 'var(--color-error)' }}>
                              Error: {error?.message || "Failed to load offers"}
                           </td>
                        </tr>
                     ) : collection.length === 0 ? (
                        <tr>
                           <td colSpan="8" className="px-6 py-8 text-center text-text-muted">
                              {emptyStateMessage}
                           </td>
                        </tr>
                     ) : (
                        collection.map((item, index) => (
                           <tr key={item._id || `offer-item-${index}`} className="hover:bg-surface transition-colors duration-150">
                              <td className="px-6 py-4">
                                 <div className="text-sm font-medium text-text">{item.offerName}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="text-sm text-text-muted">{item.offerCode}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{ background: 'var(--color-primary-900)', color: 'var(--color-text)' }}>
                                    {`${item.discountValue}%`}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-text-muted">
                                 {item.offerStatus ?
                                    <span className="text-green-400">Active</span> :
                                    <span className="text-red-400">Inactive</span>}
                              </td>
                              <td className="px-6 py-4 text-sm text-text-muted">
                                 {item.startDate ? new Date(item.startDate.$date || item.startDate).toLocaleDateString() : 'No start date'}
                              </td>
                              <td className="px-6 py-4 text-sm text-text-muted">
                                 {item.endDate ? new Date(item.endDate.$date || item.endDate).toLocaleDateString() : 'No end date'}
                              </td>
                              <td className="px-6 py-4 text-sm text-text-muted">
                                 {item.products ? item.products.length : 0}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                 <button
                                    onClick={() => onProductAction(item)}
                                    className="text-accent-400 hover:text-accent-300 mr-3 transition-colors flex items-center gap-1"
                                    aria-label={`${actionLabel} offer`}>
                                    {actionIcon}
                                    {actionLabel}
                                 </button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* Load more trigger */}
            {hasNextPage && (
               <div
                  ref={infiniteScrollRef}
                  className="py-4 text-center text-text-muted border-t border-gray-700"
               >
                  {isFetchingNextPage ? (
                     <div className="flex justify-center items-center space-x-2">
                        <LoaderCircle className="animate-spin h-4 w-4" />
                        <span>Loading more...</span>
                     </div>
                  ) : 'Scroll to load more'}
               </div>
            )}
         </div>
      </>
   )
}

export default OfferDataTable