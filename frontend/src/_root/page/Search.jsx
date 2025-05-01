import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useExtreamSearch } from '../../lib/query/queriesAndMutation';
import ProductCard from '../../components/cards/ProductCard';
import { LoaderCircle, PackageSearch } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';

  const {
    data: searchResults,
    isLoading: loadingSearchResults,
    isError: errorSearchResults,
  } = useExtreamSearch(query);

  useEffect(() => {
    if (searchResults) {
      setProducts(searchResults.products || []);
      setCollections(searchResults.collections || []);
      setOffers(searchResults.offers || []);
      setLoading(false);
    }
  }, [searchResults]);

  useEffect(() => {
    setLoading(loadingSearchResults);
  }, [loadingSearchResults]);

  useEffect(() => {
    if (errorSearchResults) {
      console.error('Error fetching search results:', errorSearchResults);
    }
  }, [errorSearchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value.trim();
    console.log('Search submitted with value:', searchValue);
    if (searchValue) {
      setSearchParams({ q: searchValue });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="w-full h-fit px-4 md:px-8 lg:px-30 mt-20">

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-2 max-w-xl mx-auto glass-morphism p-2 rounded-full">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search products, collections, offers..."
            className="flex-1 p-3 bg-transparent border-none rounded-full focus:outline-none text-white placeholder-gray-400"
            autoFocus
          />
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2"
          >
            <span>Search</span>
            <PackageSearch className="w-5 h-5" />
          </button>
        </div>
      </form>

      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search results for "${query}"` : 'Search Products'}
      </h1>
      {/* Results section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="mb-4">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary-500" />
          </div>
          <p className="text-primary-300 font-medium">Finding results for you...</p>
        </div>
      ) : products.length > 0 ? (
        <div className='mb-10'>
          <h2 className="text-xl font-semibold mb-4 text-primary-300">Products ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id || product.id} >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {collections.length > 0 && (
            <div className="mt-10 w-full h-fit">
              {collections.map(collection => (
                <Link
                  key={collection._id || collection.id || collection.slug}
                  to={`/collections/${collection.slug}`}
                >
                  <img
                    src={collection.bannerImageUrl}
                    alt={collection.name || "Collection"}
                    className="w-full h-fit object-cover"
                  />
                </Link>
              ))}
            </div>
          )}

          {offers.length > 0 && (
            <div className="mt-10 section-divider">
              <h2 className="text-xl font-semibold mb-6 text-primary-300">Offers ({offers.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {offers.map(offer => (
                  <div
                    key={offer._id || offer.id}
                    className="comic-border bg-surface p-5 rounded-lg transition-all hover:scale-[1.02]"
                  >
                    <h3 className="text-lg font-bold text-primary-300 mb-2">{offer.offerName}</h3>
                    {offer.description && (
                      <p className="text-sm text-gray-400 mb-3">{offer.description}</p>
                    )}
                    {offer.discountPercent && (
                      <div className="inline-block bg-primary-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {offer.discountPercent}% OFF
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        query ? (
          <div className="text-center py-16 rounded-lg">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-primary-300 mb-2">No results found</h3>
            <p className="text-gray-400 mb-6">
              We couldn't find any matches for "{query}"
            </p>
            <p className="text-gray-500 max-w-md mx-auto">
              Try checking for typos or using more general terms.
            </p>
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg">
            <svg className="w-20 h-20 mx-auto text-primary-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-primary-300 mb-2">Start searching</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Type in the search box above to discover products, collections and special offers.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Search;