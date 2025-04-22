import { Edit, Plus, Search, X } from 'lucide-react'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetAllCollections, useSearchCollections } from '../../lib/query/queriesAndMutation';
import CollectionDataTable from '../../components/common/CollectionDataTable';

const AdminCollection = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { slug } = useParams();

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetAllCollections();

  const {
    data: searchCollectionsData,
    fetchNextPage: fetchNextSearchCollections,
    isFetchingNextPage: isFetchingNextSearchCollections,
    hasNextPage: hasNextSearchCollections,
    isLoading: isLoadingSearchCollections,
    isError: isErrorSearchCollections,
    error: searchError,
  } = useSearchCollections(debouncedSearchTerm);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const isSearchMode = !!debouncedSearchTerm;

  const allCollections = useMemo(() => {
    const pagesData = isSearchMode ? searchCollectionsData?.pages : data?.pages;
    if (!pagesData) return [];
    
    return pagesData.flatMap(page => 
      page.collections || page.data || page
    );
  }, [data, searchCollectionsData, isSearchMode]);

  const currentState = useMemo(() => ({
    isLoading: isSearchMode ? isLoadingSearchCollections : isLoading,
    isError: isSearchMode ? isErrorSearchCollections : isError,
    error: isSearchMode ? searchError : error,
    hasNextPage: isSearchMode ? hasNextSearchCollections : hasNextPage,
    isFetchingNextPage: isSearchMode ? isFetchingNextSearchCollections : isFetchingNextPage,
    fetchNextPage: isSearchMode ? fetchNextSearchCollections : fetchNextPage
  }), [
    isSearchMode, 
    isLoadingSearchCollections, isLoading,
    isErrorSearchCollections, isError,
    searchError, error,
    hasNextSearchCollections, hasNextPage,
    isFetchingNextSearchCollections, isFetchingNextPage,
    fetchNextSearchCollections, fetchNextPage
  ]);

  const handleCollectionEdit = useCallback((collection) => {
    navigate(`/admin/collection/${collection.slug}`);
  }, [navigate]);

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
          <h1 className="text-2xl font-bold">Collection Management</h1>
          <Link
            to="/admin/add-collection"
            className="btn-primary flex items-center gap-2"
          >
            <Plus />
            Add Collection
          </Link>
        </div>

        <div className="glass-morphism rounded-lg shadow-lg p-4 mb-4">
          <div className="relative flex justify-center items-center">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-4 py-3 pl-10 pr-10 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
              placeholder="Search collections... (Ctrl+F)"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search collections"
              disabled={currentState.isLoading && !allCollections.length}
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
              {isLoadingSearchCollections ? 'Searching...' :
                `Found ${allCollections.length} ${allCollections.length === 1 ? 'collection' : 'collections'} for "${debouncedSearchTerm}"`}
              {allCollections.length > 0 &&
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
        <CollectionDataTable
          collection={allCollections}
          isLoading={currentState.isLoading}
          isError={currentState.isError}
          error={currentState.error}
          hasNextPage={currentState.hasNextPage}
          isFetchingNextPage={currentState.isFetchingNextPage}
          onLoadMore={currentState.fetchNextPage}
          onProductAction={handleCollectionEdit}
          actionLabel="Edit"
          actionIcon={<Edit size={16} />}
          infiniteScrollRef={loadMoreRef}
          emptyStateMessage={
            isSearchMode
              ? "No collections match your search. Try a different query."
              : "No collections found. Add your first collection to get started!"
          }
        />
      </div>

      <div className="mt-4 text-center text-sm text-text-muted">
        Press <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Ctrl+F</kbd> to search | <kbd className="px-2 py-1 bg-surface border border-gray-700 rounded-md">Esc</kbd> to clear search
      </div>
    </div>
  );
};

export default AdminCollection;