import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useGetAllCollections, useSearchCollections } from '../../lib/query/queriesAndMutation';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const FindCollections = ({ onSelectCollection, selectedCollectionId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

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

  // Load more collections when scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 5 && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isFetchingNextPage, hasNextPage]);

  // Handle search errors specifically
  useEffect(() => {
    if (isErrorSearchCollections && debouncedSearchTerm) {
      toast.error("Failed to search collections. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [isErrorSearchCollections, debouncedSearchTerm]);

  // Add a loading indicator for the initial search
  const isInitialSearchLoading = debouncedSearchTerm && isLoadingSearchCollections && !searchCollectionsData;

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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
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
        className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-2 border border-gray-700 rounded-md p-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isError ? (
          <div className="text-center py-4 text-red-400">
            <p>Error loading collections. Please try again.</p>
            <button 
              onClick={() => debouncedSearchTerm ? fetchNextSearchCollections() : fetchNextAllCollections()}
              className="mt-2 px-4 py-2 bg-surface hover:bg-surface/70 rounded-md text-sm"
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
              <div
                key={collection._id}
                className={`p-3 border ${selectedCollectionId === collection._id ? 'border-primary-500' : 'border-gray-700'} 
                  rounded-md cursor-pointer hover:bg-surface/70 transition-all ${selectedCollectionId === collection._id ? 'ring-2 ring-primary-500 bg-surface/70' : ''
                  }`}
                onClick={() => onSelectCollection(collection._id, collection.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={collection.bannerImageUrl}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=Collection';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{collection.name}</h3>
                    <p className="text-xs text-text-muted truncate">{collection.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}

            {isFetchingNextPage && (
              <div className="text-center py-2">
                <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && (
              <button
                className="w-full text-center py-2 text-sm text-primary-400 hover:text-primary-300"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
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
  selectedCollectionId: PropTypes.string
};

export default FindCollections;