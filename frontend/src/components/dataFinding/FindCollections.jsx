import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useGetAllCollections, useSearchCollections } from '../../lib/query/queriesAndMutation';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
import CollectionDataLabel from '../common/CollectionDataLabel';

const FindCollections = ({ onSelectCollection, selectedCollectionId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  
  // Parse the selectedCollectionId into an array if not already
  const selectedCollectionIds = Array.isArray(selectedCollectionId) 
    ? selectedCollectionId 
    : selectedCollectionId ? [selectedCollectionId] : [];
  
  // Setup intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Fetch all collections when no search query
  const {
    data: allCollectionsData,
    fetchNextPage: fetchNextAllCollections,
    isFetchingNextPage: isFetchingNextAllCollections,
    hasNextPage: hasNextAllCollections,
    isLoading: isLoadingAllCollections,
    isError: isErrorAllCollections,
  } = useGetAllCollections();

  // Search collections when search query exists
  const {
    data: searchCollectionsData,
    fetchNextPage: fetchNextSearchCollections,
    isFetchingNextPage: isFetchingNextSearchCollections,
    hasNextPage: hasNextSearchCollections,
    isLoading: isLoadingSearchCollections,
    isError: isErrorSearchCollections,
  } = useSearchCollections(debouncedSearchTerm);

  // Determine which data to use based on search state
  const collectionsData = debouncedSearchTerm ? searchCollectionsData : allCollectionsData;
  const isFetchingNextPage = debouncedSearchTerm ? isFetchingNextSearchCollections : isFetchingNextAllCollections;
  const hasNextPage = debouncedSearchTerm ? hasNextSearchCollections : hasNextAllCollections;
  const fetchNextPage = debouncedSearchTerm ? fetchNextSearchCollections : fetchNextAllCollections;
  const isLoading = debouncedSearchTerm ? isLoadingSearchCollections : isLoadingAllCollections;
  const isError = debouncedSearchTerm ? isErrorSearchCollections : isErrorAllCollections;

  // Format collections from paginated data
  const collections = collectionsData?.pages?.flatMap(page => page.collections) || [];

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Load more when intersection observer detects the element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search errors specifically
  useEffect(() => {
    if (isErrorSearchCollections && debouncedSearchTerm) {
      toast.error("Failed to search collections. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [isErrorSearchCollections, debouncedSearchTerm]);

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search collections"
          disabled={isLoading && !collections.length} // Disable during initial load
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
        <div className="text-sm text-text-muted mb-2">
          {isLoadingSearchCollections ? (
            <span>Searching for "{debouncedSearchTerm}"...</span>
          ) : (
            <span>
              {collections.length} result{collections.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
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
            <p>Error loading collections. Please try again.</p>
            <button 
              onClick={() => debouncedSearchTerm ? fetchNextSearchCollections() : fetchNextAllCollections()}
              className="mt-2 px-4 py-2 bg-surface hover:bg-surface/70 rounded-md text-sm"
              aria-label="Retry loading collections"
            >
              Retry
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-4 text-text-muted">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span>{debouncedSearchTerm ? "Searching collections..." : "Loading collections..."}</span>
              </div>
            ) : debouncedSearchTerm ? (
              "No matching collections found"
            ) : (
              "No collections available"
            )}
          </div>
        ) : (
          <>
            {collections.map(collection => (
              <CollectionDataLabel
                key={collection._id}
                collection={collection}
                isSelected={selectedCollectionIds.includes(collection._id)}
                onClick={onSelectCollection}
              />
            ))}

            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="text-center py-2">
                <div 
                  className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
                  role="status"
                >
                  <span className="sr-only">Loading more collections...</span>
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
            {hasNextPage && !isFetchingNextPage && collections.length >= 10 && (
              <button
                className="w-full text-center py-2 text-sm text-primary-400 hover:text-primary-300"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                aria-label="Load more collections"
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

FindCollections.propTypes = {
  onSelectCollection: PropTypes.func.isRequired,
  selectedCollectionId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ])
};

export default FindCollections;