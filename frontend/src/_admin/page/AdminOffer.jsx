import { Edit, Plus, Search, X } from 'lucide-react'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetAllOffers, useSearchOffers } from '../../lib/query/queriesAndMutation'
import OfferDataTable from '../../components/common/OfferDataTable'

const AdminOffer = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Focus search input and setup keyboard shortcuts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
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

  // Get all offers query
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetAllOffers();

  // Search offers query
  const {
    data: searchOffersData,
    fetchNextPage: fetchNextSearchOffers,
    isFetchingNextPage: isFetchingNextSearchOffers,
    hasNextPage: hasNextSearchOffers,
    isLoading: isLoadingSearchOffers,
    isError: isErrorSearchOffers,
    error: searchError,
  } = useSearchOffers(debouncedSearchTerm);

  // Handle search input change
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Clear search and refocus input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const isSearchMode = !!debouncedSearchTerm;

  // Combine all offers from paginated results
  const allOffers = useMemo(() => {
    const pagesData = isSearchMode ? searchOffersData?.pages : data?.pages;
    if (!pagesData) return [];

    return pagesData.flatMap(page =>
      page.offers || page.data || page
    );
  }, [data, searchOffersData, isSearchMode]);

  // Determine current state based on search mode
  const currentState = useMemo(() => ({
    isLoading: isSearchMode ? isLoadingSearchOffers : isLoading,
    isError: isSearchMode ? isErrorSearchOffers : isError,
    error: isSearchMode ? searchError : error,
    hasNextPage: isSearchMode ? hasNextSearchOffers : hasNextPage,
    isFetchingNextPage: isSearchMode ? isFetchingNextSearchOffers : isFetchingNextPage,
    fetchNextPage: isSearchMode ? fetchNextSearchOffers : fetchNextPage
  }), [
    isSearchMode,
    isLoadingSearchOffers, isLoading,
    isErrorSearchOffers, isError,
    searchError, error,
    hasNextSearchOffers, hasNextPage,
    isFetchingNextSearchOffers, isFetchingNextPage,
    fetchNextSearchOffers, fetchNextPage
  ]);

  // Handle editing an offer
  const handleOfferEdit = useCallback((offer) => {
    navigate(`/admin/offer/${offer.slug || offer._id}`);
  }, [navigate]);

  // Intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentState.hasNextPage && !currentState.isFetchingNextPage) {
          currentState.fetchNextPage();
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
  }, [currentState]);

  return (
    <div className="px-auto py-6">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Offer Management</h1>
          <Link
            to="/admin/add-offer"
            className="btn-primary flex items-center gap-2"
          >
            <Plus />
            Add Offer
          </Link>
        </div>

        <div className="glass-morphism rounded-lg shadow-lg p-4 mb-4">
          <div className="relative flex justify-center items-center">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
              placeholder="Search offers... (Ctrl+F)"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search offers"
              disabled={currentState.isLoading && !allOffers.length}
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

          {isSearchMode && (
            <div className="text-sm mt-2 text-text-muted">
              {isLoadingSearchOffers ? 'Searching...' :
                `Found ${allOffers.length} ${allOffers.length === 1 ? 'offer' : 'offers'} for "${debouncedSearchTerm}"`}
              {allOffers.length > 0 && (
                <button
                  className="ml-2 text-primary-500 hover:underline"
                  onClick={handleClearSearch}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
        <OfferDataTable
          collection={allOffers}
          isLoading={currentState.isLoading}
          isError={currentState.isError}
          error={currentState.error}
          hasNextPage={currentState.hasNextPage}
          isFetchingNextPage={currentState.isFetchingNextPage}
          onLoadMore={currentState.fetchNextPage}
          onProductAction={handleOfferEdit}
          actionLabel="Edit"
          actionIcon={<Edit size={16} />}
          infiniteScrollRef={loadMoreRef}
          emptyStateMessage={
            isSearchMode
              ? "No offers match your search. Try a different query."
              : "No offers found. Add your first offer to get started!"
          }
        />
      </div>

      <div className="mt-4 text-center text-sm text-text-muted">
        Press <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Ctrl+F</kbd> to search | <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Esc</kbd> to clear search
      </div>
    </div>
  );
};

export default AdminOffer;