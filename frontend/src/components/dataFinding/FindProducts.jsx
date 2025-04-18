import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useGetAllProducts, useSearchProducts } from '../../lib/query/queriesAndMutation';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
import ProductDataLable from '../common/ProductDataLable';

const FindProducts = ({ onSelectProducts, selectedProductIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  // Setup intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Fetch all products when no search query
  const {
    data: allProductsData,
    fetchNextPage: fetchNextAllProducts,
    isFetchingNextPage: isFetchingNextAllProducts,
    hasNextPage: hasNextAllProducts,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
  } = useGetAllProducts();

  // Search products when search query exists
  const {
    data: searchProductsData,
    fetchNextPage: fetchNextSearchProducts,
    isFetchingNextPage: isFetchingNextSearchProducts,
    hasNextPage: hasNextSearchProducts,
    isLoading: isLoadingSearchProducts,
    isError: isErrorSearchProducts,
  } = useSearchProducts(debouncedSearchTerm);

  // Determine which data to use based on search state
  const productsData = debouncedSearchTerm ? searchProductsData : allProductsData;
  const isFetchingNextPage = debouncedSearchTerm ? isFetchingNextSearchProducts : isFetchingNextAllProducts;
  const hasNextPage = debouncedSearchTerm ? hasNextSearchProducts : hasNextAllProducts;
  const fetchNextPage = debouncedSearchTerm ? fetchNextSearchProducts : fetchNextAllProducts;
  const isLoading = debouncedSearchTerm ? isLoadingSearchProducts : isLoadingAllProducts;
  const isError = debouncedSearchTerm ? isErrorSearchProducts : isErrorAllProducts;

  // Format products from paginated data
  const products = productsData?.pages?.flatMap(page => page.products) || [];

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Toggle product selection
  const handleToggleProduct = (productId) => {
    let updatedSelectedProducts;

    if (selectedProductIds.includes(productId)) {
      // Remove product if already selected
      updatedSelectedProducts = selectedProductIds.filter(id => id !== productId);
    } else {
      // Add product if not selected
      updatedSelectedProducts = [...selectedProductIds, productId];
    }

    onSelectProducts(updatedSelectedProducts);
  };

  // Load more when intersection observer detects the element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search errors specifically
  useEffect(() => {
    if (isErrorSearchProducts && debouncedSearchTerm) {
      toast.error("Failed to search products. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [isErrorSearchProducts, debouncedSearchTerm]);

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search products"
          disabled={isLoading && !products.length} // Disable during initial load
        />
        <Search className="absolute top-3 left-3 w-5 h-5 text-text-muted" />

        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute top-3 right-3 w-5 h-5 text-text-muted hover:text-text"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {selectedProductIds.length > 0 && (
        <div className="mb-3 px-3 py-2 bg-surface/50 border border-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => onSelectProducts([])}
              className="text-xs text-primary-400 hover:text-primary-300"
              aria-label="Clear all selections"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {debouncedSearchTerm && (
        <div className="text-sm text-text-muted mb-2">
          {isLoadingSearchProducts ? (
            <span>Searching for "{debouncedSearchTerm}"...</span>
          ) : (
            <span>
              {products.length} result{products.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
            </span>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-2 border border-gray-700 rounded-md p-2 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
        aria-live="polite"
        aria-busy={isLoading || isFetchingNextPage}
      >
        {isError ? (
          <div className="text-center py-4 text-red-400">
            <p>Error loading products. Please try again.</p>
            <button
              onClick={() => debouncedSearchTerm ? fetchNextSearchProducts() : fetchNextAllProducts()}
              className="mt-2 px-4 py-2 bg-surface hover:bg-surface/70 rounded-md text-sm"
              aria-label="Retry loading products"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-text-muted">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span>{debouncedSearchTerm ? "Searching products..." : "Loading products..."}</span>
              </div>
            ) : debouncedSearchTerm ? (
              "No matching products found"
            ) : (
              "No products available"
            )}
          </div>
        ) : (
          <>
            {products.map(product => (
              <ProductDataLable
                key={product._id}
                product={product}
                isSelected={selectedProductIds.includes(product._id)}
                onClick={() => handleToggleProduct(product._id)}
              />
            ))}

            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="text-center py-2">
                <div
                  className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
                  role="status"
                >
                  <span className="sr-only">Loading more products...</span>
                </div>
              </div>
            )}

            {/* Intersection observer target element */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="h-4 w-full"
                aria-hidden="true"
              />
            )}

            {/* Manual load more button as fallback */}
            {hasNextPage && !isFetchingNextPage && products.length >= 10 && (
              <button
                className="w-full text-center py-2 text-sm text-primary-400 hover:text-primary-300"
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
    </div>
  );
};

// Debounce hook to avoid excessive API calls during typing
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
  selectedProductIds: PropTypes.array
};

export default FindProducts;