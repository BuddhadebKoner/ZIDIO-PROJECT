import { useEffect, useRef } from "react";
import { useGetAllCollections } from "../../lib/query/queriesAndMutation";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Import Lucide React loader
import FullPageLoader from "../../components/loaders/FullPageLoader";

const Collections = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetAllCollections();

  // Reference for the intersection observer target
  const observerTarget = useRef(null);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Extract collections from the data
  const collections = data?.pages?.flatMap(page =>
    page?.collections || []
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen mt-20">
      {/* Header section with stylish title */}
      <div className="text-center mb-12 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-bg-white">
          Our <span className="text-primary-500">Collections</span>
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Discover our carefully curated collections featuring the hottest designs and latest trends
        </p>
      </div>

      {/* Error state */}
      {isError && (
        <div className="text-center py-10">
          <p className="text-error mb-4">Something went wrong!</p>
          <p className="text-text-muted">{error?.message || "Failed to load collections"}</p>
        </div>
      )}

      {/* Loading state using Lucide React */}
      {isLoading && !collections.length ? (
        <>
          <FullPageLoader />
        </>
      ) : (
        <>
          {/* Collections grid with banner-style cards */}
          <div className="w-full flex flex-col gap-8">
            {collections.map((collection) => (
              <Link
                to={`/collections/${collection.slug}`}
                key={collection._id}
                className="block w-full"
              >
                <div className="premium-card relative h-0 pb-[30%] md:pb-[25%] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-[1.01] group">
                  {/* Banner image with proper aspect ratio */}
                  <img
                    src={collection.bannerImageUrl}
                    alt={collection.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

                  {/* Featured badge */}
                  {collection.isFeatured && (
                    <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs md:text-sm font-medium py-1 px-3 rounded-full shadow-md z-10">
                      Featured
                    </div>
                  )}

                  {/* Collection info overlaid on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 text-white z-10">
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 group-hover:text-primary-300 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-gray-200 text-xs md:text-sm line-clamp-2 mb-2 md:mb-3 opacity-90">
                      {collection.subtitle}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium bg-white/20 backdrop-blur-sm py-1 px-2 rounded-md">
                        {collection.products.length} products
                      </span>
                      <span className="text-xs md:text-sm inline-flex items-center font-medium group-hover:text-primary-300 transition-colors">
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Observer target for infinite scroll with Lucide loader */}
          <div
            ref={observerTarget}
            className="w-full h-20 flex items-center justify-center mt-8"
          >
            {isFetchingNextPage && (
              <Loader2 className="text-primary-500 animate-spin mr-2" size={24} />
            )}
            {!hasNextPage && collections.length > 0 && (
              <p className="text-text-muted text-sm">You've seen all collections</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Collections;