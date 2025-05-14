import OfferDetailsCard from '../../components/cards/OfferDetailsCard';
import { useGetAllOffers } from '../../lib/query/queriesAndMutation';
import { Loader2, AlertCircle, Tag } from 'lucide-react';

const Offers = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetAllOffers();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16 flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-text-muted font-medium">Loading offers...</p>
        <p className="text-text-muted text-sm mt-1">Please wait while we fetch the best deals for you</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16 flex flex-col justify-center items-center min-h-[60vh] bg-surface rounded-lg shadow-sm">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold text-error mb-2">Something went wrong</h2>
        <p className="text-text-muted mb-4">{error.message || "Failed to load offers"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-secondary"
          aria-label="Try again"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Extract offers from all pages instead of just the first page
  const offers = data?.pages?.flatMap(page => page?.offers || []) || [];

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text">Special Offers</h1>
        <p className="text-text-muted mt-2">Discover our exclusive deals and discounts</p>
      </header>

      {offers.length === 0 ? (
        <div className="bg-surface rounded-lg shadow-sm p-12 flex flex-col items-center text-text-muted">
          <Tag className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No offers available at the moment</p>
          <p className="text-sm">Check back soon for exciting deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {offers.map(offer => (
            <OfferDetailsCard key={offer._id} offer={offer} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn-primary flex items-center gap-2 px-6 py-2 rounded-md"
            aria-label={isFetchingNextPage ? "Loading more offers" : "Load more offers"}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more offers...</span>
              </>
            ) : (
              <>Load More Offers</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Offers;