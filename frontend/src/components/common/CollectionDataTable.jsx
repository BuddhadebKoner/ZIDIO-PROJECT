import { LoaderCircle } from 'lucide-react'
import React from 'react'

const CollectionDataTable = ({
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
}) => {
   return (
      <>
         <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-700">
                  <thead style={{ background: 'rgba(30, 30, 30, 0.8)' }}>
                     <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Subtitle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Products Count
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Featured
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                     {isLoading ? (
                        <tr>
                           <td colSpan="5" className="px-6 py-10 text-center text-text-muted">
                              <div className="flex justify-center items-center space-x-2">
                                 <LoaderCircle className="animate-spin h-5 w-5" />
                                 <span>Loading collections...</span>
                              </div>
                           </td>
                        </tr>
                     ) : isError ? (
                        <tr>
                           <td colSpan="5" className="px-6 py-8 text-center" style={{ color: 'var(--color-error)' }}>
                              Error: {error?.message || "Failed to load collections"}
                           </td>
                        </tr>
                     ) : collection.length === 0 ? (
                        <tr>
                           <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                              No collections found
                           </td>
                        </tr>
                     ) : (
                        collection.map((item, index) => (
                           <tr key={item._id || `collection-item-${index}`} className="hover:bg-surface transition-colors duration-150">
                              <td className="px-6 py-4">
                                 <div className="text-sm font-medium text-text">{item.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="text-sm text-text-muted">{item.subtitle}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{ background: 'var(--color-primary-900)', color: 'var(--color-text)' }}>
                                    {item.products?.length || 0}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-text-muted">
                                 {item.isFeatured ? 
                                    <span className="text-green-400">Yes</span> : 
                                    <span className="text-red-400">No</span>}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                 <button
                                    onClick={() => onProductAction(item)}
                                    className="text-accent-400 hover:text-accent-300 mr-3 transition-colors flex items-center gap-1"
                                    aria-label={`${actionLabel} collection`}>
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

export default CollectionDataTable