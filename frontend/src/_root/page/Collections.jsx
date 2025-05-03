import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../../components/cards/ProductCard';
import { useGetCollectionById, useGetCollectionProducts } from '../../lib/query/queriesAndMutation';
import FullPageLoader from '../../components/loaders/FullPageLoader';

const Collections = () => {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const {
    data: collections,
    isLoading: collectionLoading,
    isError: collectionError,
  } = useGetCollectionById(slug);

  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
    error,
    refetch
  } = useGetCollectionProducts(slug, currentPage, itemsPerPage);

  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  const formatString = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const products = data?.pages?.[0]?.products || [];
  const totalPages = data?.pages?.[0]?.totalPages || 0;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (collectionLoading || (productsLoading && !data)) {
    return <FullPageLoader />;
  }

  if (collectionError || productsError) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="bg-red-900/30 p-6 rounded-lg border border-red-500 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-white mb-4">
            {error?.message || "We couldn't load the collection. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='w-full h-60 md:h-80 overflow-hidden'>
        <img
          src={collections.collection.bannerImageUrl}
          className='w-full h-full object-cover'
          alt={collections.collection.name}
        />
      </div>

      <h1 className='text-3xl font-bold text-white mt-10'>
        {formatString(slug)}
      </h1>

      {collections.collection.description && (
        <p className="text-gray-300 max-w-2xl text-center px-4 mb-4 mt-2">
          {collections.collection.description}
        </p>
      )}

      <div className="container mx-auto px-2 sm:px-4 py-6 mt-2">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id || `product-${index}`}
                  product={product}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={`page-${i + 1}`}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-full ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-white text-xl">No products found in this collection</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Collections