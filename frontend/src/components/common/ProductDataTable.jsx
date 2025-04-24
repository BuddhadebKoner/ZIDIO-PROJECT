import React from 'react';
import { useInView } from 'react-intersection-observer';
import { LoaderCircle } from 'lucide-react';

const ProductDataTable = ({
  products = [],
  isLoading = false,
  isError = false,
  error = null,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore = () => { },
  onProductAction = () => { },
  actionLabel = "Edit",
  actionIcon = null,
  infiniteScrollRef = null,
  emptyStateMessage = "No products found",
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  const scrollRef = infiniteScrollRef || ref;

  return (
    <div className="glass-morphism rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700" role="grid" aria-label="Products table">
          <thead style={{ background: 'rgba(30, 30, 30, 0.8)' }}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Product Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Categories
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-text-muted">
                  <div className="flex justify-center items-center space-x-2">
                    <LoaderCircle className="animate-spin h-5 w-5" />
                    <span>Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center" style={{ color: 'var(--color-error)' }}>
                  Error: {error?.message || "Failed to load products"}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-surface transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text">{product.title}</div>
                    {product.subTitle && <div className="text-sm text-text-muted">{product.subTitle}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text">₹{product.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {Array.isArray(product.size) ? product.size.join(', ') : product.size}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {product.categories?.map((cat, idx) => (
                      <div key={`${product._id}-cat-${idx}`}>
                        {cat.main} / {cat.sub}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => onProductAction(product)}
                      className="text-accent-400 hover:text-accent-300 mr-3 transition-colors flex items-center gap-1"
                      aria-label={`${actionLabel} ${product.title}`}>
                      {actionIcon}
                      {actionLabel}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div
          ref={scrollRef}
          className="py-4 text-center text-text-muted border-t border-gray-700"
        >
          {isFetchingNextPage ? (
            <div className="flex justify-center items-center space-x-2">
              <LoaderCircle className="animate-spin h-4 w-4" />
              <span>Loading more...</span>
            </div>
          ) : 'Scroll to load more'}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductDataTable);