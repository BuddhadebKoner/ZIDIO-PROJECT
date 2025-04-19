import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Search, X } from 'lucide-react';
import { useGetAllProducts, useSearchProducts } from '../../lib/query/queriesAndMutation';
import ProductDataTable from '../../components/common/ProductDataTable';

const AdminProduct = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Focus search input on component mount and keyboard shortcut
  useEffect(() => {
    // Focus the search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Add keyboard shortcut (Ctrl+F or Cmd+F) to focus search
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      // Add Escape key functionality to clear search
      if (e.key === 'Escape' && searchQuery) {
        handleClearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get all products (used when not searching)
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetAllProducts();

  // Search products when search query exists
  const {
    data: searchProductsData,
    fetchNextPage: fetchNextSearchProducts,
    isFetchingNextPage: isFetchingNextSearchProducts,
    hasNextPage: hasNextSearchProducts,
    isLoading: isLoadingSearchProducts,
    isError: isErrorSearchProducts,
    error: searchError,
  } = useSearchProducts(debouncedSearchTerm);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search and refocus input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Determine which products to display based on search mode
  const isSearchMode = !!debouncedSearchTerm;

  // Extract and flatten products from the pages structure
  const allProducts = React.useMemo(() => {
    if (isSearchMode) {
      // Use search results when searching
      if (!searchProductsData?.pages) return [];
      return searchProductsData.pages.flatMap(page => page.products || page);
    } else {
      // Use all products when not searching
      if (!data?.pages) return [];
      return data.pages.flatMap(page => page.products || page);
    }
  }, [data, searchProductsData, isSearchMode]);

  // Determine current states based on search mode
  const currentIsLoading = isSearchMode ? isLoadingSearchProducts : isLoading;
  const currentIsError = isSearchMode ? isErrorSearchProducts : isError;
  const currentError = isSearchMode ? searchError : error;
  const currentHasNextPage = isSearchMode ? hasNextSearchProducts : hasNextPage;
  const currentIsFetchingNextPage = isSearchMode ? isFetchingNextSearchProducts : isFetchingNextPage;
  const currentFetchNextPage = isSearchMode ? fetchNextSearchProducts : fetchNextPage;

  // Navigate to edit product page
  const handleProductEdit = useCallback((product) => {
    navigate(`/admin/products/${product.slug}`);
  }, [navigate]);

  // Intersection Observer for infinite scrolling - memoized for efficiency
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentHasNextPage && !currentIsFetchingNextPage) {
          currentFetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [currentHasNextPage, currentIsFetchingNextPage, currentFetchNextPage]);

  return (
    <div className="px-auto py-6">
      {/* Sticky header with search that stays in view when scrolling */}
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <Link
            to="/admin/add-product"
            className="btn-primary flex items-center gap-2"
          >
            <Plus />
            Add Product
          </Link>
        </div>

        <div className="glass-morphism rounded-lg shadow-lg p-4 mb-4">
          <div className="relative flex justify-center items-center">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
              placeholder="Search products... (Ctrl+F)"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search products"
              disabled={currentIsLoading && !allProducts.length}
            />
            <Search className="absolute left-3 w-5 h-5 text-text-muted" />

            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute top-3 right-3 w-5 h-5 text-text-muted hover:text-text transition-colors duration-200"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search results status message */}
          {isSearchMode && (
            <div className="text-sm mt-2 text-text-muted">
              {isLoadingSearchProducts ? 'Searching...' :
                `Found ${allProducts.length} ${allProducts.length === 1 ? 'product' : 'products'} for "${debouncedSearchTerm}"`}
              {allProducts.length > 0 &&
                <button
                  className="ml-2 text-primary-500 hover:underline"
                  onClick={handleClearSearch}
                >
                  Clear search
                </button>
              }
            </div>
          )}
        </div>
      </div>

      <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
        <ProductDataTable
          products={allProducts}
          isLoading={currentIsLoading}
          isError={currentIsError}
          error={currentError}
          hasNextPage={currentHasNextPage}
          isFetchingNextPage={currentIsFetchingNextPage}
          onLoadMore={currentFetchNextPage}
          onProductAction={handleProductEdit}
          actionLabel="Edit"
          actionIcon={<Edit size={16} />}
          infiniteScrollRef={loadMoreRef}
          emptyStateMessage={
            isSearchMode
              ? "No products match your search. Try a different query."
              : "No products found. Add your first product to get started!"
          }
        />
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-4 text-center text-sm text-text-muted">
        Press <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Ctrl+F</kbd> to search | <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Esc</kbd> to clear search
      </div>
    </div>
  );
};

export default AdminProduct;