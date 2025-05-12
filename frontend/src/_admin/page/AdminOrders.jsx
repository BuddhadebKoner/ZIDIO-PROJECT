import React, { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useGetOrdersWithQuery } from '../../lib/query/queriesAndMutation'
import { useSearchParams, useNavigate } from 'react-router-dom'
import OrderCard from '../../components/cards/OrderCard'

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    orderType: searchParams.get('orderType') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    minAmount: searchParams.get('minAmount') || '',
    maxAmount: searchParams.get('maxAmount') || '',
    search: searchParams.get('search') || '',
    trackId: searchParams.get('trackId') || '',
    sort: searchParams.get('sort') || '-createdAt'
  })

  // Create a ref for the loadMore element
  const { ref, inView } = useInView()

  // Setup infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch
  } = useGetOrdersWithQuery(filters)

  // Fetch next page when the load more element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log('Loading next page of orders...')
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    setSearchParams(params)
  }, [filters, setSearchParams])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      orderType: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: '',
      trackId: '',
      sort: '-createdAt'
    })
  }

  // Flatten pages to get all orders
  const allOrders = data?.pages.flatMap(page => page.orders || []) || []

  return (
    <div className="admin-orders-container p-4 md:p-6">
      {/* Update the header section for better responsiveness */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleResetFilters}
            className="btn-secondary w-full sm:w-auto px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filters section with improved responsiveness */}
      <div className="filters bg-surface/30 p-4 rounded-lg mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Status filter */}
          <div className="filter-item">
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Payment Status filter */}
          <div className="filter-item">
            <label htmlFor="paymentStatus" className="block text-sm font-medium mb-1">Payment Status:</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Order Type filter */}
          <div className="filter-item">
            <label htmlFor="orderType" className="block text-sm font-medium mb-1">Order Type:</label>
            <select
              id="orderType"
              name="orderType"
              value={filters.orderType}
              onChange={handleFilterChange}
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All</option>
              <option value="COD">COD</option>
              <option value="ONLINE">ONLINE</option>
              <option value="COD+ONLINE">COD+ONLINE</option>
            </select>
          </div>

          {/* Search filter */}
          <div className="filter-item">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search:</label>
            <input
              id="search"
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search orders..."
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Track ID filter */}
          <div className="filter-item">
            <label htmlFor="trackId" className="block text-sm font-medium mb-1">Track ID:</label>
            <input
              id="trackId"
              type="text"
              name="trackId"
              value={filters.trackId}
              onChange={handleFilterChange}
              placeholder="Track ID"
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Sort By filter */}
          <div className="filter-item">
            <label htmlFor="sort" className="block text-sm font-medium mb-1">Sort By:</label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-payableAmount">Amount High to Low</option>
              <option value="payableAmount">Amount Low to High</option>
            </select>
          </div>

          {/* Date Range filter - spans 2 columns on larger screens */}
          <div className="filter-item sm:col-span-2">
            <label htmlFor="dateRange" className="block text-sm font-medium mb-1">Date Range:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
                  placeholder="Start Date"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Amount Range filter */}
          <div className="filter-item">
            <label htmlFor="amountRange" className="block text-sm font-medium mb-1">Amount Range:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full bg-surface border border-gray-700 rounded p-2.5 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status indicators with better styling */}
      {status === 'loading' && (
        <div className="glass-morphism p-8 rounded-lg mb-6 flex justify-center items-center">
          <div className="animate-pulse text-center">
            <p className="text-lg">Loading orders...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="glass-morphism p-8 rounded-lg mb-6 bg-error/20 border border-error">
          <p className="text-error text-center">Error: {error?.message || 'Failed to load orders'}</p>
        </div>
      )}

      {status === 'success' && allOrders.length === 0 && (
        <div className="glass-morphism p-8 rounded-lg mb-6 text-center">
          <p className="text-xl">No orders found</p>
          <p className="text-text-muted mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Order count summary - improved responsiveness */}
      {status === 'success' && allOrders.length > 0 && (
        <div className="glass-morphism p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-sm sm:text-base">Total: <span className="font-bold">{data?.pages?.[0]?.totalOrders || 0}</span> orders</p>
          <p className="text-sm sm:text-base">Showing: <span className="font-bold">{allOrders.length}</span> orders</p>
        </div>
      )}

      {/* Order cards list */}
      {status === 'success' && allOrders.length > 0 && (
        <div className="orders-list">
          {allOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="text-center p-4">
          <p className="text-text-muted">Loading more orders...</p>
        </div>
      )}

      {/* Load more trigger element */}
      {hasNextPage && <div ref={ref} style={{ height: '30px' }}></div>}
    </div>
  )
}

export default AdminOrders