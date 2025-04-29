import React from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../../components/cards/ProductCard';
import { useGetCollectionById } from '../../lib/query/queriesAndMutation';

const Collections = () => {
  // grab type from url
  const { slug } = useParams()

  const {
    data: collections,
    isLoading: collectionLoading,
    isError: collectionError,
  } = useGetCollectionById(slug);

  // console.log(collections.collection);

  const formatString = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (collectionLoading) return <div className="text-white text-center py-10">Loading...</div>;
  if (collectionError) return <div className="text-red-500 text-center py-10">Error loading collection</div>;

  return (
    <>
      <div className='flex flex-col justify-center items-center'>
        {/* banner */}
        <div className='w-fit h-fit'>
          <img
            src={collections.collection.bannerImageUrl}
            className='w-fit h-fit object-cover'
            alt={collections.collection.name} />
        </div>

        <h1 className='text-3xl font-bold text-white mt-10'>
          {formatString(slug)}
        </h1>

        {/* products */}
        <div className="container mx-auto px-2 sm:px-4 py-6 mt-2">
          {/* <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {collections.products.map(product => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Collections