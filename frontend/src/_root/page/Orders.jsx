import React, { useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import FullPageLoader from '../../components/loaders/FullPageLoader';
import AccountOrderCard from '../../components/shared/AccountOrderCard';
import { useGetAllOrders } from '../../lib/query/queriesAndMutation';

const Orders = () => {
  const {
    isLoading: isAuthLoading
  } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isOrdersLoading,
    isError,
    error
  } = useGetAllOrders();

  // Create a ref for the last order element (for intersection observer)
  const observerRef = useRef(null);

  // Handle intersection to load more data when user scrolls to bottom
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver, data]);

  // Extract orders from all pages
  const orders = data?.pages.flatMap(page => page.orders || []) || [];
  const hasOrders = orders.length > 0;

  if (isAuthLoading || isOrdersLoading) {
    return <FullPageLoader />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="comic-border red-velvet-border p-8 text-center bg-surface rounded-lg">
          <h3 className="text-xl font-bold mb-4">Error loading orders</h3>
          <p className="text-text-muted mb-6">
            {error?.message || 'Failed to load orders. Please try again later.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary inline-block">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // console.log('Orders:', data);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-text-muted">View and track all your orders</p>
      </div>

      {hasOrders ? (
        <div className="space-y-6">
          {orders.map((order, index) => {
            // Add ref to the last element for infinite scrolling
            if (orders.length === index + 1) {
              return (
                <div key={order._id} ref={observerRef}>
                  <AccountOrderCard order={order} />
                </div>
              );
            } else {
              return <AccountOrderCard key={order._id} order={order} />;
            }
          })}

          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading more orders...
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="comic-border red-velvet-border p-8 text-center bg-surface rounded-lg">
          <h3 className="text-xl font-bold mb-4">No orders yet</h3>
          <p className="text-text-muted mb-6">You haven't placed any orders yet.</p>
          <a href="/shop" className="btn-primary inline-block">
            Start Shopping
          </a>
        </div>
      )}
    </div>
  )
}

export default Orders