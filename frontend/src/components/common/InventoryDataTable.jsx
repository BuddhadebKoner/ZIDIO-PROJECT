import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const InventoryDataTable = ({
   inventoryItems = [],
   isLoading = false,
   isError = false,
   error = null,
   onRefresh = () => { },
   onRowClick = () => { },
   lastItemRef = null,
   isLoadingMore = false,
   firstPageLoading = false,
   emptyStateMessage = "No inventory items found"
}) => {
   return (
      <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700" role="grid" aria-label="Inventory table">
               <thead className="bg-surface">
                  <tr>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Index
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Product Name
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Total Stock
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Size Breakdown
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Last Updated
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-700">
                  {firstPageLoading ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-text-muted">
                           <div className="flex justify-center items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading inventory data...</span>
                           </div>
                        </td>
                     </tr>
                  ) : isError ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                           <div className="flex flex-col items-center">
                              <AlertTriangle className="text-error mb-2" size={24} />
                              <p className="text-error font-medium">Error: {error?.message || 'Failed to load inventory data'}</p>
                              <button
                                 onClick={onRefresh}
                                 className="mt-4 btn-primary flex items-center gap-2 text-sm py-2"
                              >
                                 <span>Try Again</span>
                                 <RefreshCw size={14} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ) : inventoryItems.length === 0 ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                           {emptyStateMessage}
                        </td>
                     </tr>
                  ) : (
                     inventoryItems.map((item, index) => (
                        <tr
                           key={item._id}
                           onClick={() => onRowClick(item._id)}
                           className="hover:bg-surface transition-colors duration-150 cursor-pointer"
                           ref={index === inventoryItems.length - 1 ? lastItemRef : null}
                        >
                           <td className="px-6 py-4 text-sm text-text-muted">
                              {index + 1}
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-sm font-medium text-text">{item.productId.title}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={"px-2 py-1 rounded text-xs inline-flex leading-5 font-semibold "}>
                                 {item.totalQuantity}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                 {item.stocks.map(stock => (
                                    <span
                                       key={stock._id}
                                       className={"px-2 py-1 rounded text-xs"}
                                    >
                                       {stock.size}: {stock.quantity}
                                    </span>
                                 ))}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-text-muted">
                              {new Date(item.updatedAt).toLocaleDateString()}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {isLoadingMore && (
            <div className="py-4 text-center text-text-muted border-t border-gray-700">
               <div className="flex justify-center items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more...</span>
               </div>
            </div>
         )}
      </div>
   );
};

export default React.memo(InventoryDataTable);