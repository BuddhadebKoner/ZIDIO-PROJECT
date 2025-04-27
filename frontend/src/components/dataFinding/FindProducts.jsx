import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Trash2, Info } from 'lucide-react';
import { useGetAllProducts, useSearchProducts } from '../../lib/query/queriesAndMutation';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
import ProductDataLable from '../common/ProductDataLable';

/**
 * Dynamic reusable product finder component
 * @param {Object} props - Component properties
 * @param {function} props.onSelectProducts - Callback function when products are selected
 * @param {Array} props.selectedProductIds - Array of pre-selected product IDs
 * @param {string} props.title - Optional custom title for the component
 * @param {string} props.emptyStateMessage - Optional custom message for empty state
 * @param {number} props.maxSelections - Optional maximum number of products that can be selected
 * @param {boolean} props.allowMultiple - Whether multiple products can be selected (default: true)
 * @param {boolean} props.showAddButton - Whether to show the add button (default: true)
 * @param {boolean} props.showCount - Whether to show the count badge (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const FindProducts = ({
  onSelectProducts,
  selectedProductIds = [],
  title = "Selected Products",
  emptyStateMessage = "No products selected",
  maxSelections = null,
  allowMultiple = true,
  showAddButton = true,
  showCount = true,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedIds, setInternalSelectedIds] = useState(selectedProductIds);
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  // Synchronize with external selected IDs
  useEffect(() => {
    setInternalSelectedIds(selectedProductIds);
  }, [selectedProductIds]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const {
    data: allProductsData,
    fetchNextPage: fetchNextAllProducts,
    isFetchingNextPage: isFetchingNextAllProducts,
    hasNextPage: hasNextAllProducts,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
  } = useGetAllProducts();

  const {
    data: searchProductsData,
    fetchNextPage: fetchNextSearchProducts,
    isFetchingNextPage: isFetchingNextSearchProducts,
    hasNextPage: hasNextSearchProducts,
    isLoading: isLoadingSearchProducts,
    isError: isErrorSearchProducts,
  } = useSearchProducts(debouncedSearchTerm);

  const productsData = debouncedSearchTerm ? searchProductsData : allProductsData;
  const isFetchingNextPage = debouncedSearchTerm ? isFetchingNextSearchProducts : isFetchingNextAllProducts;
  const hasNextPage = debouncedSearchTerm ? hasNextSearchProducts : hasNextAllProducts;
  const fetchNextPage = debouncedSearchTerm ? fetchNextSearchProducts : fetchNextAllProducts;
  const isLoading = debouncedSearchTerm ? isLoadingSearchProducts : isLoadingAllProducts;
  const isError = debouncedSearchTerm ? isErrorSearchProducts : isErrorAllProducts;

  const products = productsData?.pages?.flatMap(page => page.products) || [];
  const filteredProducts = showPopup ? products.filter(product => !internalSelectedIds.includes(product._id)) : [];
  const selectedProducts = products.filter(product => internalSelectedIds.includes(product._id));

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleClearSearch = () => setSearchQuery('');

  const handleToggleProduct = (productId) => {
    let updatedSelectedProducts;

    if (internalSelectedIds.includes(productId)) {
      // Remove product
      updatedSelectedProducts = internalSelectedIds.filter(id => id !== productId);
    } else {
      // Add product - handle different selection modes
      if (!allowMultiple) {
        // Single selection mode
        updatedSelectedProducts = [productId];
      } else if (maxSelections && internalSelectedIds.length >= maxSelections) {
        // Max selections reached
        toast.warning(`Maximum of ${maxSelections} products can be selected`);
        return;
      } else {
        // Normal multiple selection
        updatedSelectedProducts = [...internalSelectedIds, productId];
      }
    }

    setInternalSelectedIds(updatedSelectedProducts);
    onSelectProducts(updatedSelectedProducts);
  };

  const handleRemoveProduct = (e, productId) => {
    e.stopPropagation();
    const updatedSelectedProducts = internalSelectedIds.filter(id => id !== productId);
    setInternalSelectedIds(updatedSelectedProducts);
    onSelectProducts(updatedSelectedProducts);
  };

  const handleAddButtonClick = () => {
    setShowPopup(true);
    setSearchQuery('');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSearchQuery('');
  };

  const handleClearAll = () => {
    setInternalSelectedIds([]);
    onSelectProducts([]);
  };

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && showPopup) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, showPopup]);

  useEffect(() => {
    if (isErrorSearchProducts && debouncedSearchTerm) {
      toast.error("Failed to search products. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [isErrorSearchProducts, debouncedSearchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className={`w-full relative ${className}`}>
      <div className="mb-6 border border-gray-700 rounded-md overflow-hidden bg-surface/40 shadow-lg">
        <div className="flex items-center justify-between p-3 bg-surface/80 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-medium text-text">{title}</h3>
            {showCount && internalSelectedIds.length > 0 && (
              <div className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                {internalSelectedIds.length}
                {maxSelections && ` / ${maxSelections}`}
              </div>
            )}
          </div>
          {showAddButton && (
            <button
              type="button"
              onClick={handleAddButtonClick}
              className="px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-1 shadow-md relative overflow-hidden group"
              aria-label="Add products"
            >
              <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Add Products</span>
            </button>
          )}
        </div>

        <div className="p-3">
          {internalSelectedIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted bg-gray-900/20 rounded-md border border-dashed border-gray-700">
              <Info className="w-10 h-10 mb-2 opacity-60" />
              <p>{emptyStateMessage}</p>
              {showAddButton && (
                <button
                  onClick={handleAddButtonClick}
                  className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Click to add products
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {selectedProducts.map(product => (
                <div
                  key={product._id}
                  className="flex items-center justify-between bg-surface/70 border border-gray-700 rounded-md p-2.5 hover:bg-surface transition-colors group"
                >
                  <ProductDataLable
                    product={product}
                    isSelected={true}
                    onClick={() => { }}
                  />
                  <button
                    onClick={(e) => handleRemoveProduct(e, product._id)}
                    className="ml-2 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-all opacity-70 group-hover:opacity-100"
                    aria-label="Remove product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {internalSelectedIds.length > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleClearAll}
                className="text-xs text-primary-400 hover:text-primary-300 py-1 px-2 hover:bg-primary-950/50 rounded transition-colors"
                aria-label="Clear all selections"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={popupRef}
            className="bg-surface border border-gray-700 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-[fadeIn_0.2s_ease-out]"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-surface/80">
              <h3 className="text-lg font-medium">
                Add {allowMultiple ? "Products" : "a Product"}
                {maxSelections && ` (Max: ${maxSelections})`}
              </h3>
              <button
                onClick={handleClosePopup}
                className="p-1.5 text-text-muted hover:text-text hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  aria-label="Search products"
                  disabled={isLoading && !products.length}
                />
                <Search className="absolute top-3 left-3 w-5 h-5 text-text-muted" />

                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute top-3 right-3 w-5 h-5 text-text-muted hover:text-text"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {debouncedSearchTerm && (
                <div className="text-sm text-text-muted mb-2 px-1">
                  {isLoadingSearchProducts ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Searching for "{debouncedSearchTerm}"...</span>
                    </div>
                  ) : (
                    <span>
                      {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 border-t border-gray-700/50"
              style={{ scrollBehavior: 'smooth' }}
              aria-live="polite"
              aria-busy={isLoading || isFetchingNextPage}
            >
              {isError ? (
                <div className="text-center py-8 text-red-400 bg-red-900/10 rounded-md border border-red-800/30">
                  <p>Error loading products. Please try again.</p>
                  <button
                    onClick={() => debouncedSearchTerm ? fetchNextSearchProducts() : fetchNextAllProducts()}
                    className="mt-3 px-4 py-2 bg-surface hover:bg-surface/70 border border-gray-700 rounded-md text-sm transition-colors"
                    aria-label="Retry loading products"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="inline-block w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span>{debouncedSearchTerm ? "Searching products..." : "Loading products..."}</span>
                    </div>
                  ) : debouncedSearchTerm ? (
                    <div className="flex flex-col items-center">
                      <Search className="w-10 h-10 mb-2 opacity-40" />
                      <p>No matching products found</p>
                      <p className="text-xs mt-1 max-w-xs opacity-70">Try different keywords or browse all products</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Info className="w-10 h-10 mb-2 opacity-40" />
                      <p>No products available or all products are already selected</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      className="transition-transform hover:translate-x-1 duration-200"
                    >
                      <ProductDataLable
                        product={product}
                        isSelected={false}
                        onClick={() => handleToggleProduct(product._id)}
                      />
                    </div>
                  ))}

                  {isFetchingNextPage && (
                    <div className="text-center py-4">
                      <div
                        className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
                        role="status"
                      >
                        <span className="sr-only">Loading more products...</span>
                      </div>
                    </div>
                  )}

                  <div
                    ref={loadMoreRef}
                    className="h-4 w-full"
                    aria-hidden="true"
                  />

                  {hasNextPage && !isFetchingNextPage && filteredProducts.length >= 10 && (
                    <button
                      className="w-full text-center py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-950/30 rounded transition-colors"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      aria-label="Load more products"
                    >
                      Load more
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-surface/80">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 border border-gray-700 text-text-muted hover:text-text rounded-md hover:bg-surface transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors shadow-md"
                aria-label="Done"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

FindProducts.propTypes = {
  onSelectProducts: PropTypes.func.isRequired,
  selectedProductIds: PropTypes.array,
  title: PropTypes.string,
  emptyStateMessage: PropTypes.string,
  maxSelections: PropTypes.number,
  allowMultiple: PropTypes.bool,
  showAddButton: PropTypes.bool,
  showCount: PropTypes.bool,
  className: PropTypes.string
};

export default FindProducts;